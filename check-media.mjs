import assert from 'node:assert/strict';
const base='http://127.0.0.1:4173';
const head=await fetch(`${base}/assets/zorko-gallery.mp4`,{method:'HEAD'});
assert.equal(head.status,200);assert.equal(head.headers.get('content-type'),'video/mp4');
const size=Number(head.headers.get('content-length'));assert.ok(size>0);
for(const [range,length,contentRange] of [['bytes=0-1023',1024,`bytes 0-1023/${size}`],['bytes=-128',128,`bytes ${size-128}-${size-1}/${size}`]]){
 const r=await fetch(`${base}/assets/zorko-gallery.mp4`,{headers:{Range:range}});
 assert.equal(r.status,206);assert.equal(r.headers.get('content-range'),contentRange);assert.equal((await r.arrayBuffer()).byteLength,length);
}
const invalid=await fetch(`${base}/assets/zorko-gallery.mp4`,{headers:{Range:`bytes=${size}-`}});assert.equal(invalid.status,416);
const image=await fetch(`${base}/assets/official/neel.webp`,{method:'HEAD'});assert.equal(image.headers.get('content-type'),'image/webp');
assert.equal((await fetch(`${base}/index.html`,{method:'HEAD'})).status,200);
console.log('Media serving checks passed: video MIME, HEAD, bounded/suffix byte ranges, invalid ranges and image MIME.');
