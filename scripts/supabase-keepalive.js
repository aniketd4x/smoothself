#!/usr/bin/env node

/**
 * Supabase Keep-Alive Health-Check Script
 * 
 * Purpose:
 * Sends a lightweight, read-only query to Supabase via PostgREST to generate
 * authentic PostgreSQL database activity, preventing automatic pausing on the Free tier.
 * 
 * Features:
 * - Exponential backoff retries with per-request timeouts.
 * - Configurable randomized delay (jitter) to prevent static execution patterns.
 * - Comprehensive logging without exposing sensitive keys or credentials.
 * - Automatic GitHub Actions Step Summary generation when executed in CI.
 */

const fs = require('fs');
const path = require('path');

// Optional local .env loading for local development/testing
try {
  require('dotenv').config();
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
} catch {
  // Ignore if dotenv is not available in environment
}

// Configuration from environment variables
const SUPABASE_URL = (
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  ''
).trim().replace(/\/+$/, '');

const SUPABASE_ANON_KEY = (
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();

const ENDPOINT_PATH = process.env.KEEPALIVE_ENDPOINT || '/rest/v1/categories?select=id&limit=1';
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || '3', 10);
const INITIAL_RETRY_DELAY_MS = parseInt(process.env.RETRY_DELAY_MS || '4000', 10);
const TIMEOUT_MS = parseInt(process.env.TIMEOUT_MS || '15000', 10);
const RANDOM_DELAY_MAX_SEC = parseInt(process.env.RANDOM_DELAY_MAX_SEC || '0', 10);

/**
 * Mask URL to protect sensitive project references or hostnames in public logs.
 */
function maskUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    const hostParts = parsed.hostname.split('.');
    if (hostParts.length >= 3) {
      const ref = hostParts[0];
      const maskedRef = ref.length > 6 ? `${ref.slice(0, 3)}...${ref.slice(-3)}` : '***';
      return `${parsed.protocol}//${maskedRef}.${hostParts.slice(1).join('.')}`;
    }
    return parsed.hostname;
  } catch {
    return 'https://***.supabase.co';
  }
}

/**
 * Sleep helper.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Write a Markdown report to $GITHUB_STEP_SUMMARY if available.
 */
function writeGitHubSummary(summaryData) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) return;

  const {
    success,
    status,
    latencyMs,
    attempts,
    timestamp,
    maskedUrl,
    endpoint,
    errorMessage
  } = summaryData;

  const icon = success ? '✅' : '❌';
  const statusBadge = success
    ? '`ACTIVE (200 OK)`'
    : `\`FAILED (${status || 'ERROR'})\``;

  const markdown = `
### ${icon} Supabase Keep-Alive Health-Check

| Metric | Details |
| :--- | :--- |
| **Status** | ${statusBadge} |
| **Execution Time** | \`${timestamp}\` |
| **Target Host** | \`${maskedUrl}\` |
| **Endpoint Queried** | \`${endpoint}\` |
| **HTTP Status Code** | \`${status || 'N/A'}\` |
| **Response Latency** | \`${latencyMs} ms\` |
| **Attempts Required** | \`${attempts} of ${MAX_RETRIES}\` |
${errorMessage ? `| **Failure Reason** | \`${errorMessage}\` |\n` : ''}

> **Note**: Supabase Free Tier projects automatically pause after 7 consecutive days of inactivity. This keep-alive query initiates a real \`SELECT\` query via PostgREST against the Postgres database engine, resetting the inactivity timer without creating writes.
`;

  try {
    fs.appendFileSync(summaryPath, markdown, 'utf8');
  } catch (err) {
    console.warn(`[Keep-Alive Warning] Could not write to GITHUB_STEP_SUMMARY: ${err.message}`);
  }
}

/**
 * Perform a single HTTP request with timeout.
 */
async function sendPing(targetUrl, key) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const startTime = Date.now();

  try {
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SmoothSelf-KeepAlive/1.0'
      },
      signal: controller.signal
    });

    const latencyMs = Date.now() - startTime;
    clearTimeout(timeoutId);

    const isJson = (res.headers.get('content-type') || '').includes('application/json');
    const data = isJson ? await res.json().catch(() => null) : null;

    return {
      ok: res.ok,
      status: res.status,
      latencyMs,
      data,
      dateHeader: res.headers.get('date'),
      error: res.ok ? null : `HTTP Error ${res.status}: ${res.statusText}`
    };
  } catch (error) {
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    const isTimeout = error.name === 'AbortError';
    return {
      ok: false,
      status: isTimeout ? 408 : 0,
      latencyMs,
      data: null,
      error: isTimeout ? `Request timed out after ${TIMEOUT_MS}ms` : error.message
    };
  }
}

