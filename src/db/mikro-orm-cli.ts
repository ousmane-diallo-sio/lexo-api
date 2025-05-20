import orm from './orm.js';
import { DatabaseSeeder } from './seeders/DatabaseSeeder.js';

type MikroORMCommand = 
  | 'schema:create:dump' 
  | 'schema:create:run' 
  | 'schema:update:dump' 
  | 'schema:update:run' 
  | 'schema:drop:dump' 
  | 'schema:drop:run' 
  | 'schema:seed';

export function isMikroORMCommand(command: string): command is MikroORMCommand {
  return [
    'schema:create:dump', 
    'schema:create:run', 
    'schema:update:dump', 
    'schema:update:run', 
    'schema:drop:dump', 
    'schema:drop:run', 
    'schema:seed'
  ].includes(command);
}

export async function executeMikroORMCommand(command: MikroORMCommand, args: string[]): Promise<boolean> {
  if (!isMikroORMCommand(command)) {
    console.error(`❌ Unknown command: ${command}`);
    return false;
  }

  try {
    console.log('⚙️  Running MikroORM command:', command, args.join(' '));
    const schemaGenerator = orm.get().getSchemaGenerator();
    
    switch (command) {
      case 'schema:create:dump':
        await schemaGenerator.getCreateSchemaSQL();
        break;
      case 'schema:create:run':
        await schemaGenerator.createSchema();
        break;
      case 'schema:update:dump':
        await schemaGenerator.getUpdateSchemaSQL();
        break;
      case 'schema:update:run':
        await schemaGenerator.updateSchema();
        break;
      case 'schema:drop:dump':
        await schemaGenerator.getDropSchemaSQL();
        break;
      case 'schema:drop:run':
        await schemaGenerator.dropSchema();
        break;
      case 'schema:seed':
        const seederClass = args.find(arg => arg.startsWith('--class='))?.split('=')[1];
        if (seederClass === 'DatabaseSeeder') {
          await orm.get().getSeeder().seed(DatabaseSeeder);
        }
        break;
    }
    console.log(`✅ Command ${command} executed successfully`);

    return true;
  } catch (error) {
    console.error('Error executing command:', error);
    return false;
  }
}
