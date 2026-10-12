'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync('ui/index.html','utf8'),css=fs.readFileSync('ui/style.css','utf8');
assert(!/https?:\/\//.test(css),'Styles must not depend on online fonts or assets');
for(const file of ['main.cjs','preload.cjs','ui/app.js','ui/assets/id51-reference.jpg'])assert(fs.existsSync(file),file);
for(const action of ['menu','mode','main','vfo','memory','quick','up','dr','left','right','enter','ptt','monitor','power','volume'])assert(html.includes('data-action="'+action+'"'),action);
assert(html.includes("connect-src 'none'"));assert(!html.includes('<iframe'));const config=JSON.parse(fs.readFileSync('package.json'));assert(config.build.files.includes('ui/**/*'));assert(fs.existsSync('.github/workflows/build.yml'));console.log('PASS: offline assets, photo and all panel hotspots, packaging inputs');
