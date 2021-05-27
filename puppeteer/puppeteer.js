const chalk = require('chalk');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

//// config
const puppeteer_port = process.env['PORT_INTERNAL'];
const port = process.env['PORT'];
if(!port || !puppeteer_port) {
    console.error('no port for external access, or no port for internal use specified! use env PORT *AND* PORT_INTERNAL');
    console.error('exiting');
    process.exit(1);
}

console.log(`using internal port: ${puppeteer_port}`);
console.log(`using external port: ${port}`);

// harden discovery; use stealth mode?
if(process.env['STEALTH']) {
    console.warn('using STEALTH mode!');
    puppeteer.use(StealthPlugin());
}


// main
(async () => {
    // spawn browser
    const browser = await puppeteer.launch({
        headless: false,
        dumpio: true,

        args: [
            `--remote-debugging-port=${puppeteer_port}`,
            '--no-sandbox'
        ],
    });

    // attach console and error listeners for all pages
    browser.on('targetcreated', (target) => {
        if (target.type() === 'page') {
            target.page()
            .then((page) => {
                page
                .on('console', (message) => {
                    const type = message.type().substr(0, 3).toUpperCase();
                    const color = {
                            LOG: text => text,
                            ERR: chalk.red,
                            WAR: chalk.yellow,
                            INF: chalk.cyan
                        }[type] || chalk.blue;

                    console.log(color(`[console][${type}] ${message.text()}`));
                })
                .on('pageerror', ({ message }) => {
                    console.log(chalk.red(`[page-error] ${message}`));
                })
                .on('requestfailed', (request) => {
                    console.log(chalk.magenta(`[failed-req] ${request.failure().errorText} ${request.url()}`));
                });
            });
        }
    });
})();
