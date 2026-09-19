const {
  enviarEmail,
  isValidEmail,
  paraAnexoNodemailer,
  montarTextoPlano,
  montarEmailHtml,
} = require('./_lib/mailer');

// Versioned query string busts any stale "failed to fetch" cache that a mail
// provider's image proxy may have kept from an earlier deploy.
const LOGO_GESTAO_URL = 'https://catec.vercel.app/images/logo-gestao-una-email.png?v=2';

module.exports = async function handler(req, res) {
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

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Email inválido' });
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

    const html = montarEmailHtml({
      logoUrl: LOGO_GESTAO_URL,
      logoAlt: 'Gestão Una',
      logoLargura: 160,
      logoAltura: 32,
      corPrimaria: '#00bfa5',
      corEscura: '#181328',
      corFundoSuave: 'rgba(0, 191, 165, 0.08)',
      subtitulo: 'Novo agendamento recebido pelo site',
      siteUrl: 'https://catecsolucoes.com.br/gestao-una',
      campos,
      temAnexo: attachments.length > 0,
    });

    await enviarEmail({
      from: `"Formulário Gestão Una" <${process.env.GMAIL_USER}>`,
      to: process.env.MAIL_TO_GESTAO || process.env.MAIL_TO || process.env.GMAIL_USER,
      replyTo: email,
      subject: `Novo agendamento Gestão Una - ${name}`,
      text: montarTextoPlano(campos),
      html,
      attachments,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao enviar email do Gestão Una:', error);
    return res.status(500).json({ error: 'Falha ao enviar email' });
  }
};