/**
 * Main execution flow
 */
async function run() {
  const timestamp = new Date().toISOString();
  console.log('====================================================');
  console.log(`[Supabase Keep-Alive] Started at: ${timestamp}`);
  console.log('====================================================');

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    const err = 'SUPABASE_URL or SUPABASE_ANON_KEY is not defined in environment.';
    console.error(`[Keep-Alive Error] ${err}`);
    console.error('Ensure secrets SUPABASE_URL and SUPABASE_ANON_KEY are set in GitHub Repository Secrets.');
    writeGitHubSummary({
      success: false,
      status: 'MISSING_ENV',
      latencyMs: 0,
      attempts: 0,
      timestamp,
      maskedUrl: 'Unknown',
      endpoint: ENDPOINT_PATH,
      errorMessage: err
    });
    process.exit(1);
  }

  const maskedHost = maskUrl(SUPABASE_URL);
  console.log(`[Target Host] : ${maskedHost}`);
  console.log(`[Target Path] : ${ENDPOINT_PATH}`);
  console.log(`[Max Retries] : ${MAX_RETRIES}`);

  // Randomized delay / jitter
  if (RANDOM_DELAY_MAX_SEC > 0) {
    const jitterSec = Math.floor(Math.random() * RANDOM_DELAY_MAX_SEC) + 1;
    console.log(`[Jitter Delay]: Sleeping for ${jitterSec} seconds before pinging...`);
    await sleep(jitterSec * 1000);
  }

  const cleanEndpoint = ENDPOINT_PATH.startsWith('/') ? ENDPOINT_PATH : `/${ENDPOINT_PATH}`;
  const fullTargetUrl = `${SUPABASE_URL}${cleanEndpoint}`;

  let attempt = 0;
  let lastResult = null;

  while (attempt < MAX_RETRIES) {
    attempt++;
    console.log(`\n--> [Attempt ${attempt}/${MAX_RETRIES}] Querying Supabase endpoint...`);

    lastResult = await sendPing(fullTargetUrl, SUPABASE_ANON_KEY);

    if (lastResult.ok && lastResult.status >= 200 && lastResult.status < 300) {
      console.log(`✔ [Attempt ${attempt} Success] HTTP ${lastResult.status} OK in ${lastResult.latencyMs}ms`);
      console.log(`✔ [Database Activity Confirmed] Real query registered via PostgREST.`);

      writeGitHubSummary({
        success: true,
        status: lastResult.status,
        latencyMs: lastResult.latencyMs,
        attempts: attempt,
        timestamp: new Date().toISOString(),
        maskedUrl: maskedHost,
        endpoint: cleanEndpoint,
        errorMessage: null
      });

      console.log('\n====================================================');
      console.log('[Supabase Keep-Alive] SUCCESS. Timer reset successfully.');
      console.log('====================================================');
      process.exit(0);
    }

    console.warn(`✖ [Attempt ${attempt} Failed] ${lastResult.error || `HTTP ${lastResult.status}`}`);

    if (attempt < MAX_RETRIES) {
      const backoffMs = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      console.log(`⏳ Waiting ${backoffMs / 1000}s before retry...`);
      await sleep(backoffMs);
    }
  }

  // All attempts exhausted
  console.error('\n====================================================');
  console.error(`[Supabase Keep-Alive] FAILED after ${MAX_RETRIES} attempts.`);
  console.error(`Final Error: ${lastResult?.error || 'Unknown error'}`);
  console.error('Possibilities:');
  console.error('1. The Supabase project is currently PAUSED or in maintenance.');
  console.error('2. Supabase API credentials (URL / Anon key) in GitHub Secrets are invalid or rotated.');
  console.error('3. Network unreachable or DNS resolution failure.');
  console.error('Visit https://supabase.com/dashboard to verify project status.');
  console.error('====================================================');

  writeGitHubSummary({
    success: false,
    status: lastResult?.status || 0,
    latencyMs: lastResult?.latencyMs || 0,
    attempts: attempt,
    timestamp: new Date().toISOString(),
    maskedUrl: maskedHost,
    endpoint: cleanEndpoint,
    errorMessage: lastResult?.error || 'All retry attempts exhausted.'
  });

  process.exit(1);
}

run().catch((err) => {
  console.error('[Fatal Error]', err.message);
  process.exit(1);
});
