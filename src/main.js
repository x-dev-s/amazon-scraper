// main.js
import { CheerioCrawler, KeyValueStore, log, Dataset} from 'crawlee';
import { router } from './routes.js';
import { BASE_URL } from './constants.js';

// Grab our keyword from the input
const { keyword } = await KeyValueStore.getInput();
const { page } = await KeyValueStore.getInput();
const { sort } = await KeyValueStore.getInput();
const crawler = new CheerioCrawler({
    requestHandler: router,
});

// Add our initial requests
for (var i = 1; i <= page; i++){
await crawler.addRequests([
    {
        // Turn the inputted keyword into a link we can make a request with
        url: `${BASE_URL}/s?k=${keyword}&s=${sort}&page=${i}`,
        label: 'START',
        userData: {
            keyword,
        },
    },
]);
}
log.info('Starting the crawl.');
await crawler.run();
const dataset = await Dataset.open()
await KeyValueStore.setValue('OUTPUT', (await dataset.getData()).items);
log.info('Crawl finished.');