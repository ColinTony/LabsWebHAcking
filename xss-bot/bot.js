const fetch = (...args)=>import('node-fetch').then(({default:fetch})=>fetch(...args));
const puppeteer = require('puppeteer-core');

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'xss-admin-token';
const ORIGIN = process.env.ORIGIN || 'http://web-xss:3000';

(async function loop(){
  while(true){
    try{
      const r = await fetch(ORIGIN+'/admin/next', { headers: {'x-admin-token': ADMIN_TOKEN} });
      const job = await r.json();
      if(job && job.url){
        const url = new URL(job.url, ORIGIN);
        url.searchParams.set('sid', job.id);
        const browser = await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
        const page = await browser.newPage();
        await page.setCookie({name:'is_admin', value:'1', domain:'web-xss', path:'/'});
        await page.goto(url.toString(), { waitUntil:'networkidle2', timeout:15000 });
        await page.waitForTimeout(5000);
        await browser.close();
        console.log('Visited:', url.toString());
      } else {
        await new Promise(r=>setTimeout(r, 2000));
      }
    }catch(e){
      console.error('bot error', e.message);
      await new Promise(r=>setTimeout(r, 3000));
    }
  }
})();
