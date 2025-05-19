import { watch } from 'fs';
import { readFile, writeFile, access } from 'fs/promises';
import { executeMikroORMCommand, isMikroORMCommand } from './db/mikro-orm-cli.js';
import path from 'path';

const COMMAND_FILE = path.join(process.cwd(), 'src', 'command.txt');
const MAX_HISTORY = 50;
let lastCommandLine = '';
let commandHistory: string[] = [];
let isWatching = false;

const DEFAULT_CONTENT = `# This file is watched for changes
# To execute a command, write it here and save the file
# Example: schema:create --run

# Command History:
`;

async function loadExistingHistory() {
  try {
    const content = await readFile(COMMAND_FILE, 'utf8');
    const lines = content.split('\n');
    const historyStartIndex = lines.findIndex(line => line.includes('Command History:')) + 1;
    const historyLines = lines.slice(historyStartIndex).filter(line => line.trim().startsWith('#'));
    commandHistory = historyLines.slice(0, MAX_HISTORY);
  } catch (error) {
    console.log('No existing history found, starting fresh');
  }
}

async function initializeCommandFile() {
  try {
    await access(COMMAND_FILE);
    await loadExistingHistory();
  } catch {
    await writeFile(COMMAND_FILE, DEFAULT_CONTENT, 'utf8');
  }
}

async function updateCommandHistory(command: string) {
  const timestamp = new Date().toLocaleString();
  const historyEntry = `# ${timestamp}: ${command}`;
  commandHistory.unshift(historyEntry);
  if (commandHistory.length > MAX_HISTORY) {
    commandHistory.pop();
  }
}

export async function watchCommandFile() {
  if (isWatching) return;

  await initializeCommandFile();
  watch(COMMAND_FILE, async (eventType) => {
    if (eventType === 'change') {
      try {
        const content = await readFile(COMMAND_FILE, 'utf8');
        const lines = content.split('\n').map(line => line.trim());
        const commandLine = lines.find(line => line && !line.startsWith('#'));

        if (commandLine) {
          lastCommandLine = commandLine;
          const [command, ...args] = commandLine.split(' ');

          // Execute command if valid
          if (isMikroORMCommand(command)) {
            await executeMikroORMCommand(command, args);
          }

          await updateCommandHistory(commandLine);

          // Clear first line and update file with new content
          const newContent = content.split('\n');
          newContent[0] = ''; // Clear first line
          const updatedContent = `${DEFAULT_CONTENT}\n${commandHistory.join('\n')}`;
          await writeFile(COMMAND_FILE, updatedContent, 'utf8');
        }
      } catch (error) {
        console.error(`Error reading command file: ${error}`);
      }
    }
  });

  console.log(`🔍 Watching for commands in ${COMMAND_FILE}`);
}