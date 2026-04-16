import fs from 'fs';

const isNumber = /^-?\d+(\.\d+)?$/;

function pxIfNeeded(key, val) {
  if (typeof val === 'number' || (typeof val === 'string' && val.match(isNumber))) {
    if (['fontWeight', 'opacity', 'lineHeight', 'zIndex', 'paragraphIndent', 'paragraphSpacing'].includes(key)) return val;
    if (key.match(/(Color|family|pattern|alignment|textCase|textDecoration|fontStyle|fontStretch)/i)) return val;
    if (val === 0 || val === "0") return "0";
    return val + 'px';
  }
  if (Array.isArray(val)) {
     return val.map(v => pxIfNeeded(key, v)).join(' ');
  }
  if (typeof val === 'object') {
     if (val.x !== undefined && val.y !== undefined && val.blur !== undefined) {
         return `${val.x}px ${val.y}px ${val.blur}px ${val.spread || 0}px ${val.color}`;
     }
  }
  return val;
}

function resolveRefs(value) {
  if (typeof value === 'string' && value.includes('{')) {
     return value.replace(/\{([^}]+)\}/g, (match, p1) => {
        const varName = p1.replace(/\./g, '-').replace(/\s+/g, '-').toLowerCase();
        return `var(--sys-${varName})`;
     });
  }
  return value;
}

function processTokens(tks, prefix = 'sys') {
  let css = '';
  function tr(obj, currentPrefix) {
    if (!obj || typeof obj !== 'object') return;
    if (obj.value !== undefined) {
      if (typeof obj.value === 'object') {
         if (Array.isArray(obj.value)) {
            const shadowStr = obj.value.map(s => {
               if (s.x !== undefined) return pxIfNeeded('shadow', s);
               return JSON.stringify(s);
            }).join(', ');
            if (shadowStr.includes('px')) {
              css += `  --${currentPrefix}: ${resolveRefs(shadowStr)};\n`;
            }
         } else {
            for (let k in obj.value) {
               let val = obj.value[k];
               if (typeof val !== 'object') {
                 css += `  --${currentPrefix}-${k}: ${resolveRefs(pxIfNeeded(k, val))};\n`;
               }
            }
         }
      } else {
        css += `  --${currentPrefix}: ${resolveRefs(pxIfNeeded(currentPrefix.split('-').pop(), obj.value))};\n`;
      }
      return;
    }
    for (let k in obj) {
      if (k === 'extensions' || k === 'description' || k === 'type') continue;
      tr(obj[k], `${currentPrefix}-${k.replace(/\s+/g, '-').toLowerCase()}`);
    }
  }
  tr(tks, prefix);
  return css;
}

const data = JSON.parse(fs.readFileSync('./design-tokens.tokens.json', 'utf8'));
const result = `:root {\n${processTokens(data)}\n}\n`;
fs.writeFileSync('./src/tokens.css', result);
console.log('Tokens generated with references resolved.');
