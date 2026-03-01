/**
 * Custom CSS Utility — Scoped CSS injection
 *
 * Generates scoped CSS per block: `.block-{id} { ... }`
 * Includes basic validation (unclosed braces check) and sanitization.
 *
 * Clean Code: pure function, no side effects, prevents CSS injection XSS.
 */

/**
 * Scope CSS to a specific block by wrapping all rules with `.block-{id}`.
 * Returns sanitized CSS string ready for injection.
 */
export function scopeBlockCSS(blockId: string, rawCSS: string): string {
  if (!rawCSS.trim()) return '';

  // Basic sanitization: remove potential XSS vectors
  const sanitized = sanitizeCSS(rawCSS);

  // Validate braces are balanced
  if (!areBracesBalanced(sanitized)) {
    console.warn(`[CSS] Unbalanced braces in block ${blockId}`);
    return `/* Block ${blockId}: CSS parse error — unbalanced braces */`;
  }

  // Scope: wrap all rules with `.block-{id}`
  return `.block-${blockId} { ${sanitized} }`;
}

/**
 * Collect all custom CSS from a block tree into a single <style> string.
 */
export function collectBlockCSS(blocks: any[]): string {
  const cssChunks: string[] = [];

  function walk(blockList: any[]) {
    for (const block of blockList) {
      const customCSS = block.props?.customCSS || block.styles?.customCSS;
      if (customCSS) {
        cssChunks.push(scopeBlockCSS(block.id, customCSS));
      }
      if (block.children?.length) {
        walk(block.children);
      }
    }
  }

  walk(blocks);
  return cssChunks.filter(Boolean).join('\n');
}

/**
 * Sanitize CSS to prevent XSS via CSS injection.
 * Removes: @import, url(), expression(), javascript:, behavior, -moz-binding.
 */
function sanitizeCSS(css: string): string {
  return css
    .replace(/@import\b[^;]*;/gi, '/* @import removed */')
    .replace(/url\s*\([^)]*\)/gi, '/* url() removed */')
    .replace(/expression\s*\([^)]*\)/gi, '/* expression() removed */')
    .replace(/javascript\s*:/gi, '/* javascript: removed */')
    .replace(/behavior\s*:/gi, '/* behavior: removed */')
    .replace(/-moz-binding\s*:/gi, '/* -moz-binding: removed */');
}

/**
 * Check whether braces `{}` are balanced in a CSS string.
 */
function areBracesBalanced(css: string): boolean {
  let depth = 0;
  for (const char of css) {
    if (char === '{') depth++;
    if (char === '}') depth--;
    if (depth < 0) return false;
  }
  return depth === 0;
}
