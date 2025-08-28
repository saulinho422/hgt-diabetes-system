/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // Tabela de usuários
    .createTable('users', function(table) {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.string('email', 255).unique().notNullable();
      table.string('password', 255).notNullable();
      table.date('date_of_birth');
      table.string('diabetes_type').defaultTo('type1');
      table.date('diagnosis_date');
      table.integer('target_glucose_min').defaultTo(70);
      table.integer('target_glucose_max').defaultTo(180);
      table.boolean('active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    
    // Tabela de registros de glicemia
    .createTable('glucose_records', function(table) {
      table.increments('id').primary();
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.date('date').notNullable();
      table.string('period');
      table.integer('glucose_value').notNullable();
      table.text('notes');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      table.index(['user_id', 'date']);
      table.index(['user_id', 'period']);
    })
    
    // Tabela de registros de insulina
    .createTable('insulin_records', function(table) {
      table.increments('id').primary();
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.date('date').notNullable();
      table.string('period');
      table.string('insulin_type').defaultTo('rapid');
      table.decimal('units', 5, 2).notNullable();
      table.text('notes');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      table.index(['user_id', 'date']);
      table.index(['user_id', 'period']);
    })
    
    // Tabela de configurações do usuário
    .createTable('user_settings', function(table) {
      table.increments('id').primary();
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE').unique();
      table.json('notification_settings').defaultTo('{}');
      table.json('privacy_settings').defaultTo('{}');
      table.json('data_settings').defaultTo('{}');
      table.json('reminder_times').defaultTo('{}');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    
    // Tabela de alertas
    .createTable('alerts', function(table) {
      table.increments('id').primary();
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('type'); // 'high_glucose', 'low_glucose', 'missed_measurement', 'medication_reminder'
      table.string('title', 255).notNullable();
      table.text('message');
      table.integer('glucose_value');
      table.boolean('read').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.index(['user_id', 'type']);
      table.index(['user_id', 'read']);
    })
    
    // Tabela de backups
    .createTable('backups', function(table) {
      table.increments('id').primary();
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('filename', 255).notNullable();
      table.string('file_path', 500);
      table.integer('file_size');
      table.string('status').defaultTo('pending'); // 'pending', 'completed', 'failed'
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.index(['user_id', 'status']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('backups')
    .dropTableIfExists('alerts')
    .dropTableIfExists('user_settings')
    .dropTableIfExists('insulin_records')
    .dropTableIfExists('glucose_records')
    .dropTableIfExists('users');
};
