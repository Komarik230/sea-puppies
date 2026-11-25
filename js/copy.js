/* æ-æ-æ-tchi — loads copy.txt (all interface text) and turns it into HTML. */
(function () {
  'use strict';
  const SP = window.SP = window.SP || {};

  const BLOCK = /^\[([a-z0-9_.-]+)\]\s*$/;
  const SIMPLE = ['title', 'text', 'finding', 'method', 'source', 'alt', 'credit', 'after', 'description'];
  const DOTTED = /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/;

  SP.parseCopy = function (src) {
    const out = {};
    let block = null, field = null;
    src.replace(/\r/g, '').split('\n').forEach(line => {
      if (/^\s*#/.test(line)) return;
      let m = line.match(BLOCK);
      if (m) { block = out[m[1]] = out[m[1]] || {}; field = null; return; }
      if (!block) return;
      m = line.match(/^([a-z][a-z0-9_.]*):\s?(.*)$/);
      if (m && (SIMPLE.includes(m[1]) || DOTTED.test(m[1]))) {
        const k = m[1];
        if (k === 'source') { (block.source = block.source || []).push(m[2]); field = { arr: block.source, i: block.source.length - 1 }; }
        else { block[k] = m[2]; field = { k }; }
        return;
      }
      if (!field) return;
      if (field.arr) field.arr[field.i] += '\n' + line; else block[field.k] += '\n' + line;
    });
    for (const b in out) for (const k in out[b]) {
      const v = out[b][k];
      out[b][k] = Array.isArray(v) ? v.map(s => s.trim()).filter(Boolean) : v.trim();
    }
    return out;
  };

  SP.copy = {};
  SP.vars = {};
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function fill(s) {
    return String(s || '').replace(/\{(\w+)\}/g, (m, k) => (SP.vars[k] != null ? SP.vars[k] : m));
  }
  function inline(s) {
    let h = esc(fill(s));
    h = h.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
    return h;
  }
  SP.fill = fill;
  SP.inline = inline;

  // plain text (no markup) — for titles, aria labels, LCD labels
  SP.t = function (block, field, fallback) {
    const b = SP.copy[block];
    const v = b && b[field];
    if (v == null) return fallback != null ? fallback : '';
    return fill(v).replace(/\*\*?([^*]+)\*\*?/g, '$1');
  };
  // a list stored as comma-separated text (LCD labels)
  SP.list = function (block, field) { return SP.t(block, field).split(',').map(s => s.trim()); };

  // paragraphs + bullets → HTML
  SP.md = function (src) {
    if (!src) return '';
    const parts = String(src).split(/\n\s*\n/);
    return parts.map(p => {
      const lines = p.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length && lines.every(l => l.startsWith('- '))) return '<ul>' + lines.map(l => '<li>' + inline(l.slice(2)) + '</li>').join('') + '</ul>';
      return '<p>' + lines.map(inline).join(' ') + '</p>';
    }).join('');
  };
  // "Name | https://link" → <a>
  SP.sourceHTML = function (s) {
    const i = s.lastIndexOf('|');
    if (i < 0) return inline(s);
    const name = s.slice(0, i).trim(), url = s.slice(i + 1).trim();
    return '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + inline(name) + '</a>';
  };

  SP.loadCopy = function () {
    return fetch('copy.txt', { cache: 'no-cache' })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(txt => { SP.copy = SP.parseCopy(txt); return SP.copy; });
  };
})();
