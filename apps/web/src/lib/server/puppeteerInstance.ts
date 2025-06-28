import 'server-only';
import puppeteer, { Browser } from 'puppeteer';

let browserInstance: Browser | null = null;
// This promise will act as a lock to prevent race conditions during launch.
let launchPromise: Promise<Browser> | null = null;

export async function getBrowserInstance(): Promise<Browser> {
  // If we have a connected instance, reuse it immediately.
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }

  // If a launch is already in progress, wait for it to complete and return the result.
  if (launchPromise) {
    return launchPromise;
  }

  // If no instance exists and no launch is in progress, start a new one.
  console.log('No existing browser instance. Launching a new one...');
  
  const options = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      // '--single-process', // Avoid in production, but can help debug in constrained envs
      '--disable-gpu',
    ],
  };

  // Assign the launch promise to our "lock" variable.
  launchPromise = puppeteer.launch(options);

  try {
    // Wait for the launch to complete.
    const browser = await launchPromise;
    browserInstance = browser;
    
    // Set up a listener to clear the instance if it disconnects unexpectedly.
    browserInstance.on('disconnected', () => {
      console.log('Puppeteer browser instance has disconnected.');
      browserInstance = null;
    });

    return browserInstance;
  } catch (error) {
    // If launch fails, we must clear the promise to allow for a retry.
    console.error('Failed to launch Puppeteer browser:', error);
    throw error; // Re-throw the error to the caller.
  } finally {
    // Once the launch is complete (success or fail), clear the promise lock.
    // This allows the next call to initiate a new launch if the browser has been closed.
    launchPromise = null;
  }
}

// Your graceful shutdown handlers are still valuable for production.
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