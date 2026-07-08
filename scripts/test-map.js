const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('response', response => {
    if (!response.ok()) {
      console.log('PAGE NETWORK ERROR:', response.status(), response.url());
    }
  });

  await page.goto('http://localhost:3000/ops/tracker', { waitUntil: 'networkidle2' });
  
  // Wait a bit for Mappls to initialize
  await new Promise(r => setTimeout(r, 2000));
  
  const mapData = await page.evaluate(() => {
    const el = document.getElementById('mappls-map-container');
    if (!el) return 'No container found';
    return {
      innerHTML: el.innerHTML.substring(0, 500),
      childrenCount: el.children.length,
      clientWidth: el.clientWidth,
      clientHeight: el.clientHeight,
      cssText: el.style.cssText
    };
  });
  
  console.log('MAP CONTAINER DOM:', mapData);
  
  await browser.close();
})();
