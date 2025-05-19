import { writeFile, readFile } from 'fs/promises';
import path from 'path';

const COMMAND_FILE = path.join(process.cwd(), 'src', 'command.txt');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Please provide a command to write');
  process.exit(1);
}

const command = args.join(' ');

try {
  const existingContent = await readFile(COMMAND_FILE, 'utf8');
  await writeFile(COMMAND_FILE, `${command}\n${existingContent}`, 'utf8');
  console.log(`✅ Command written to ${COMMAND_FILE}: ${command}`);
} catch (error) {
  console.error(`❌ Error writing command: ${error}`);
  process.exit(1);
}