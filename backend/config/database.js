const knex = require('knex');
const path = require('path');

const config = {
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '../database.sqlite')
  },
  useNullAsDefault: true,
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations'
  },
  seeds: {
    directory: './seeds'
  }
};

const db = knex(config);

module.exports = db;
