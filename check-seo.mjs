import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import {originFromEnv,finishSearch} from './search.mjs';
const root=path.resolve('dist'),status=JSON.parse(fs.readFileSync(path.join(root,'search-status.json'),'utf8'));
const files=fs.readdirSync(root).filter(f=>f.endsWith('.html'));
const titles=new Set(),descriptions=new Set();let fragments=0;
for(const file of files){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 assert.equal((html.match(/<h1\b/g)||[]).length,1,`${file}: exactly one H1`);
 const title=html.match(/<title>(.*?)<\/title>/)?.[1],desc=html.match(/<meta name="description" content="([^"]*)">/)?.[1];
 assert(title&&desc,`${file}: descriptive title and description`);assert(!titles.has(title),`${file}: duplicate title`);assert(!descriptions.has(desc),`${file}: duplicate description`);titles.add(title);descriptions.add(desc);
 assert(!html.includes('name="keywords"'),`${file}: no keyword stuffing tag`);
 const blocks=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];assert.equal(blocks.length,1,`${file}: schema graph`);
 const graph=JSON.parse(blocks[0][1])['@graph'];assert(graph.some(n=>n['@type']==='Organization'&&n.name==='Zorko Group'),`${file}: organization identity`);
 assert(!graph.some(n=>['JobPosting','AggregateRating','Review'].includes(n['@type'])),`${file}: no unsupported job or review markup`);
 assert(html.includes('wordmark-limited">GROUP'),`${file}: Group wordmark`);
 const canonical=html.match(/rel="canonical" href="([^"]+)"/)?.[1];
 if(status.indexing){assert(canonical?.startsWith(status.origin+'/'),`${file}: canonical origin`);assert(!html.includes('content="noindex'),`${file}: indexable production`);if(file!=='index.html')assert(graph.some(n=>n['@type']==='BreadcrumbList'),`${file}: breadcrumb data`)}
 else{assert(!canonical,`${file}: no guessed production canonical`);assert(html.includes('content="noindex, nofollow"'),`${file}: preview excluded`)}
 for(const [,href]of html.matchAll(/href="([^"]*#[^"]+)"/g)){
  if(/^(?:https?:|mailto:|tel:)/.test(href))continue;
  const [p,id]=href.split('#');if(!id)continue;const dest=path.join(root,p||file);assert(fs.existsSync(dest),`${file}: missing fragment document ${href}`);
  const target=fs.readFileSync(dest,'utf8');assert(target.includes(`id="${id}"`),`${file}: missing anchor ${href}`);fragments++;
 }
}
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');assert.equal((sitemap.match(/<loc>/g)||[]).length,status.indexing?files.length:0,'Sitemap covers production pages only');
const robots=fs.readFileSync(path.join(root,'robots.txt'),'utf8');assert(robots.includes(status.indexing?'Allow: /':'Disallow: /'));
// Check production rendering without making the actual preview indexable.
const mock='<html lang="en"><head><title>Old</title><meta name="description" content="Old"><meta property="og:title" content="Old"><meta property="og:description" content="Old"><meta property="og:type" content="website"></head><body></body></html>';
const sample=finishSearch(mock,'franchise',{title:'Food Franchise | Zorko Group',description:'Compare formats & support.'},'https://example.com');
assert(sample.includes('rel="canonical" href="https://example.com/franchise.html"'));assert(sample.includes('BreadcrumbList'));assert(sample.includes('index, follow, max-image-preview:large'));assert(sample.includes('formats &amp; support.'));
const old=process.env.SITE_URL;for(const value of ['http://example.com','https://example.com/path','https://user:password@example.com']){process.env.SITE_URL=value;assert.throws(originFromEnv)}if(old===undefined)delete process.env.SITE_URL;else process.env.SITE_URL=old;
console.log(`SEO verified: ${files.length} unique page titles/descriptions, H1s, JSON-LD, ${fragments} anchors, Group identity, preview controls and production canonical/breadcrumb rendering.`);
