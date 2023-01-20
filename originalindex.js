// Code taken from original tutorial: https://www.youtube.com/watch?v=lgyszZhAZOI

const puppeteer = require('puppeteer')
const fs = require('fs/promises')


async function start() {
    // Had issues with libnss3. Answer below solved it. Had to insert "sudo" to get each install to work
    // https://stackoverflow.com/questions/58134793/error-while-loading-shared-libraries-libnss3-so-while-running-gtlab-ci-job-to
    const browser = await puppeteer.launch({
        ignoreDefaultArgs: ['--disable-extensions'],
      });
    const page = await browser.newPage()
    await page.goto("https://learnwebcode.github.io/practice-requests/")
    

    const names = await page.evaluate(() => {
        // Array.from turns the returned nodes into a loopable array.
        // The map method extracts just the text from the html
        // Note: This function is in the chrome browser as opposed to node.js. So a console.log here won't print to terminal below
        return Array.from(document.querySelectorAll(".info strong")).map(x => x.textContent)
    })
    await fs.writeFile("names.txt", names.join("\r\n"))

    // Auto Clicks the button to display additional text then captures that text
    await page.click("#clickme")
    const clickedData = await page.$eval("#data", el => el.textContent)
    console.log("Clicked Data :", clickedData)

    const photos = await page.$$eval("img", (imgs) => {
        return imgs.map(x => x.src)
    })
    for (const photo of photos) {
        const imagepage = await page.goto(photo)
        await fs.writeFile(photo.split("/").pop(), await imagepage.buffer())
    }
    

    // Not needed, but a nice feature. Adding the full page section captures the whople page as opposed to just whats on the screen
    // await page.screenshot({path: "amazing.png", fullPage: true })
    await browser.close()

    console.log("Hello World")
}

start()
