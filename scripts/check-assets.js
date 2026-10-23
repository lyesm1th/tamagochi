import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {transformSync} from 'esbuild';
export function checkAssets(publicDirectory=fileURLToPath(new URL('../public/',import.meta.url))){
 const html=readFileSync(path.join(publicDirectory,'index.html'),'utf8');
 const links=[...html.matchAll(/(?:href|src)=["'](\/[^"']+)["']/g)].map(m=>new URL(m[1],'https://app.invalid').pathname).filter(p=>/\.(?:css|js)$/.test(p));
 if(!links.some(p=>p.endsWith('.css')))throw Error('The app is missing its stylesheet link.');
 for(const asset of new Set(links)){
 const filename=path.join(publicDirectory,asset.slice(1)),source=readFileSync(filename,'utf8');
 const result=transformSync(source,{loader:asset.endsWith('.css')?'css':'js',sourcefile:asset,logLevel:'silent'});
 if(result.warnings.length)throw Error(asset+': '+result.warnings.map(w=>w.text).join('; '));
 }
 return links;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){checkAssets();console.log('Linked JavaScript and CSS assets are valid.');}
