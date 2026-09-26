const {
  enviarEmail,
  erroDeValidacao,
  paraAnexoNodemailer,
  montarTextoPlano,
  montarEmailHtml,
  aplicarCors,
  anexoLogoInline,
} = require('./_lib/mailer');

module.exports = async function handler(req, res) {
  if (aplicarCors(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const {
    name,
    document,
    address,
    email,
    phone,
    preferredDate,
    preferredTime,
    description,
    anexoImagem,
    anexoDocumento,
  } = req.body || {};

  if (!name || !email || !description) {
    return res.status(400).json({
      error: 'Campos obrigatórios: name, email, description',
    });
  }

  const erroValidacao = erroDeValidacao({ email, document, preferredDate, preferredTime });
  if (erroValidacao) {
    return res.status(400).json({ error: erroValidacao });
  }

  let attachments;
  try {
    attachments = [paraAnexoNodemailer(anexoImagem), paraAnexoNodemailer(anexoDocumento)].filter(
      Boolean,
    );
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  try {
    const campos = {
      name,
      document,
      address,
      email,
      phone,
      preferredDate,
      preferredTime,
      description,
    };

    // Computed before the logo is added below, so it only reflects what the
    // visitor actually attached (the logo isn't a real attachment to them).
    const temAnexo = attachments.length > 0;
    const logoCid = 'logo-catec-email';

    const html = montarEmailHtml({
      logoCid,
      logoAlt: 'CATEC Soluções',
      logoLargura: 140,
      logoAltura: 53,
      corPrimaria: '#f26522',
      corEscura: '#131a2b',
      corFundoSuave: 'rgba(242, 101, 34, 0.06)',
      corFundoTopo: '#131a2b',
      corTextoTopo: '#b9c0d0',
      subtitulo: 'Nova solicitação recebida pelo site',
      siteUrl: 'https://catecsolucoes.com.br',
      campos,
      temAnexo,
    });

    await enviarEmail({
      from: `"Formulário CATEC" <${process.env.GMAIL_USER}>`,
      to: process.env.MAIL_TO || process.env.GMAIL_USER,
      replyTo: email,
      subject: `Nova solicitação recebida pelo site - ${name}`,
      text: montarTextoPlano(campos),
      html,
      attachments: [...attachments, anexoLogoInline('logo-catec-email.png', logoCid)],
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return res.status(500).json({ error: 'Falha ao enviar email' });
  }
};
