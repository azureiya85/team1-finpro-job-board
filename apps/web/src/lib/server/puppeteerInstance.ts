import 'server-only';
import fs from 'fs'; 
import chromium from '@sparticuz/chromium';
import puppeteer, { Browser, LaunchOptions } from 'puppeteer-core';

let browserInstance: Browser | null = null;
let launchPromise: Promise<Browser> | null = null;

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
    try {
      if (fs.existsSync(path)) {
        return path;
      }
    } catch {
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

  const localChromeArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu',
  ];

  if (isDev) {
    // Development configuration: use a local Chrome installation
    const executablePath = findLocalChrome();

    if (!executablePath) {
      throw new Error(
        'Chrome executable not found. Please install Chrome or set CHROME_EXECUTABLE_PATH environment variable.',
      );
    }

    options = {
      executablePath,
      headless: true,
      args: localChromeArgs,
    };
  } else {
    // Production configuration: use @sparticuz/chromium for serverless
    try {
      options = {
        args: [
          ...chromium.args,
          '--hide-scrollbars',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
        ],
        executablePath: await chromium.executablePath(),
        headless: true, // Use headless mode (chromium.headless doesn't exist)
      };
    } catch (error) {
      console.warn(
        'Failed to use @sparticuz/chromium, falling back to local Chrome:',
        error,
      );
      // Fallback for environments where @sparticuz/chromium fails
      const executablePath = findLocalChrome();

      if (!executablePath) {
        throw new Error('Chrome executable not found in production fallback.');
      }

      options = {
        executablePath,
        headless: true,
        args: localChromeArgs,
      };
    }
  }

  // Start the launch process and store the promise to prevent race conditions
  launchPromise = puppeteer.launch(options);

  try {
    const browser = await launchPromise;
    browserInstance = browser;

    // Clean up when the browser disconnects
    browserInstance.on('disconnected', () => {
      console.log('Puppeteer browser instance has disconnected.');
      browserInstance = null;
      launchPromise = null; // Allow a new instance to be launched
    });

    console.log('New browser instance created successfully.');
    return browserInstance;
  } catch (error) {
    console.error('Failed to launch Puppeteer browser:', error);
    // Clear the promise on failure to allow for future retries
    launchPromise = null;
    throw error;
  }
}

// Graceful shutdown handler
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