import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { MarcaOrcamento, OrcamentoService } from './orcamento.service';

type TipoPessoa = 'fisica' | 'juridica';
type StatusEnvio = 'idle' | 'enviando' | 'sucesso' | 'erro';
type Toast = { tipo: 'sucesso' | 'erro'; mensagem: string };
type TipoAnexo = 'imagem' | 'documento';
type Anexo = { nome: string; tipo: string; base64: string };

const DURACAO_TOAST_MS = 5000;
// Kept well under Vercel's request body limit, since both files travel as
// base64 (~33% larger) inside the same JSON payload as the rest of the form.
const TAMANHO_MAX_ANEXO_BYTES = 3 * 1024 * 1024;

// Quote request modal: form, validation and submission via the /api/send-email backend.
@Component({
  selector: 'app-orcamento-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './orcamento-modal.component.html',
  styleUrl: './orcamento-modal.component.scss',
})
export class OrcamentoModalComponent {
  @ViewChild('orcamentoForm') formRef!: ElementRef<HTMLFormElement>;

  private readonly orcamentoService = inject(OrcamentoService);
  readonly isOpen = this.orcamentoService.isOpen;
  readonly marca = this.orcamentoService.marca;

  tipoPessoa = signal<TipoPessoa>('fisica');
  status = signal<StatusEnvio>('idle');
  tentouEnviar = signal(false);
  toast = signal<Toast | null>(null);
  private toastTimeoutId?: ReturnType<typeof setTimeout>;

  nome = '';
  documento = '';
  endereco = '';
  email = '';
  telefone = '';
  descricao = '';
  dataPreferida = '';
  horaPreferida = '';

  imagemArquivo = signal<File | null>(null);
  documentoArquivo = signal<File | null>(null);
  imagemErro = signal<string | null>(null);
  documentoErro = signal<string | null>(null);

  readonly dataMinima = new Date().toISOString().split('T')[0];

  // Locks page scroll while the modal is open.
  constructor() {
    effect(() => {
      document.body.style.overflow = this.isOpen() ? 'hidden' : '';
    });
  }

  // Closes the modal and clears the form, so reopening it always starts fresh.
  fechar(): void {
    this.orcamentoService.fechar();
    this.reiniciar();
  }

  // Suffixes a field's id/name with the active brand, so the catec, sisamb
  // and gestao versions of this shared form never share an id/name — this
  // keeps browser autofill from mixing up remembered values between them.
  campoId(base: string): string {
    return `${base}-${this.marca()}`;
  }

  // Dismisses the success/error toast.
  fecharToast(): void {
    this.toast.set(null);
    clearTimeout(this.toastTimeoutId);
  }

  // Switches between individual (CPF) and company (CNPJ) and clears the document field.
  selecionarTipoPessoa(tipo: TipoPessoa): void {
    this.tipoPessoa.set(tipo);
    this.documento = '';
  }

  // Formats the document field as CPF or CNPJ while typing.
  onDocumentoInput(event: Event): void {
    const digitos = (event.target as HTMLInputElement).value.replace(/\D/g, '');
    this.documento =
      this.tipoPessoa() === 'fisica'
        ? this.mascararCpf(digitos)
        : this.mascararCnpj(digitos);
  }

  // Formats the phone field while typing.
  onTelefoneInput(event: Event): void {
    const digitos = (event.target as HTMLInputElement).value.replace(/\D/g, '');
    this.telefone = this.mascararTelefone(digitos);
  }

  // Applies the CPF mask (000.000.000-00).
  private mascararCpf(digitos: string): string {
    return digitos
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  // Applies the CNPJ mask (00.000.000/0000-00).
  private mascararCnpj(digitos: string): string {
    return digitos
      .slice(0, 14)
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }

  // Validates and stores a selected image or document, clearing it on error.
  onArquivoSelecionado(event: Event, tipo: TipoAnexo): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0] ?? null;
    const arquivoSignal = tipo === 'imagem' ? this.imagemArquivo : this.documentoArquivo;
    const erroSignal = tipo === 'imagem' ? this.imagemErro : this.documentoErro;

    if (!arquivo) {
      arquivoSignal.set(null);
      erroSignal.set(null);
      return;
    }

    if (arquivo.size > TAMANHO_MAX_ANEXO_BYTES) {
      arquivoSignal.set(null);
      erroSignal.set('Arquivo muito grande. Tamanho máximo: 3 MB.');
      input.value = '';
      return;
    }

