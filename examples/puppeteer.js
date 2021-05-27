// node.js + puppeteer example

const puppeteer = require('puppeteer-core');

(async () => {
	const browser = await puppeteer.connect({ browserURL: 'http://localhost:9222' });
    const page = await browser.newPage();

    await page.goto('https://github.com/bitmeal', { waitUntil: 'networkidle2' });
    // do something
    await page.close();

    browser.disconnect();
})();