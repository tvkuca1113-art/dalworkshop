<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## DAL Workshop — napomene za rad na projektu

- Specifikacija: `docs/reference/CLAUDE-CODE-SUPERPROMPT.md`; nepotvrđene poslovne stavke: `DAL-POTVRDA-PODATAKA.md`.
- Opcije, statusi i rasponi žive samo u `src/lib/catalog/*`; komponente ih ne hardkodiraju.
- Sve se izvodi iz jednog validiranog `TableConfig` / `BoardConfig` (`src/lib/config`); 3D (`src/lib/three`) i 2D nacrt čitaju isti raspored iz `src/lib/geometry`.
- Ne izmišljati cijene, rokove, adresu, ocjene ni dostupnost; cijena stola je uvijek „prema ponudi“.
- Prije commita: `npm run check`; za tokove u pregledniku `npm run build && npm run test:e2e`.
