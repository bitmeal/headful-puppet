// node.js + puppeteer STEALTH mode example

// !! puppeteer with: npm i puppeteer@npm:puppeteer-core
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
	const browser = await puppeteer.connect({ browserURL: 'http://localhost:9222' });
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();

    await page.goto('https://github.com/bitmeal', { waitUntil: 'networkidle2' });
    // do something
    await page.close();

    browser.disconnect();
})();