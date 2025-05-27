import { watch } from 'fs';
import { readFile, writeFile, access } from 'fs/promises';
import { executeMikroORMCommand, isMikroORMCommand } from './db/mikro-orm-cli.js';
import path from 'path';

const COMMAND_FILE = path.join(process.cwd(), 'src', 'command.txt');
const MAX_HISTORY = 50;

const DEFAULT_CONTENT = `# This file is watched for changes
# To execute a command, write it here and save the file
# Example: schema:create --run

# Command History:
`;

let commandHistory: string[] = [];
const executedCommands = new Set<string>();
const commandQueue: string[] = [];

let isProcessing = false;
let isWatching = false;

async function loadExistingHistory() {
  try {
    const content = await readFile(COMMAND_FILE, 'utf8');
    const lines = content.split('\n');
    const historyStartIndex = lines.findIndex(line => line.includes('Command History:')) + 1;
    const historyLines = lines.slice(historyStartIndex).filter(line => line.trim().startsWith('#'));
    commandHistory = historyLines.slice(0, MAX_HISTORY);
  } catch {
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

async function saveHistoryToFile() {
  const updatedContent = `${DEFAULT_CONTENT}\n${commandHistory.join('\n')}`;
  await writeFile(COMMAND_FILE, updatedContent, 'utf8');
}

async function enqueueCommandsFromFile() {
  try {
    const content = await readFile(COMMAND_FILE, 'utf8');
    const lines = content.split('\n').map(line => line.trim());

    // Extract commands (non-empty, not starting with #)
    const newCommands = lines.filter(line => line && !line.startsWith('#'));

    for (const cmd of newCommands) {
      if (!executedCommands.has(cmd) && !commandQueue.includes(cmd)) {
        commandQueue.push(cmd);
      }
    }
  } catch (error) {
    console.error('Failed to read command file for queueing:', error);
  }
}

async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;

  while (commandQueue.length > 0) {
    const commandLine = commandQueue.shift()!;
    if (executedCommands.has(commandLine)) {
      // Already executed, skip
      continue;
    }

    try {
      console.log(`Executing command: ${commandLine}`);
      const [command, ...args] = commandLine.split(' ');

      if (isMikroORMCommand(command)) {
        await executeMikroORMCommand(command, args);
      } else {
        console.warn(`Unknown command: ${commandLine}`);
      }

      await updateCommandHistory(commandLine);
      executedCommands.add(commandLine);

      if (executedCommands.size > 100) {
        // Keep last 50
        const executedArray = Array.from(executedCommands);
        executedCommands.clear();
        for (const c of executedArray.slice(-50)) executedCommands.add(c);
      }

      await saveHistoryToFile();

    } catch (error) {
      console.error(`Error executing command "${commandLine}":`, error);
    }
  }

  isProcessing = false;
}

export async function watchCommandFile() {
  if (isWatching) return;
  isWatching = true;

  await initializeCommandFile();
  await enqueueCommandsFromFile();

  // Process any existing commands on start
  processQueue();

  watch(COMMAND_FILE, async (eventType) => {
    if (eventType === 'change') {
      await enqueueCommandsFromFile();
      processQueue();
    }
  });

  console.log(`🔍 Watching for commands in ${COMMAND_FILE}`);
}