    arquivoSignal.set(arquivo);
    erroSignal.set(null);
  }

  // Reads a File as a base64 string (without the "data:...;base64," prefix).
  private lerComoBase64(arquivo: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const resultado = reader.result as string;
        resolve(resultado.split(',')[1] ?? '');
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(arquivo);
    });
  }

  // Converts a selected file into the { nome, tipo, base64 } shape the backend expects.
  private async paraAnexo(arquivo: File | null): Promise<Anexo | null> {
    if (!arquivo) return null;
    return {
      nome: arquivo.name,
      tipo: arquivo.type || 'application/octet-stream',
      base64: await this.lerComoBase64(arquivo),
    };
  }

  // Applies the phone mask, handling both 10 and 11-digit numbers.
  private mascararTelefone(digitosBrutos: string): string {
    const digitos = digitosBrutos.slice(0, 11);
    if (digitos.length <= 10) {
      return digitos
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
    }
    return digitos
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  }

  // Converts the native ISO date value to BR format for the hidden form field sent by email.
  get dataPreferidaBr(): string {
    if (!this.dataPreferida) return '';
    const [ano, mes, dia] = this.dataPreferida.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  // True when the document field has a complete CPF or CNPJ.
  get documentoValido(): boolean {
    const digitos = this.documento.replace(/\D/g, '');
    return this.tipoPessoa() === 'fisica'
      ? digitos.length === 11
      : digitos.length === 14;
  }

  // True when the email field looks like a valid address.
  get emailValido(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
  }

  // True when the phone field has enough digits.
  get telefoneValido(): boolean {
    return this.telefone.replace(/\D/g, '').length >= 10;
  }

  // True when all required fields pass validation.
  get formularioValido(): boolean {
    return (
      this.nome.trim().length > 1 &&
      this.documentoValido &&
      this.endereco.trim().length > 3 &&
      this.emailValido &&
      this.telefoneValido
    );
  }

  // Validates and submits the form to the backend, then shows a success/error toast.
  async enviar(): Promise<void> {
    this.tentouEnviar.set(true);
    if (!this.formularioValido || this.status() === 'enviando') {
      return;
    }

    this.status.set('enviando');

    try {
      const [anexoImagem, anexoDocumento] = await Promise.all([
        this.paraAnexo(this.imagemArquivo()),
        this.paraAnexo(this.documentoArquivo()),
      ]);

      const endpoints: Record<MarcaOrcamento, string> = {
        catec: '/api/send-email',
        sisamb: '/api/send-email-sisamb',
        gestao: '/api/send-email-gestao',
      };
      const endpoint = endpoints[this.orcamentoService.marca()];

      const resposta = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: this.nome,
          document: this.documento,
          address: this.endereco,
          email: this.email,
          phone: this.telefone,
          preferredDate: this.dataPreferidaBr,
          preferredTime: this.horaPreferida,
          description: this.descricao,
          anexoImagem,
          anexoDocumento,
        }),
      });

      if (!resposta.ok) {
        throw new Error(`Falha no envio: ${resposta.status}`);
      }

      this.status.set('sucesso');
      this.fechar();
      this.mostrarToast(
        'sucesso',
        'Solicitação enviada! Nossa equipe vai entrar em contato em breve.',
      );
    } catch (erro) {
      console.error('Erro ao enviar solicitação de orçamento:', erro);
      this.status.set('erro');
      this.mostrarToast(
        'erro',
        'Não conseguimos enviar sua solicitação agora. Tente novamente.',
      );
    }
  }

  // Shows a toast and schedules its automatic dismissal.
  private mostrarToast(tipo: Toast['tipo'], mensagem: string): void {
    this.toast.set({ tipo, mensagem });
    clearTimeout(this.toastTimeoutId);
    this.toastTimeoutId = setTimeout(() => this.toast.set(null), DURACAO_TOAST_MS);
  }

  // Resets the form fields and status after a successful submission.
  private reiniciar(): void {
    this.nome = '';
    this.documento = '';
    this.endereco = '';
    this.email = '';
    this.telefone = '';
    this.descricao = '';
    this.dataPreferida = '';
    this.horaPreferida = '';
    this.imagemArquivo.set(null);
    this.documentoArquivo.set(null);
    this.imagemErro.set(null);
    this.documentoErro.set(null);
    this.tentouEnviar.set(false);
    this.status.set('idle');
    this.formRef?.nativeElement?.reset();
  }
}
