import fs from 'fs';
import path from 'path';

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name.endsWith('.styles.ts')) {
      let s = fs.readFileSync(p, 'utf8');
      const usesCss = /\bcss`/.test(s) || /ReturnType<typeof css>/.test(s);
      const usesKeyframes = /\bkeyframes`/.test(s);
      let imp = 'import styled from \'styled-components\';';
      if (usesCss && usesKeyframes) imp = 'import styled, { css, keyframes } from \'styled-components\';';
      else if (usesCss) imp = 'import styled, { css } from \'styled-components\';';
      else if (usesKeyframes) imp = 'import styled, { keyframes } from \'styled-components\';';
      s = s.replace(/^import styled[^\n]+;\n/, imp + '\n');
      fs.writeFileSync(p, s);
    }
  }
}
walk(path.resolve('src'));
console.log('fixed imports');
