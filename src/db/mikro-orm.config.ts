import { PostgreSqlDriver, UnderscoreNamingStrategy, LoadStrategy, defineConfig, type Options, EntityMetadata } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import EnvConfig from '../lib/config/EnvConfig.js';
import { SeedManager } from '@mikro-orm/seeder';
import { TSMigrationGenerator } from '@mikro-orm/migrations';
import { User } from '../domain/user/Entity.js';
import { BaseEntity } from './BaseEntity.js';
import { BaseEntityWithUUID } from './BaseEntityWithUUID.js';

const mikroORMConfig: Options = defineConfig({
  driver: PostgreSqlDriver,
  host: EnvConfig.MIKRO_ORM_DB_HOST,
  dbName: EnvConfig.MIKRO_ORM_DB_NAME,
  port: EnvConfig.MIKRO_ORM_DB_PORT,
  user: EnvConfig.MIKRO_ORM_DB_USER,
  password: EnvConfig.MIKRO_ORM_DB_PASSWORD,
  namingStrategy: UnderscoreNamingStrategy,
  loadStrategy: LoadStrategy.JOINED,
  ignoreUndefinedInQuery: true,
  // logger: (message: string) => myLogger.info(message), // defaults to `console.log()`
  // folder-based discovery setup, using common filename suffix
  discovery: {
    warnWhenNoEntities: true,
    alwaysAnalyseProperties: true,
    disableDynamicFileAccess: false
  },
  // we will use the ts-morph reflection, an alternative to the default reflect-metadata provider
  // check the documentation for their differences: https://mikro-orm.io/docs/metadata-providers
  metadataProvider: TsMorphMetadataProvider,
  metadataCache: { enabled: true },
  debug: process.env.NODE_ENV !== 'production',   // enable debug mode to log SQL queries and discovery information
  forceUtcTimezone: true,   // ensure that all dates are stored in UTC timezone,
  entities: [User, BaseEntity, BaseEntityWithUUID],
  entitiesTs: ['./src/**/Entity.ts'],
  dynamicImportProvider: async (id) => {
    console.log(`Importing: ${id}...`);
    return await import(id);
  },
  seeder: {
    path: './src/db/seeders',
    pathTs: './src/db/seeders',
    defaultSeeder: 'DatabaseSeeder', // default seeder class name
    glob: '!(*.d).{js,ts}', // how to match seeder files (all .js and .ts files, but not .d.ts)
    emit: 'ts', // seeder generation mode
    fileName: (className: string) => className,
  },
  migrations: {
    tableName: 'mikro_orm_migrations', // name of database table with log of executed transactions
    path: './migrations',
    pathTs: undefined,
    glob: '!(*.d).{js,ts}',
    transactional: true, // wrap each migration in a transaction
    disableForeignKeys: true, // wrap statements with `set foreign_key_checks = 0` or equivalent
    allOrNothing: true, // wrap all migrations in master transaction
    dropTables: true, // allow to disable table dropping
    safe: false, // allow to disable table and column dropping
    snapshot: true, // save snapshot when creating new migrations
    emit: 'ts',
    generator: TSMigrationGenerator, // migration generator, e.g. to allow custom formatting,
  },
  extensions: [SeedManager],
});

export default mikroORMConfig;