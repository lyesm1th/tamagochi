import {buildSync} from 'esbuild';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync,readdirSync,unlinkSync} from 'node:fs';
const directory=new URL('../public/assets/',import.meta.url);mkdirSync(directory,{recursive:true});
const result=buildSync({entryPoints:[new URL('../public/app.js',import.meta.url).pathname],bundle:true,minify:true,format:'esm',charset:'utf8',target:'es2022',write:false,logLevel:'silent'});
if(result.warnings.length)throw Error(result.warnings.map(w=>w.text).join('; '));
const bytes=result.outputFiles[0].contents,hash=createHash('sha256').update(bytes).digest('hex').slice(0,16),filename=`game.${hash}.js`;
for(const file of readdirSync(directory))if(/^game\.[a-f0-9]+\.js$/.test(file)&&file!==filename)unlinkSync(new URL(file,directory));
writeFileSync(new URL(filename,directory),bytes);
const htmlURL=new URL('../public/index.html',import.meta.url),html=readFileSync(htmlURL,'utf8').replace(/<script type="module" src="\/(?:app\.js|assets\/game\.[a-f0-9]+\.js)(?:\?[^"<>]*)?"><\/script>/,`<script type="module" src="/assets/${filename}"></script>`);
if(!html.includes(`/assets/${filename}`))throw Error('Client entry not found in index.html');writeFileSync(htmlURL,html);
console.log(`Client: /assets/${filename}`);
// Keep the experimental renderer behind the same /lab* owner-only route.
buildSync({entryPoints:[new URL('./lab-25d-entry.js',import.meta.url).pathname],bundle:true,minify:true,format:'esm',target:'es2022',outfile:new URL('../public/lab-25d-bundle.js',import.meta.url).pathname,logLevel:'silent'});
console.log('Private 2.5D lab bundle built.');
