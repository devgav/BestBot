const puppeteer = require('puppeteer');
const daPackage = require('./info.json');

async function initBrowser() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });
    const context = browser.defaultBrowserContext();
    const page = await browser.newPage();
    await page.goto(daPackage.url, {waitUntil: 'domcontentloaded'});
    await context.overridePermissions(daPackage.url, ['geolocation']);
    await page.setGeolocation({
        latitude: 21.387370,
        longitude: -157.949090,
        accuracy: 21
    });
    await page.waitForSelector('.store-name-link:not(:empty)');
    await checkPurchase(page);
    await fillOutInfo(page);
}

async function fillOutInfo(page) {
    await page.waitForSelector('.go-to-cart-button', {visible: true});
    await page.click('.go-to-cart-button');
    await page.waitForTimeout(4000);
    try {
        await page.click('.btn.btn-lg.btn-block.btn-primary');
    } catch (e) {
        console.log("this failed");
    }
    await page.waitForSelector('#fld-e');
    await page.type('#fld-e', daPackage.email);
    await page.type('#fld-p1', daPackage.password);
    await page.click('.cia-form__controls');
    await page.waitForSelector('.checkout-panel.contact-card > .contact-card__order-button > .button--place-order-fast-track  > .payment__order-summary > .btn.btn-lg.btn-block.btn-primary.button__fast-track');
    const creditCardSummary = await page.evaluate(() => document.querySelector('.credit-card-summary__cvv'));
    if (creditCardSummary !== null) {
        const cvv = await page.evaluate(() => document.querySelector('#cvv').getAttribute('id'));
        await page.type(`#${cvv}`, daPackage.cvv);
    }
    await page.waitForTimeout(3000);
    try {
        await page.click('.checkout-panel.contact-card > .contact-card__order-button > .button--place-order-fast-track  > .payment__order-summary > .btn.btn-lg.btn-block.btn-primary.button__fast-track');
    } catch (e) {
        console.log("failed to click on place order button");
    }
}

/*
    Check if each element is in stock
    Check if the price is reasonable
    Also need this to click to the next page if there is nothing to click
 */
async function checkPurchase(page) {
    let itemNotPurchased = true;
    let buttonText = await page.$$eval('.sku-list-item-button > div > div > div', el => el.map(options => options.getAttribute('id')));
    let addToCartList = await page.$$eval('.fulfillment-add-to-cart-button', el => el.map(options => options.textContent));
    let price = await page.$$eval(`.priceView-hero-price > span:first-of-type`, el => el.map(options => options.textContent));
    let gpuName = await page.$$eval('.sku-title', el => el.map(options => options.textContent));
    let counter = 1;

    while(itemNotPurchased) {
        for (let i = 0; i < buttonText.length; i++) {
            //removes the '$'
            let priceWithoutDollarSign = Number(price[i].replace(/[^0-9.-]+/g,""));

            //checks if the item we are looking for is there then click on the add to cart button
            if (priceWithoutDollarSign <= 579 && gpuName[i].includes('6800') && addToCartList[i] === "Add to Cart") {
                await page.click(`#${buttonText[i]}`, {clickCount: 1});
                itemNotPurchased = false;
                break;
            }
            if (priceWithoutDollarSign <= 400 && gpuName[i].includes('3060 TI') && addToCartList[i] === "Add to Cart") {
                await page.click(`#${buttonText[i]}`, {clickCount: 1});
                itemNotPurchased = false;
                break;
            }
            if (priceWithoutDollarSign <= 599 && gpuName[i].includes('3070 TI') && addToCartList[i] === "Add to Cart") {
                await page.click(`#${buttonText[i]}`, {clickCount: 1});
                itemNotPurchased = false;
                break;
            }
            if (priceWithoutDollarSign <= 699 && gpuName[i].includes('3080') && addToCartList[i] === "Add to Cart") {
                await page.click(`#${buttonText[i]}`, {clickCount: 1});
                itemNotPurchased = false;
                break;
            }
            if (priceWithoutDollarSign<= 329 && gpuName[i].includes('3060') && addToCartList[i] === "Add to Cart") {
                await page.click(`#${buttonText[i]}`, {clickCount: 1});
                itemNotPurchased = false;
                break;
            }
            if (priceWithoutDollarSign <= 599 && gpuName[i].includes('3070') && addToCartList[i] === "Add to Cart") {
                await page.click(`#${buttonText[i]}`, {clickCount: 1});
                itemNotPurchased = false;
                break;
            }
        }
        //this will break out of the while loop early so that it doesn't reload the page one more time
        if (!itemNotPurchased) {
            break;
        }
        await page.waitForTimeout(1000);
        await page.goto(daPackage.url);
        //empty the array and create a new array of elements
        // buttonText.splice(0, buttonText.length);
        console.log(counter++);
        await page.waitForTimeout(1000);
        buttonText = await page.$$eval('.sku-list-item-button > div > div > div', el => el.map(options => options.getAttribute('id')));
    }
}

initBrowser();