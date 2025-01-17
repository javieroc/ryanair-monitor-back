db = db.getSiblingDB('ryanairdb')

db.createUser({
  user: 'admin',
  pwd: 'admin',
  roles: [{ role: 'readWrite', db: 'ryanairdb' }],
});

db.createCollection('flights')
