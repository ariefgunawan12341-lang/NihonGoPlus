import DOMPurify from 'dompurify'

/** Sanitizes rich-text HTML (from the Tiptap editor) before rendering with
 *  dangerouslySetInnerHTML — defense-in-depth against XSS even though
 *  article writes are already admin-only via RLS. Allows the tags/attributes
 *  Tiptap's StarterKit + image/link/youtube extensions actually produce. */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'ul', 'ol', 'li',
      'blockquote', 'code', 'pre', 'a', 'img', 'iframe', 'span'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'class', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i
  })
}
