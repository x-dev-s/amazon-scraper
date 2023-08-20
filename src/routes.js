// routes.js
import { createCheerioRouter, Dataset } from 'crawlee';
import { BASE_URL, labels } from './constants.js';

export const router = createCheerioRouter();

router.addHandler(labels.START, async ({ $, crawler, request }) => {
    const products = $('div > div[data-asin]:not([data-asin=""])');

    for (const product of products) {
        const element = $(product);
        const titleElement = $(element.find('.a-text-normal[href]'));

        const url = `${BASE_URL}${titleElement.attr('href')}`;

        await crawler.addRequests([
            {
                url,
                label: labels.PRODUCT,
                userData: {
                    data: {
                        title: titleElement.first().text().trim(),
                        asin: element.attr('data-asin'),
                    },
                },
            },
        ]);
    }
});

router.addHandler(labels.PRODUCT, async ({ $, crawler, request }) => {
    const { data } = request.userData;

    await crawler.addRequests([
        {
            url: `${BASE_URL}/gp/aod/ajax/ref=auto_load_aod?asin=${data.asin}&pc=dp`,
            label: labels.OFFERS,
            userData: {
                data: {
                    ...data,
                    image: $("#imgTagWrapperId>img").attr('src'),
                    availability: $('#availability>span').text().trim(),
                    price: '$' + $('.a-price .a-price-whole').first().text().trim() + $('.a-price .a-price-fraction').first().text().trim(),
                    saving: $('span.savingPriceOverride').text().trim(),
                    rating: $('#acrPopover>span>a>span').first().text().trim(),
                    ratingCount: $('#acrCustomerReviewText').first().text().trim(),
                    bestSeller: $('div.zg-badge-wrapper i').text().trim(),
                    amazonChoice: $('span.ac-badge-rectangle').text().trim(),
                    description: $('#productDescription').text().trim(),
                },
            },
        },
    ]);
});

router.addHandler(labels.OFFERS, async ({ $, request }) => {
    const { data } = request.userData;

    for (const offer of $('#aod-offer')) {
        const element = $(offer);

        await Dataset.pushData({
            ...data,
            sellerName: element.find('div[id*="soldBy"] a[aria-label]').text().trim(),
        });
    }
});