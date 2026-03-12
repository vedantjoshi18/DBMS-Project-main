const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

const normalizeText = (value) => String(value || '').replaceAll('\r\n', '\n').trim();

const escapeHtml = (value) => normalizeText(value).replaceAll(/[&<>"']/g, (character) => HTML_ESCAPE_MAP[character]);

module.exports = {
  normalizeText,
  escapeHtml
};