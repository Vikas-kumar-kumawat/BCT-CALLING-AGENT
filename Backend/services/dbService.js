// dbService.js — Seamless Supabase database operations for BCT Calling Agent
// Handles: customer upsert (no duplicates) + per-call feedback history
'use strict'

const db = require('../config/supabase')

// ─────────────────────────────────────────────────────────────────────────────
// Startup check — verifies both tables exist and are reachable
// Called once when the server boots. Logs clear messages, never crashes.
// ─────────────────────────────────────────────────────────────────────────────
async function initDB() {
  console.log('[DB] Checking database tables...')

  // Check customers table
  const { error: custErr } = await db.from('customers').select('id').limit(1)
  if (custErr) {
    console.error('[DB] ❌ "customers" table not reachable:', custErr.message)
  } else {
    console.log('[DB] ✓ "customers" table OK')
  }

  // Check feedbacks table
  const { error: fbErr } = await db.from('feedbacks').select('id').limit(1)
  if (fbErr) {
    console.error('[DB] ❌ "feedbacks" table not reachable:', fbErr.message)
    console.error('[DB] ⚠ Run this SQL in Supabase Dashboard → SQL Editor:')
    console.error(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id            BIGSERIAL PRIMARY KEY,
        customer_name TEXT,
        mobile_number TEXT        NOT NULL,
        feedback_text TEXT        NOT NULL,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS feedbacks_mobile_idx ON feedbacks (mobile_number);
    `)
  } else {
    console.log('[DB] ✓ "feedbacks" table OK')
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// upsertCustomer — ensures one row per mobile number in the customers table.
// Uses select-then-upsert pattern so it works even without a DB UNIQUE constraint.
// ─────────────────────────────────────────────────────────────────────────────
async function upsertCustomer(name, mobileNumber) {
  try {
    // Try upsert with onConflict first (fast path if UNIQUE constraint exists)
    const { error } = await db
      .from('customers')
      .upsert(
        [{ name, 'mobile-number': mobileNumber }],
        { onConflict: 'mobile-number', ignoreDuplicates: false }
      )

    if (!error) return // success

    // Fallback: if upsert failed (e.g. no unique constraint), try select → insert
    console.warn('[DB] upsert fallback triggered:', error.message)
    const { data: existing } = await db
      .from('customers')
      .select('id')
      .eq('mobile-number', mobileNumber)
      .limit(1)

    if (!existing || existing.length === 0) {
      const { error: insertErr } = await db
        .from('customers')
        .insert([{ name, 'mobile-number': mobileNumber }])
      if (insertErr) console.warn('[DB] Customer insert error:', insertErr.message)
    }
    // If already exists, do nothing — no duplicate
  } catch (err) {
    console.warn('[DB] upsertCustomer exception:', err.message)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// insertFeedback — inserts a single feedback utterance into the feedbacks table.
// Falls back to logging if the table doesn't exist yet.
// ─────────────────────────────────────────────────────────────────────────────
async function insertFeedback(name, mobileNumber, feedbackText) {
  try {
    const { error } = await db
      .from('feedbacks')
      .insert([{
        customer_name: name,
        mobile_number: mobileNumber,
        feedback_text: feedbackText,
        created_at   : new Date().toISOString()
      }])

    if (error) {
      console.warn('[DB] Feedback insert error:', error.message)
      // Graceful fallback: store in customers.feedback column if feedbacks table missing
      if (error.message.includes('does not exist') || error.code === '42P01') {
        await db
          .from('customers')
          .update({ feedback: feedbackText })
          .eq('mobile-number', mobileNumber)
          .catch(() => {})
      }
    } else {
      console.log(`[DB] ✓ Feedback saved for ${mobileNumber}: "${feedbackText.slice(0, 60)}"`)
    }
  } catch (err) {
    console.warn('[DB] insertFeedback exception:', err.message)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// storeFeedback — main entry point. Fire-and-forget safe.
// Runs both operations in parallel for speed.
// ─────────────────────────────────────────────────────────────────────────────
async function storeFeedback(name, mobileNumber, feedbackText) {
  // Run both in parallel — neither blocks the voice call
  await Promise.allSettled([
    upsertCustomer(name, mobileNumber),
    insertFeedback(name, mobileNumber, feedbackText)
  ])
}

module.exports = { storeFeedback, initDB }
