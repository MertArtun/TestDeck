import { spawn } from 'child_process';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import process from 'process';
import puppeteer from 'puppeteer';

const ROOT = process.cwd();
const SCREEN_DIR = path.join(ROOT, 'docs', 'screenshots');
const PREVIEW_PORT = process.env.PREVIEW_PORT || '4173';
const BASE_URL = `http://localhost:${PREVIEW_PORT}`;

async function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', ...opts });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve(undefined);
      else reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`));
    });
  });
}

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) return true;
    } catch (_) {
      // ignore until ready
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server did not become ready at ${url} within ${timeoutMs}ms`);
}

async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true });
}

async function main() {
  console.log('📸 Capturing screenshots from live app...');
  await ensureDir(SCREEN_DIR);

  console.log('🏗️ Building web app...');
  await run('npm', ['run', 'build']);

  console.log('🔎 Starting preview server...');
  const preview = spawn('npm', ['run', 'preview', '--', '--port', PREVIEW_PORT, '--strictPort'], {
    stdio: 'inherit',
  });

  try {
    await waitForServer(`${BASE_URL}/`);

    const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 } });
    const page = await browser.newPage();

    const routes = [
      { path: '/', name: 'dashboard', waitFor: '#root' },
      { path: '/create', name: 'create-card', waitFor: '#root' },
      { path: '/study', name: 'study-mode', waitFor: '#root' },
    ];

    const languages = [
      { code: 'en', prefix: '' },
      { code: 'tr', prefix: 'tr-' },
    ];

    for (const lang of languages) {
      // Ensure language in persisted store
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2', timeout: 60_000 });
      await page.evaluate((language) => {
        const state = {
          mode: 'auto',
          colorScheme: 'blue',
          fontSize: 'medium',
          language,
          soundEnabled: true,
          animationsEnabled: true,
          autoSave: true,
          questionsPerSession: 10,
          timePerQuestion: 0,
          showHints: true,
          showProgress: true,
          studyReminders: true,
          achievementNotifications: true,
        };
        localStorage.setItem('theme-settings', JSON.stringify({ state, version: 1 }));
      }, lang.code);
      await page.reload({ waitUntil: 'networkidle2', timeout: 60_000 });

      for (const r of routes) {
        const url = `${BASE_URL}${r.path}`;
        console.log(`➡️  [${lang.code}] Navigating: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60_000 });
        if (r.waitFor) {
          await page.waitForSelector(r.waitFor, { timeout: 30_000 });
        }
        await new Promise((res) => setTimeout(res, 600));
        const file = `${lang.prefix}${r.name}.png`;
        const outPath = path.join(SCREEN_DIR, file);
        await page.screenshot({ path: outPath, fullPage: false });
        console.log(`✅ Saved: ${path.relative(ROOT, outPath)}`);
      }
    }

    await browser.close();
  } finally {
    console.log('🛑 Stopping preview server...');
    if (preview && !preview.killed) {
      preview.kill();
    }
  }
}

main().catch((err) => {
  console.error('❌ Screenshot capture failed:', err);
  process.exit(1);
});


