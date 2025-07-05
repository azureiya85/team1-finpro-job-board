import 'server-only';
import fs from 'fs';
import chromium from '@sparticuz/chromium';
import puppeteer, { Browser, LaunchOptions } from 'puppeteer-core';

let browserInstance: Browser | null = null;
let launchPromise: Promise<Browser> | null = null;

// This function is only for local development.
function findLocalChrome(): string {
  const possiblePaths = [
    // Unix-like
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    // Windows
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];

  for (const path of possiblePaths) {
    if (fs.existsSync(path)) {
      return path;
    }
  }
  return '';
}

export async function getBrowserInstance(): Promise<Browser> {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }

  if (launchPromise) {
    return launchPromise;
  }

  console.log('No existing browser instance. Launching a new one...');

  const isDev = process.env.NODE_ENV === 'development';
  let options: LaunchOptions;

  if (isDev) {
    console.log('Running in development mode. Using local Chrome.');
    const executablePath = findLocalChrome();
    if (!executablePath) {
      throw new Error(
        'Chrome executable not found for development. Please install Chrome.',
      );
    }
    options = {
      executablePath,
      headless: true, 
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    };
  } else {
    console.log('Running in production mode. Using @sparticuz/chromium.');
    options = {
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true, 
    };
  }

  launchPromise = puppeteer.launch(options);

  try {
    const browser = await launchPromise;
    browserInstance = browser;

    browserInstance.on('disconnected', () => {
      console.log('Puppeteer browser instance has disconnected.');
      browserInstance = null;
      launchPromise = null;
    });

    console.log('New browser instance created successfully.');
    return browserInstance;
  } catch (error) {
    console.error('Failed to launch Puppeteer browser:', error);
    launchPromise = null; 
    throw error;
  }
}

// Graceful shutdown handlers remain the same.
async function closeBrowser() {
  if (browserInstance) {
    console.log('Closing browser instance...');
    await browserInstance.close();
    browserInstance = null;
    launchPromise = null;
  }
}

process.on('SIGINT', async () => {
  await closeBrowser();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeBrowser();
  process.exit(0);
});