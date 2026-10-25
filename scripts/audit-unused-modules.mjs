// Conservative dependency census for the browser code.
// Counts both static and literal dynamic imports, and keeps test / QA references.
// A reported candidate is NEVER automatically deleted.
import {readdirSync,readFileSync,statSync} from 'node:fs';
import {join,relative,resolve,dirname,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
function files(dir){
 const result=[];
 for(const ent of readdirSync(dir,{withFileTypes:true})){
  if(['node_modules','.git','assets'].includes(ent.name)&&dir.endsWith('/public'))continue;
  const path=join(dir,ent.name);
  if(ent.isDirectory()){if(!['node_modules','.git','.wrangler'].includes(ent.name))result.push(...files(path));}
  else if(ent.isFile()&&/\\.(js|mjs|html)$/.test(ent.name))result.push(path);
 }
 return result;
}
const fileset=[...files(join(root,'public')),...files(join(root,'scripts')),...files(join(root,'tests')),...files(join(root,'docs'))].filter(path=>!path.includes('/node_modules/'));
const all=new Set(fileset),imports=new Map(),refs=new Map();
for(const path of fileset){
 const contents=readFileSync(path,'utf8'),dependencies=new Set();
 // Explicit module specifiers, including import() and import...from.
 const pattern=/(?:\\bimport\\s*(?:\\(|[^;\\n]*?\\bfrom\\s*)|\\bexport\\s+[^;\\n]*?\\bfrom\\s*)['"]([^'"]+)['"]/g;
 for(const match of contents.matchAll(pattern)){
  const spec=match[1];if(!spec.startsWith('.')&&!spec.startsWith('/'))continue;
  const target=resolve(spec.startsWith('/')?join(root,'public'):dirname(path),spec.startsWith('/')?spec.slice(1):spec);
  dependencies.add(target);
 }
 // Additional literal URL references in browser page scripts (src=...).
 if(extname(path)==='.html')for(const m of contents.matchAll(/\\bsrc=['"]([^'"]+\\.js)['"]/g)){
  const spec=m[1],target=resolve(spec.startsWith('/')?join(root,'public'):dirname(path),spec.startsWith('/')?spec.slice(1):spec);
  dependencies.add(target);
 }
 imports.set(path,dependencies);
 for(const dep of dependencies){if(!refs.has(dep))refs.set(dep,[]);refs.get(dep).push(path);}
}
function crawl(entries){const visited=new Set(),stack=[...entries];while(stack.length){const key=stack.pop();if(visited.has(key)||!all.has(key))continue;visited.add(key);for(const dep of imports.get(key)||[])stack.push(dep);}return visited;}
const publicFiles=fileset.filter(x=>x.startsWith(join(root,'public')+'/')&&/\\.js$/.test(x)&&!x.includes('/assets/'));
const entryPoints=[join(root,'public/app.js'),join(root,'public/lab.js'),join(root,'public/game.js'),join(root,'public/detailed-renderer.js'),join(root,'public/pixel-art.js')];
const runtime=crawl(entryPoints),qa=crawl(fileset.filter(x=>x.startsWith(join(root,'tests')+'/')||x.startsWith(join(root,'scripts')+'/')||x.startsWith(join(root,'docs')+'/')));
const candidates=publicFiles.filter(x=>!runtime.has(x)).map(x=>({
 path:relative(root,x),qaReferenced:qa.has(x),referencedBy:(refs.get(x)||[]).map(y=>relative(root,y)).slice(0,16)
})).sort((a,b)=>a.path.localeCompare(b.path));
const out={entryPoints:entryPoints.map(p=>relative(root,p)),analyzedFiles:fileset.length,runtimeReachable:runtime.size,toolingReachable:qa.size,candidates};
console.log(JSON.stringify(out,null,2));
