import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Only allows safe formatting tags and attributes.
 */
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['span', 'b', 'i', 'em', 'strong', 'u', 'sub', 'sup', 'br'],
    ALLOWED_ATTR: ['style', 'class'],
  });
}
