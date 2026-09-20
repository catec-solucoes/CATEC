const MailComposer = require('nodemailer/lib/mail-composer');
const { google } = require('googleapis');

const OAuth2 = google.auth.OAuth2;

// The email logos are PNGs from the site's public/images/ folder. They have to
// be PNG (WebP doesn't render in many mail clients) and referenced by absolute
// HTTPS URL: Gmail blocks data: URIs, and cid: attachments broke for recipients
// on other mail hosts. The URL uses the production domain rather than a
// *.vercel.app one so it keeps working wherever the site and this API are
// hosted (Vercel today, AWS later). Bump the version whenever a logo file
// changes so mail proxies don't keep serving a cached (or cached-as-missing) copy.
const LOGOS_BASE_URL = 'https://catecsolucoes.com.br/images';
const VERSAO_LOGOS = 3;

function urlDaLogo(nomeArquivo) {
  return `${LOGOS_BASE_URL}/${nomeArquivo}?v=${VERSAO_LOGOS}`;
}

// Lets this API be called cross-origin — the site is meant to work whether
// it's served from this same Vercel deployment or from a static host (e.g.
// AWS S3/CloudFront) that can't run these functions itself, so the frontend
// always calls this backend's absolute URL regardless of its own origin.
// No cookies/credentials are involved, so a wildcard origin is safe here.
function aplicarCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

// Reused across warm invocations of this function instance, so a repeat
// request doesn't have to round-trip to Google's OAuth endpoint again for
// an access token that's often still valid for most of an hour.
let cachedAccessToken = null;
let cachedAccessTokenExpiry = 0;

async function getAuthClient() {
  const oauth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground',
  );

  const bufferMs = 60_000;
  if (cachedAccessToken && Date.now() < cachedAccessTokenExpiry - bufferMs) {
    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
      access_token: cachedAccessToken,
      expiry_date: cachedAccessTokenExpiry,
    });
    return oauth2Client;
  }

  oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  const { token } = await oauth2Client.getAccessToken();
  cachedAccessToken = token;
  cachedAccessTokenExpiry = oauth2Client.credentials.expiry_date || Date.now() + 30 * 60_000;
  return oauth2Client;
}

// Builds the raw RFC 2822 MIME message (locally, no network) and delivers it
// with a single HTTPS call to the Gmail API - avoids opening a full SMTP
// session, which tends to be slower and less reliable from serverless functions.
async function enviarEmail(mailOptions) {
  const mail = new MailComposer(mailOptions);
  const message = await mail.compile().build();
  const raw = message
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const auth = await getAuthClient();
  const gmail = google.gmail({ version: 'v1', auth });
  await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
}

const TAMANHO_MAX_ANEXO_BYTES = 3 * 1024 * 1024;

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

