// ============================================================
//  SUPABASE CONFIG
//  Paste your credentials below.
//  Find them in: Supabase Dashboard → Settings → API
// ============================================================
const SUPABASE_URL     = 'YOUR_SUPABASE_URL';        // e.g. https://abcdefgh.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';  // long string starting with eyJ...
// ============================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn(
    '[supabase-client] ⚠️  Credentials not configured.\n' +
    'Open supabase-client.js and replace SUPABASE_URL and SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// ── Workers ──────────────────────────────────────────────────────────────────

/**
 * Returns all workers, newest first.
 * @returns {Promise<Array>}
 */
export async function getWorkers() {
  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/**
 * Returns only active workers, sorted by name.
 * Used when deciding who receives a job SMS.
 * @returns {Promise<Array>}
 */
export async function getActiveWorkers() {
  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/**
 * Adds a new worker.
 * @param {{ name: string, phone: string, pin: string }} worker
 * @returns {Promise<Object>} The inserted row.
 */
export async function addWorker({ name, phone, pin }) {
  const { data, error } = await supabase
    .from('workers')
    .insert({ name: name.trim(), phone: phone.trim(), pin, active: true })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Updates a worker's editable fields.
 * @param {string} id  Worker UUID
 * @param {{ name?: string, pin?: string }} updates
 * @returns {Promise<Object>} The updated row.
 */
export async function updateWorker(id, updates) {
  const cleaned = {};
  if (updates.name !== undefined) cleaned.name = updates.name.trim();
  if (updates.pin  !== undefined) cleaned.pin  = updates.pin;
  const { data, error } = await supabase
    .from('workers')
    .update(cleaned)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Toggles a worker's active/inactive state.
 * Inactive workers are excluded from SMS dispatch.
 * @param {string}  id
 * @param {boolean} active
 * @returns {Promise<Object>} The updated row.
 */
export async function setWorkerActive(id, active) {
  const { data, error } = await supabase
    .from('workers')
    .update({ active })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Permanently deletes a worker.
 * Caller must confirm with the user before calling this.
 * @param {string} id  Worker UUID
 */
export async function deleteWorker(id) {
  const { error } = await supabase
    .from('workers')
    .delete()
    .eq('id', id);
  if (error) throw error;
}


// ── Jobs ─────────────────────────────────────────────────────────────────────

/**
 * Returns all open (unclaimed) jobs, newest first.
 * @returns {Promise<Array>}
 */
export async function getOpenJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/**
 * Returns all jobs regardless of status, newest first.
 * Optionally join claimed_by worker name.
 * @returns {Promise<Array>}
 */
export async function getAllJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*, workers(name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
