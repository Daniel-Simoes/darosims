import fs from 'fs';
import path from 'path';

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name.endsWith('.styles.ts')) {
      let s = fs.readFileSync(p, 'utf8');
      s = s.replace(
        /export const (\w+) = keyframes\{([\s\S]*?)\};/g,
        'export const $1 = keyframes`$2`;',
      );
      fs.writeFileSync(p, s);
    }
  }
}
walk(path.resolve('src'));
console.log('fixed keyframes');
