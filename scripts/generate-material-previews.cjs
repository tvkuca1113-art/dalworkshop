// Small previews of the same deterministic grain used by the interactive model.
/* eslint-disable @typescript-eslint/no-require-imports -- build-time CJS TypeScript loader */
const fs = require('node:fs');
const ts = require('typescript');
const sharp = require('sharp');
require.extensions['.ts'] = (mod, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  mod._compile(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
};
const { generateWoodPixels, plankStrips } = require('../src/lib/three/wood-texture.ts');
(async () => {
  for (const species of ['oak', 'walnut', 'ash']) {
    const px = await generateWoodPixels({ kind: 'face', spanU: 2.9, spanV: 1.6, widthPx: 1024, heightPx: 565, strips: plankStrips(species, 1.6, 2026), seed: 2026 });
    await sharp(Buffer.from(px.color), { raw: { width: px.width, height: px.height, channels: 4 } }).webp({ quality: 90 }).toFile(`public/materials/${species}.webp`);
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
