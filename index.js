console.log("--- Page Reload Point ---")
const puppeteer = require('puppeteer')
const fs = require('fs/promises')


async function start() {
    // Had issues with libnss3. Answer below solved it. Had to insert "sudo" to get each install to work
    // https://stackoverflow.com/questions/58134793/error-while-loading-shared-libraries-libnss3-so-while-running-gtlab-ci-job-to
    const browser = await puppeteer.launch({
        ignoreDefaultArgs: ['--disable-extensions'],
      });
    const page = await browser.newPage()
    await page.goto("https://order.syscoireland.com/")
    

    // Gets the main categories from the Home Page
    const categories = await page.evaluate(() => {
       return Array.from(document.querySelectorAll("[data-pb-style='HBP958S']")).map(x => x.href)
    })
    for (const category of categories) {
        console.log("Category: ", category)

        // Gets the Subcategories from the Main Category Landing Page
        await page.goto(category)
        const subcats = await page.evaluate(() => {
            // ".subcategory-list.all > a"
            return Array.from(document.querySelectorAll("[href='https://order.syscoireland.com/catalog/category/view/s/beef/id/10796/']")).map(x => x.href)
            // return Array.from(document.querySelectorAll(".subcategory-list.all a")).map(x => x.href)
        })
        console.log("Subcats: ", subcats)


        for (const subcatitem of subcats) { 
            await page.goto(subcatitem)
            
            // const button = document.querySelectorAll(".load-more-wrapper button")
            // await button.evaluate(b => b.click());
            const products = await page.evaluate(() => {
                // await page.click(".load-more-wrapper button")
                return Array.from(document.querySelectorAll(".product-item-link")).map(x => x.href)
            })
            console.log("Products: ", products)

            for (const product of products) {
                await page.goto(product)
                const nutrition = await page.evaluate(() => {
                    return Array.from(document.querySelectorAll(".product-attribute-nutrition tr")).map(x => `${x.firstChild.textContent}_${x.lastChild.textContent}`)
                })
                // console.log("Nutrition: ", nutrition) 
            }
        }
    }

    // $('.product-attribute-nutrition').find('tr').each(function(index) {
    //     // console.log(index, ': ', $(this))
    //     const nutrition = $(this).children("td:nth-of-type(1)").text();
    //     const value = $(this).children("td:nth-of-type(2)").text();
    //     item_data.push({
    //         item,
    //         nutrition,
    //         value
    //     })
    // })

    
    // console.log("Titles: ", names)
    // await fs.writeFile("names.txt", names.join("\r\n"))

    

    // const photos = await page.$$eval("img", (imgs) => {
    //     return imgs.map(x => x.src)
    // })
    // for (const photo of photos) {
    //     const imagepage = await page.goto(photo)
    //     // await fs.writeFile(photo.split("/").pop(), await imagepage.buffer())
    // }
    
    await browser.close()

    console.log("Hello World")
}

start()
