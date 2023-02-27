const puppeteer = require("puppeteer");
const args = process.argv.slice(2);
let index = args[0];
const url = args[1];
function waitFor(ms) {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--headless", "--disable-gpu"],
  });

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);

  await page.setViewport({ width: 1024, height: 768 }); //, deviceScaleFactor: 2});

  await page.goto(url, { waitUntil: "networkidle0" });
  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight);
  });
  await waitFor(1000);
  let innerHeight = 0;
  innerHeight = await page.evaluate(() => {
    return Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
  }); //return window.innerHeight; } );
  let times = innerHeight / 768;
  console.log(
    "index=" +
      index +
      " url=" +
      url +
      " height=" +
      innerHeight +
      " times=" +
      times
  );
  let x = 0;
  for (x = 0; x < times; x++) {
    await page.evaluate((x) => {
      window.scrollBy(0, 768 * x);
    }, x);
    await waitFor(1000);
  }
  await page.evaluate((_) => {
    window.scrollTo(0, 0);
  });
  let title = await page.title();
  let filename = title.replace(/[^a-z0-9]/gim, "_").replace(/\s+/g, "_");
  while (index.length < 3) {
    index = "0" + index;
  }
  filename = index + "_" + filename + ".png";
  console.log("filename=" + filename + "\n");
  await page.screenshot({
    path: filename,
    fullPage: true,
  });
  browser.close();
})();
