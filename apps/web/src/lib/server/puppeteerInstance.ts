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

  const options = {
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true, 
  };

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