// Validates an { nome, tipo, base64 } attachment payload and converts it to
// the shape nodemailer expects. Returns null for an absent/empty attachment.
function paraAnexoNodemailer(anexo) {
  if (!anexo || !anexo.base64) return null;
  if (!anexo.nome || typeof anexo.base64 !== 'string') {
    throw new Error('Anexo inválido');
  }
  const bytesAproximados = Math.ceil((anexo.base64.length * 3) / 4);
  if (bytesAproximados > TAMANHO_MAX_ANEXO_BYTES) {
    throw new Error('Anexo excede o tamanho máximo permitido (3 MB)');
  }
  return {
    filename: anexo.nome,
    content: anexo.base64,
    encoding: 'base64',
    contentType: anexo.tipo || 'application/octet-stream',
  };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Plain-text fallback for the quote-request notification, shown by clients
// that don't render HTML email.
function montarTextoPlano(campos) {
  return [
    ['Nome', campos.name],
    ['Documento', campos.document],
    ['Endereço', campos.address],
    ['E-mail', campos.email],
    ['Telefone', campos.phone],
    ['Data agendada', campos.preferredDate],
    ['Hora agendada', campos.preferredTime],
    ['Descrição', campos.description],
  ]
    .filter(([, valor]) => valor)
    .map(([campo, valor]) => `${campo}: ${valor}`)
    .join('\n');
}

// Shared HTML body for the quote-request notification emails. Each brand
// (catec, SISAMB, Gestão Una) passes its own logo and colors; the layout,
// field handling and attachment/footer notes stay identical so a fix here
// applies everywhere at once.
function montarEmailHtml({
  logoUrl,
  logoAlt,
  logoLargura,
  logoAltura,
  corPrimaria,
  corEscura,
  corFundoSuave,
  corFundoTopo = '#ffffff',
  corTextoTopo = '#64748b',
  subtitulo,
  siteUrl,
  campos: { name, document, address, email, phone, preferredDate, preferredTime, description },
  temAnexo,
}) {
  const linha = (rotulo, valor) =>
    valor
      ? `<tr><td style="padding: 6px 0; color: ${corEscura}; font-size: 14px;"><strong>${rotulo}:</strong> ${escapeHtml(valor)}</td></tr>`
      : '';

  // Catec's header keeps its original dark background; SISAMB and Gestão
  // Una use a white header with a colored accent border instead.
  const estiloTopo =
    corFundoTopo === '#ffffff'
      ? `background-color: #ffffff; border-bottom: 3px solid ${corPrimaria};`
      : `background-color: ${corFundoTopo};`;

  return `
    <div style="max-width: 520px; margin: 0 auto; font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; border: 1px solid #e2e2e2; border-radius: 12px; overflow: hidden;">
      <div style="${estiloTopo} padding: 20px 24px;">
        <img
          src="${logoUrl}"
          alt="${escapeHtml(logoAlt)}"
          width="${logoLargura}"
          height="${logoAltura}"
          style="display: block; width: ${logoLargura}px; height: ${logoAltura}px; margin: 0 0 8px;"
        />
        <p style="margin: 0; font-size: 13px; color: ${corTextoTopo};">${subtitulo}</p>
      </div>

      <div style="padding: 24px; background-color: #ffffff;">
        <p style="margin: 0 0 16px; font-size: 14px; color: #333333;">
          ${subtitulo}, enviado por <strong>${escapeHtml(name)}</strong>.
        </p>

        <div style="background-color: ${corFundoSuave}; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="font-weight: 700; font-size: 15px; color: ${corEscura}; margin-bottom: 4px;">${escapeHtml(name)}</div>
          ${document ? `<div style="font-size: 12px; color: #64748b; margin-bottom: 12px;">Documento: ${escapeHtml(document)}</div>` : ''}

          <table style="width: 100%; border-collapse: collapse;">
            ${linha('Endereço', address)}
            ${linha('E-mail', email)}
            ${linha('Telefone', phone)}
            ${linha('Data agendada', preferredDate)}
            ${linha('Hora agendada', preferredTime)}
          </table>
        </div>

        <div>
          <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: ${corEscura};">Descrição</p>
          <div style="background-color: ${corFundoSuave}; border-left: 3px solid ${corPrimaria}; padding: 12px 16px; font-size: 14px; line-height: 1.6; text-align: left; color: #333333; border-radius: 0 6px 6px 0; white-space: pre-wrap;">
            ${escapeHtml(description)}
          </div>
        </div>

        ${
          temAnexo
            ? `<p style="margin: 16px 0 0; font-size: 13px; color: ${corEscura};">📎 Este e-mail inclui anexo(s) enviado(s) pelo formulário.</p>`
            : ''
        }
      </div>

      <div style="background-color: #f8fafc; padding: 14px 24px; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #94a3b8;">
          Enviado automaticamente pelo formulário do site${
            siteUrl
              ? ` — <a href="${siteUrl}" style="color: ${corPrimaria}; text-decoration: none;">${siteUrl.replace(/^https?:\/\//, '')}</a>`
              : ''
          }
        </p>
      </div>
    </div>
  `;
}

module.exports = {
  enviarEmail,
  isValidEmail,
  paraAnexoNodemailer,
  escapeHtml,
  montarTextoPlano,
  montarEmailHtml,
  aplicarCors,
  urlDaLogo,
};
