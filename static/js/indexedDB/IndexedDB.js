/**
 * IndexedDB database
 * @type {Dexie}
 */
export const db = new Dexie('WizardIslandDB');
console.log("Database initialized", db);
/**
 * Database schema
 * ++id:  auto incrementing primary key, ensuring each entry is unique
 * &name:  unique index for the name of the asset.
 * content: the binary data (blob) of the asset is stored.
 */
db.version(2).stores({
  images: '++id, &name, content',
  models: '++id, &name, content'
});