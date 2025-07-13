// scripts/copy-templates.ts
import { copy, ensureDir } from 'fs-extra';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// convert import.meta.url to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const source = join(__dirname, '../src/email/templates');
const dest = join(__dirname, '../dist/src/email/templates');

const main = async () => {
  try {
    await ensureDir(dirname(dest));
    await copy(source, dest);
    console.log('✓ Templates copied to', dest);
  } catch (err) {
    console.error('Template copy failed:', err);
    process.exit(1);
  }
};

main();
