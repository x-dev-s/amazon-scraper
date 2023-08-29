// main.js
import UserAgent from 'user-agents';
import { CheerioCrawler, ProxyConfiguration, KeyValueStore, log, Dataset } from 'crawlee';
import { router } from './routes.js';
import { BASE_URL } from './constants.js';

const proxyConfiguration = new ProxyConfiguration({
    proxyUrls: [
        'http://proxy-1.com',
        'http://proxy-2.com',
    ],
});
const userAgent = new UserAgent({
    deviceCategory: 'desktop'
});
console.log(userAgent.toString());
const { keyword } = await KeyValueStore.getInput();
const { page } = await KeyValueStore.getInput();
const { sort } = await KeyValueStore.getInput();
const crawler = new CheerioCrawler({
    // proxyConfiguration,
    // useSessionPool: true,
    // persistCookiesPerSession: true,
    // async requestHandler({ session, $ }) {
    //     const title = $('title').text();
    //     if (title === 'Blocked') {
    //         session.retire();
    //     } else if (title === 'Not sure if blocked, might also be a connection error') {
    //         session.markBad();
    //     }
    // },
    minConcurrency: 5,
    maxConcurrency: 15,
    requestHandler: router,
    preNavigationHooks: [
        function customUserAgent(_ctx, opts = {}) {
            opts.headers = opts.headers || userAgent;
            opts.useHeaderGenerator = false;
        },
    ],
});
// Add our initial requests
for (var i = 1; i <= page; i++) {
    await crawler.addRequests([
        {
            url: `${BASE_URL}/s?k=${keyword}&s=${sort}&page=${i}`,
            label: 'START',
        },
    ]);
}
log.info('Starting the crawl.');
await crawler.run();
const dataset = await Dataset.open()
await KeyValueStore.setValue('OUTPUT', (await dataset.getData()).items);
log.info('Crawl finished.');