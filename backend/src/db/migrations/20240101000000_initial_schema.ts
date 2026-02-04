import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Enable UUID extension
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  // ==================== TENANTS ====================
  await knex.schema.createTable('tenants', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.string('name', 255).notNullable();
    t.string('nip', 10).notNullable().unique();
    t.string('slug', 100).notNullable().unique();
    t.jsonb('settings').notNullable().defaultTo('{}');
    t.string('plan', 50).notNullable().defaultTo('free');
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamps(true, true);
  });

  // ==================== USERS ====================
  await knex.schema.createTable('users', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.string('email', 255).notNullable();
    t.string('password_hash', 255).notNullable();
    t.string('first_name', 100).notNullable();
    t.string('last_name', 100).notNullable();
    t.string('role', 20).notNullable().defaultTo('staff');
    t.string('phone', 20);
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamp('last_login_at');
    t.timestamps(true, true);
    t.unique(['tenant_id', 'email']);
  });

  // ==================== REFRESH TOKENS ====================
  await knex.schema.createTable('refresh_tokens', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('token_hash', 255).notNullable().unique();
    t.timestamp('expires_at').notNullable();
    t.string('device_info', 500);
    t.boolean('is_revoked').notNullable().defaultTo(false);
    t.timestamps(true, true);
  });

  // ==================== LOCATIONS ====================
  await knex.schema.createTable('locations', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.string('name', 255).notNullable();
    t.string('address', 500);
    t.string('city', 100);
    t.string('postal_code', 10);
    t.string('phone', 20);
    t.decimal('latitude', 10, 7);
    t.decimal('longitude', 10, 7);
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamps(true, true);
  });

  // ==================== CUSTOMERS ====================
  await knex.schema.createTable('customers', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.string('first_name', 100).notNullable();
    t.string('last_name', 100).notNullable();
    t.string('email', 255);
    t.string('phone', 20).notNullable();
    t.date('birth_date');
    t.integer('points_balance').notNullable().defaultTo(0);
    t.integer('total_points_earned').notNullable().defaultTo(0);
    t.integer('total_spent').notNullable().defaultTo(0); // grosze
    t.uuid('tier_id');
    t.jsonb('tags').notNullable().defaultTo('[]');
    t.jsonb('metadata').notNullable().defaultTo('{}');
    t.timestamp('joined_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('last_visit_at');
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamps(true, true);
    t.unique(['tenant_id', 'phone']);
    t.index(['tenant_id', 'email']);
  });

  // ==================== LOYALTY PROGRAMS ====================
  await knex.schema.createTable('loyalty_programs', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.string('name', 255).notNullable();
    t.string('type', 20).notNullable().defaultTo('points');
    t.text('description');
    t.jsonb('earn_rules').notNullable().defaultTo('[]');
    t.jsonb('burn_rules').notNullable().defaultTo('[]');
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamps(true, true);
  });

  // ==================== TIERS ====================
  await knex.schema.createTable('tiers', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('program_id').notNullable().references('id').inTable('loyalty_programs').onDelete('CASCADE');
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.string('name', 100).notNullable();
    t.integer('min_points').notNullable().defaultTo(0);
    t.decimal('multiplier', 5, 2).notNullable().defaultTo(1.0);
    t.jsonb('benefits').notNullable().defaultTo('[]');
    t.integer('sort_order').notNullable().defaultTo(0);
    t.timestamps(true, true);
  });

  // Add tier FK to customers
  await knex.schema.alterTable('customers', (t) => {
    t.foreign('tier_id').references('id').inTable('tiers').onDelete('SET NULL');
  });

  // ==================== REWARDS ====================
  await knex.schema.createTable('rewards', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.string('name', 255).notNullable();
    t.text('description');
    t.integer('points_cost').notNullable();
    t.string('status', 20).notNullable().defaultTo('active');
    t.string('image_url', 1000);
    t.integer('stock');
    t.timestamp('valid_from');
    t.timestamp('valid_until');
    t.timestamps(true, true);
  });

  // ==================== TRANSACTIONS ====================
  await knex.schema.createTable('transactions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.uuid('customer_id').notNullable().references('id').inTable('customers').onDelete('CASCADE');
    t.uuid('location_id').references('id').inTable('locations').onDelete('SET NULL');
    t.integer('amount').notNullable(); // grosze
    t.integer('points_earned').notNullable().defaultTo(0);
    t.string('receipt_number', 100);
    t.string('source', 50).notNullable().defaultTo('manual');
    t.jsonb('metadata').notNullable().defaultTo('{}');
    t.timestamps(true, true);
    t.index(['tenant_id', 'customer_id']);
    t.index(['tenant_id', 'created_at']);
  });

  // ==================== POINTS LEDGER ====================
  await knex.schema.createTable('points_ledger', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.uuid('customer_id').notNullable().references('id').inTable('customers').onDelete('CASCADE');
    t.string('type', 20).notNullable(); // earn, burn, adjust, expire, transfer
    t.integer('amount').notNullable(); // positive for earn, negative for burn
    t.integer('balance_after').notNullable();
    t.string('description', 500).notNullable();
    t.string('reference_type', 50); // transaction, reward_redemption, etc
    t.uuid('reference_id');
    t.timestamp('expires_at');
    t.timestamps(true, true);
    t.index(['tenant_id', 'customer_id']);
    t.index(['tenant_id', 'created_at']);
  });

  // ==================== STAMP CARD DEFINITIONS ====================
  await knex.schema.createTable('stamp_card_definitions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.string('name', 255).notNullable();
    t.integer('stamps_required').notNullable();
    t.string('reward_description', 500).notNullable();
    t.uuid('reward_id').references('id').inTable('rewards').onDelete('SET NULL');
    t.string('image_url', 1000);
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamps(true, true);
  });

  // ==================== STAMP CARDS ====================
  await knex.schema.createTable('stamp_cards', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.uuid('customer_id').notNullable().references('id').inTable('customers').onDelete('CASCADE');
    t.uuid('definition_id').notNullable().references('id').inTable('stamp_card_definitions').onDelete('CASCADE');
    t.integer('current_stamps').notNullable().defaultTo(0);
    t.boolean('is_completed').notNullable().defaultTo(false);
    t.timestamp('completed_at');
    t.timestamps(true, true);
    t.index(['tenant_id', 'customer_id']);
  });

  // ==================== STAMP EVENTS ====================
  await knex.schema.createTable('stamp_events', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.uuid('stamp_card_id').notNullable().references('id').inTable('stamp_cards').onDelete('CASCADE');
    t.uuid('location_id').references('id').inTable('locations').onDelete('SET NULL');
    t.integer('stamps_added').notNullable().defaultTo(1);
    t.timestamps(true, true);
  });

  // ==================== VOUCHERS ====================
  await knex.schema.createTable('vouchers', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.string('code', 50).notNullable();
    t.string('discount_type', 20).notNullable(); // percentage, fixed
    t.integer('discount_value').notNullable(); // percentage (0-100) or grosze
    t.string('status', 20).notNullable().defaultTo('active');
    t.uuid('customer_id').references('id').inTable('customers').onDelete('SET NULL');
    t.integer('min_purchase_amount'); // grosze
    t.timestamp('expires_at');
    t.timestamp('redeemed_at');
    t.timestamps(true, true);
    t.unique(['tenant_id', 'code']);
  });

  // ==================== VOUCHER REDEMPTIONS ====================
  await knex.schema.createTable('voucher_redemptions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.uuid('voucher_id').notNullable().references('id').inTable('vouchers').onDelete('CASCADE');
    t.uuid('customer_id').notNullable().references('id').inTable('customers').onDelete('CASCADE');
    t.uuid('transaction_id').references('id').inTable('transactions').onDelete('SET NULL');
    t.integer('discount_applied').notNullable(); // grosze
    t.timestamps(true, true);
  });

  // ==================== GIFT CARDS ====================
  await knex.schema.createTable('gift_cards', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.string('code', 50).notNullable();
    t.integer('initial_balance').notNullable(); // grosze
    t.integer('current_balance').notNullable(); // grosze
    t.string('status', 20).notNullable().defaultTo('active');
    t.uuid('issued_to_customer_id').references('id').inTable('customers').onDelete('SET NULL');
    t.timestamp('expires_at');
    t.timestamps(true, true);
    t.unique(['tenant_id', 'code']);
  });

  // ==================== GIFT CARD TRANSACTIONS ====================
  await knex.schema.createTable('gift_card_transactions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.uuid('gift_card_id').notNullable().references('id').inTable('gift_cards').onDelete('CASCADE');
    t.string('type', 20).notNullable(); // load, redeem
    t.integer('amount').notNullable(); // grosze
    t.integer('balance_after').notNullable(); // grosze
    t.string('description', 500);
    t.timestamps(true, true);
  });

  // ==================== CONSENT TEMPLATES ====================
  await knex.schema.createTable('consent_templates', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.string('channel', 20).notNullable();
    t.text('content_pl').notNullable();
    t.text('content_en');
    t.integer('version').notNullable().defaultTo(1);
    t.boolean('is_current').notNullable().defaultTo(true);
    t.timestamps(true, true);
  });

  // ==================== CONSENTS ====================
  await knex.schema.createTable('consents', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.uuid('customer_id').notNullable().references('id').inTable('customers').onDelete('CASCADE');
    t.string('channel', 20).notNullable();
    t.boolean('granted').notNullable().defaultTo(false);
    t.timestamp('granted_at');
    t.timestamp('revoked_at');
    t.integer('template_version').notNullable().defaultTo(1);
    t.timestamps(true, true);
    t.unique(['tenant_id', 'customer_id', 'channel']);
  });

  // ==================== CONSENT AUDIT LOG ====================
  await knex.schema.createTable('consent_audit_log', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.uuid('customer_id').notNullable().references('id').inTable('customers').onDelete('CASCADE');
    t.string('channel', 20).notNullable();
    t.string('action', 10).notNullable(); // grant, revoke
    t.string('ip_address', 45);
    t.string('user_agent', 500);
    t.integer('template_version').notNullable();
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.index(['tenant_id', 'customer_id']);
  });

  // ==================== CAMPAIGNS ====================
  await knex.schema.createTable('campaigns', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.string('name', 255).notNullable();
    t.string('channel', 20).notNullable();
    t.string('status', 20).notNullable().defaultTo('draft');
    t.string('subject', 500);
    t.text('content').notNullable();
    t.jsonb('audience_filter').notNullable().defaultTo('{}');
    t.timestamp('scheduled_at');
    t.timestamp('sent_at');
    t.integer('recipient_count').notNullable().defaultTo(0);
    t.integer('delivered_count').notNullable().defaultTo(0);
    t.integer('opened_count').notNullable().defaultTo(0);
    t.integer('clicked_count').notNullable().defaultTo(0);
    t.timestamps(true, true);
  });

  // ==================== CAMPAIGN RECIPIENTS ====================
  await knex.schema.createTable('campaign_recipients', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.uuid('campaign_id').notNullable().references('id').inTable('campaigns').onDelete('CASCADE');
    t.uuid('customer_id').notNullable().references('id').inTable('customers').onDelete('CASCADE');
    t.string('status', 20).notNullable().defaultTo('pending');
    t.timestamp('sent_at');
    t.timestamp('delivered_at');
    t.timestamp('opened_at');
    t.timestamp('clicked_at');
    t.string('error_message', 500);
    t.timestamps(true, true);
    t.index(['campaign_id', 'status']);
  });

  // ==================== AUTOMATION WORKFLOWS ====================
  await knex.schema.createTable('automation_workflows', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.string('name', 255).notNullable();
    t.string('trigger', 50).notNullable();
    t.jsonb('trigger_config').notNullable().defaultTo('{}');
    t.jsonb('actions').notNullable().defaultTo('[]');
    t.boolean('is_active').notNullable().defaultTo(false);
    t.timestamps(true, true);
  });

  // ==================== AUTOMATION EXECUTIONS ====================
  await knex.schema.createTable('automation_executions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.uuid('workflow_id').notNullable().references('id').inTable('automation_workflows').onDelete('CASCADE');
    t.uuid('customer_id').notNullable().references('id').inTable('customers').onDelete('CASCADE');
    t.string('status', 20).notNullable().defaultTo('running');
    t.integer('current_action_index').notNullable().defaultTo(0);
    t.jsonb('results').notNullable().defaultTo('[]');
    t.string('error_message', 1000);
    t.timestamp('completed_at');
    t.timestamps(true, true);
  });

  // ==================== KIOSK DEVICES ====================
  await knex.schema.createTable('kiosk_devices', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.uuid('location_id').notNullable().references('id').inTable('locations').onDelete('CASCADE');
    t.string('name', 255).notNullable();
    t.string('device_token', 255).notNullable().unique();
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamp('last_sync_at');
    t.timestamps(true, true);
  });

  // ==================== KIOSK SYNC QUEUE ====================
  await knex.schema.createTable('kiosk_sync_queue', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.uuid('device_id').notNullable().references('id').inTable('kiosk_devices').onDelete('CASCADE');
    t.string('idempotency_key', 255).notNullable();
    t.string('operation', 50).notNullable();
    t.jsonb('payload').notNullable();
    t.string('status', 20).notNullable().defaultTo('pending');
    t.string('error_message', 1000);
    t.integer('retry_count').notNullable().defaultTo(0);
    t.timestamp('processed_at');
    t.timestamps(true, true);
    t.unique(['tenant_id', 'device_id', 'idempotency_key']);
  });

  // ==================== WEBHOOK ENDPOINTS ====================
  await knex.schema.createTable('webhook_endpoints', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.string('url', 1000).notNullable();
    t.jsonb('events').notNullable().defaultTo('[]');
    t.string('secret', 255).notNullable();
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamps(true, true);
  });

  // ==================== WEBHOOK DELIVERIES ====================
  await knex.schema.createTable('webhook_deliveries', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.uuid('endpoint_id').notNullable().references('id').inTable('webhook_endpoints').onDelete('CASCADE');
    t.string('event', 100).notNullable();
    t.jsonb('payload').notNullable();
    t.integer('response_status');
    t.text('response_body');
    t.integer('attempt').notNullable().defaultTo(1);
    t.string('status', 20).notNullable().defaultTo('pending');
    t.timestamp('delivered_at');
    t.timestamps(true, true);
  });

  // ==================== PAYMENT EVENTS ====================
  await knex.schema.createTable('payment_events', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.string('provider', 50).notNullable(); // payu, tpay
    t.string('external_id', 255).notNullable();
    t.string('status', 50).notNullable();
    t.integer('amount').notNullable(); // grosze
    t.string('currency', 3).notNullable().defaultTo('PLN');
    t.string('payment_method', 50); // blik, card, transfer
    t.uuid('customer_id').references('id').inTable('customers').onDelete('SET NULL');
    t.jsonb('metadata').notNullable().defaultTo('{}');
    t.timestamps(true, true);
    t.index(['tenant_id', 'external_id']);
  });

  // ==================== POS INTEGRATIONS ====================
  await knex.schema.createTable('pos_integrations', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.uuid('location_id').notNullable().references('id').inTable('locations').onDelete('CASCADE');
    t.string('provider', 50).notNullable(); // novitus, posnet, elzab
    t.jsonb('config').notNullable().defaultTo('{}');
    t.string('webhook_secret', 255);
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamps(true, true);
  });

  // ==================== ANALYTICS DAILY ====================
  await knex.schema.createTable('analytics_daily', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.date('date').notNullable();
    t.uuid('location_id').references('id').inTable('locations').onDelete('SET NULL');
    t.integer('new_customers').notNullable().defaultTo(0);
    t.integer('active_customers').notNullable().defaultTo(0);
    t.integer('transactions_count').notNullable().defaultTo(0);
    t.bigInteger('revenue').notNullable().defaultTo(0); // grosze
    t.integer('points_earned').notNullable().defaultTo(0);
    t.integer('points_burned').notNullable().defaultTo(0);
    t.integer('rewards_redeemed').notNullable().defaultTo(0);
    t.integer('stamps_added').notNullable().defaultTo(0);
    t.timestamps(true, true);
    t.unique(['tenant_id', 'date', 'location_id']);
  });

  // ==================== AUDIT LOG ====================
  await knex.schema.createTable('audit_log', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    t.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
    t.string('action', 100).notNullable();
    t.string('entity_type', 50).notNullable();
    t.uuid('entity_id');
    t.jsonb('old_values');
    t.jsonb('new_values');
    t.string('ip_address', 45);
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.index(['tenant_id', 'created_at']);
    t.index(['tenant_id', 'entity_type', 'entity_id']);
  });

  // ==================== ROW LEVEL SECURITY ====================
  const rlsTables = [
    'users', 'locations', 'customers', 'loyalty_programs', 'tiers',
    'rewards', 'transactions', 'points_ledger', 'stamp_card_definitions',
    'stamp_cards', 'stamp_events', 'vouchers', 'voucher_redemptions',
    'gift_cards', 'gift_card_transactions', 'consent_templates', 'consents',
    'consent_audit_log', 'campaigns', 'campaign_recipients',
    'automation_workflows', 'automation_executions', 'kiosk_devices',
    'kiosk_sync_queue', 'webhook_endpoints', 'webhook_deliveries',
    'payment_events', 'pos_integrations', 'analytics_daily', 'audit_log',
  ];

  for (const table of rlsTables) {
    await knex.raw(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY`);
    await knex.raw(`
      CREATE POLICY tenant_isolation_${table} ON "${table}"
      USING (tenant_id::text = current_setting('app.current_tenant', true))
    `);
  }
}

export async function down(knex: Knex): Promise<void> {
  const tables = [
    'audit_log', 'analytics_daily', 'pos_integrations', 'payment_events',
    'webhook_deliveries', 'webhook_endpoints', 'kiosk_sync_queue', 'kiosk_devices',
    'automation_executions', 'automation_workflows', 'campaign_recipients', 'campaigns',
    'consent_audit_log', 'consents', 'consent_templates',
    'gift_card_transactions', 'gift_cards', 'voucher_redemptions', 'vouchers',
    'stamp_events', 'stamp_cards', 'stamp_card_definitions',
    'points_ledger', 'transactions', 'rewards', 'tiers',
    'loyalty_programs', 'customers', 'locations', 'refresh_tokens', 'users', 'tenants',
  ];

  for (const table of tables) {
    await knex.schema.dropTableIfExists(table);
  }
}
