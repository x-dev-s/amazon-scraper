// routes.js
import { createCheerioRouter, Dataset } from 'crawlee';
import { BASE_URL, labels } from './constants.js';

export const router = createCheerioRouter();

router.addHandler(labels.START, async ({ $, crawler }) => {
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
                    availability: $('#availability>span').text().trim() || $('#outOfStock .a-text-bold').text().trim() || $('#deliveryBlockMessage .a-color-error').text().trim(),
                    price: ($('.a-price .a-price-whole').first().text().trim() + $('.a-price .a-price-fraction').first().text().trim()) || $('#price_inside_buybox').text().trim(),
                    saving: $('span.savingPriceOverride').first().text().trim(),
                    rating: $('#acrPopover>span>a>span').first().text().trim(),
                    reviews: $('#acrCustomerReviewText').first().text().trim(),
                    tag: $('div.zg-badge-wrapper i').text().trim() || $('span.ac-badge-rectangle').text().trim(),
                    description: $('#productDescription').text().trim() || $('#feature-bullets').text().trim() || $('.bundle-comp-bullets').text().trim(),
                },
            },
        },
    ]);
});

router.addHandler(labels.OFFERS, async ({ $, request }) => {
    const { data } = request.userData;
    await Dataset.pushData({
        ...data,
    });
});