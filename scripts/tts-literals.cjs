// Literal-only TTS Lua table reader; never executes Lua.
function literalTable(src) {
  const tokens = src.match(/--\[\[[\s\S]*?\]\]|--[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\[\[[\s\S]*?\]\]|-?\d+(?:\.\d+)?|[A-Za-z_]\w*|[^\s]/g).filter(t => !t.startsWith('--'));
  let i = 0;
  function value() {
    const t = tokens[i++];
    if (t === '{') {
      const obj = {}; let index = 1;
      while (i < tokens.length && tokens[i] !== '}') {
        if (tokens[i] === ',' || tokens[i] === ';') { i++; continue; }
        let key;
        if (tokens[i] === '[') { i++; key = value(); if (tokens[i] === ']') i++; if (tokens[i] === '=') i++; }
        else if (tokens[i + 1] === '=') { key = tokens[i]; i += 2; }
        else key = index++;
        obj[key] = value();
        // Skip the remainder of a non-literal expression.
        let depth = 0;
        while (i < tokens.length && (depth || ![',', ';', '}'].includes(tokens[i]))) {
          if (['(', '[', '{'].includes(tokens[i])) depth++;
          if ([')', ']', '}'].includes(tokens[i])) depth--;
          i++;
        }
      }
      i++; return obj;
    }
    if (/^["']/.test(t || '')) return t.slice(1, -1).replace(/\\([\\"'])/g, '$1').replace(/\\n/g, '\n');
    if (/^-?\d/.test(t || '')) return Number(t);
    if (t === 'false') return false;
    if (t === 'true') return true;
    return null;
  }
  return value();
}
function tableField(src, field) {
  const m = new RegExp('\\b' + field + '\\s*=\\s*\\{').exec(src);
  return m ? literalTable(src.slice(m.index + m[0].length - 1)) : {};
}
const values = t => Object.keys(t || {}).filter(k => /^\d+$/.test(k)).map(k => t[k]);

module.exports={literalTable,tableField,values};
