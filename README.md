# 🤡 headful puppet

>  *A headful chromium in a docker container; waiting to have your strings attached.*

**Testing and API crawling via the *remote debugging API*, with**

* 📺 **headful** chromium; using *xvfb*
* 🕶 **stealth mode** for user-detection or DDOS-prevention evasion
* 📰 **logging** console events, page- and request errors to container output



## run
> ⚡ this image is **BIG** (*900M*)

Run the container and expose the remote debugging port (default: `9222`)

```bash
docker run -p 9222:9222 bitmeal/headful-puppet
```

## config

Configure the container using environment variables with the `-e` flag:

* `STEALTH`: enable stealth mode; see below; *off* by default, set any value to enable
* `PORT`: debug interface port to listen on for external connections; default `9222`
* `PORT_INTERNAL`: internal port; proxied to `PORT`; default `9992`

## use

Use your favourite implementation of the chrome remote debugging API and point it to the address of your container, or localhost if port is exposed. The default config uses the default remote debugging port `9222`.

```js
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
```

The example shows the use of *puppeteer* in *Node.js*, though any other implementation of the API may be used. When using *puppeteer*, you may use the `puppeteer-core` package in your application to skip fetching a local chromium executable.

## stealth

```bash
docker run -p 9222:9222 -e STEALTH=1 bitmeal/headful-puppet
```

For API crawling on endpoints with user-detection or DDOS-prevention mechanisms, the packages `puppeteer-extra` and `puppeteer-extra-plugin-stealth` provide chromium with the necessary flags and settings for successful evasion mechanisms. Here, relying on tried community resources allows faster integration and deployment, and is the main motivation to use `puppeteer` as a provider for chromium.

To use stealth mode to its' full capabilities, use *Node.js* with `pupeteer`, `puppeteer-extra` and `puppeteer-extra-plugin-stealth` packages as your API. See the example below, additionally demoing the use of an incognito context:

```js
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
```




## internal

short summary

* `my_init.sh` from `phusion/baseimage` as init
* *xvfb* to provide "the head"
* chromium provided by `puppeteer` *Node.js* package
* *socat* to prox API to outside of the container (*without `--headless`, binding on `localhost` only*)
* `puppeteer-extra` and `puppeteer-extra-plugin-stealth` for stealth mode and evasion tactics
* `puppeteer` for logging of js-console events and page errors