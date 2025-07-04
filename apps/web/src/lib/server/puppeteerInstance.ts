import 'server-only';
import chromium from '@sparticuz/chromium';
import puppeteer, { Browser } from 'puppeteer-core';

let browserInstance: Browser | null = null;
let launchPromise: Promise<Browser> | null = null;

export async function getBrowserInstance(): Promise<Browser> {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }

  if (launchPromise) {
    return launchPromise;
  }

  console.log('No existing browser instance. Launching a new one...');

  const isDev = process.env.NODE_ENV === 'development';
  
  let options;
  
  if (isDev) {
    // Development configuration (local machine)
    options = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ],
    };
  } else {
    // Production configuration (Vercel)
    try {
      options = {
        args: [
          ...chromium.args,
          '--hide-scrollbars',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
        ],
        executablePath: await chromium.executablePath(),
        headless: true,
      };
    } catch (error) {
      console.warn('Failed to use @sparticuz/chromium, falling back to local Chrome:', error);
      // Fallback to local Chrome if chromium fails
      options = {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ],
      };
    }
  }

  launchPromise = puppeteer.launch(options);

  try {
    const browser = await launchPromise;
    browserInstance = browser;

    browserInstance.on('disconnected', () => {
      console.log('Puppeteer browser instance has disconnected.');
      browserInstance = null;
    });

    return browserInstance;
  } catch (error) {
    console.error('Failed to launch Puppeteer browser:', error);
    launchPromise = null;
    throw error;
  }
}

process.on('SIGINT', async () => {
  if (browserInstance) {
    console.log('Closing browser instance on SIGINT...');
    await browserInstance.close();
    browserInstance = null;
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (browserInstance) {
    console.log('Closing browser instance on SIGTERM...');
    await browserInstance.close();
    browserInstance = null;
  }
  process.exit(0);
});