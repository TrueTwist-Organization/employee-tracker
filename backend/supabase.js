const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

let supabase;
let verifiedConnection = false;

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env or your hosting environment.',
    );
  }

  if (!supabase) {
    supabase = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabase;
}

function newId() {
  return crypto.randomUUID();
}

function requireData(data, error) {
  if (error) throw error;
  return data;
}

function localDateString(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function toDateOnly(input) {
  if (!input) return null;
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  return localDateString(new Date(input));
}

async function connectDatabase() {
  if (verifiedConnection) return;
  const client = getSupabase();
  const { error } = await client.from('users').select('id').limit(1);
  if (error) throw error;
  verifiedConnection = true;
  console.log('Supabase Connected');
}

module.exports = {
  connectDatabase,
  getSupabase,
  localDateString,
  newId,
  requireData,
  toDateOnly,
};
