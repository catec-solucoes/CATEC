const {
  enviarEmail,
  isValidEmail,
  paraAnexoNodemailer,
  montarTextoPlano,
  montarEmailHtml,
} = require('./_lib/mailer');

const LOGO_SISAMB_URL = 'https://catec.vercel.app/images/logo-sisamb-email.png';

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
      logoUrl: LOGO_SISAMB_URL,
      logoAlt: 'SISAMB',
      logoLargura: 140,
      logoAltura: 47,
      corPrimaria: '#00c29d',
      corEscura: '#2a2f35',
      corFundoSuave: 'rgba(0, 194, 157, 0.08)',
      subtitulo: 'Novo agendamento recebido pelo site',
      siteUrl: 'https://sisamb.eco',
      campos,
      temAnexo: attachments.length > 0,
    });

    await enviarEmail({
      from: `"Formulário SISAMB" <${process.env.GMAIL_USER}>`,
      to: process.env.MAIL_TO_SISAMB || process.env.MAIL_TO || process.env.GMAIL_USER,
      replyTo: email,
      subject: `Novo agendamento SISAMB - ${name}`,
      text: montarTextoPlano(campos),
      html,
      attachments,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao enviar email do SISAMB:', error);
    return res.status(500).json({ error: 'Falha ao enviar email' });
  }
};
