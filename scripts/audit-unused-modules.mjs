// Conservative module reachability audit. A candidate is not proof of dead code.
// HTML entry points, QA utilities and literal dynamic imports are all considered.
import {readdirSync,readFileSync} from 'node:fs';
import {join,relative,resolve,dirname,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));

function listFiles(dir){
 const result=[];
 for(const entry of readdirSync(dir,{withFileTypes:true})){
  if(['node_modules','.git','.wrangler','assets'].includes(entry.name))continue;
  const path=join(dir,entry.name);
  if(entry.isDirectory())result.push(...listFiles(path));
  else if(entry.isFile()&&/\.(js|mjs|html)$/.test(entry.name))result.push(path);
 }
 return result;
}

// Rewrites a literal source specifier into the corresponding repository path.
export function resolveReference(file,spec){
 if(!spec||spec.startsWith('http:')||spec.startsWith('https:')||spec.startsWith('//'))return null;
 const stripped=spec.split(/[?#]/,1)[0];
 if(!stripped.startsWith('.')&&!stripped.startsWith('/'))return null;
 const target=stripped.startsWith('/')
  ?resolve(root,'public',stripped.slice(1))
  :resolve(dirname(file),stripped);
 return target;
}

export function referencesFromSource(path,source){
 const specs=new Set();
 // Both bare and 'from' imports, exports, and literal import() expressions.
 for(const m of source.matchAll(/\b(?:import|export)\s+(?:[^;'"]*?\bfrom\s*)?['"]([^'"]+)['"]/g))specs.add(m[1]);
 for(const m of source.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g))specs.add(m[1]);
 if(extname(path)==='.html'){
  for(const m of source.matchAll(/<script\b[^>]*\bsrc\s*=\s*['"]([^'"]+)['"]/gi))specs.add(m[1]);
 }
 return [...specs].map(spec=>resolveReference(path,spec)).filter(Boolean);
}

const files=[...listFiles(join(root,'public')),...listFiles(join(root,'scripts')),...listFiles(join(root,'tests')),...listFiles(join(root,'docs'))];
const indexed=new Set(files),deps=new Map(),reverse=new Map();
for(const file of files){
 const dependencies=referencesFromSource(file,readFileSync(file,'utf8'));
 deps.set(file,dependencies);
 for(const dep of dependencies){
  if(!reverse.has(dep))reverse.set(dep,new Set());
  reverse.get(dep).add(file);
 }
}
function traverse(roots){
 const visited=new Set(),stack=roots.slice();
 while(stack.length){
  const file=stack.pop();
  if(visited.has(file)||!indexed.has(file))continue;
  visited.add(file);
  for(const dep of deps.get(file)||[])stack.push(dep);
 }
 return visited;
}
// Include both actual HTML pages as well as module-level entrypoints, because
// owner-lab-entry.js is loaded by index.html, not imported by app.js.
const entries=[
 'public/index.html','public/lab.html',
 'public/app.js','public/lab.js',
 'public/game.js','public/detailed-renderer.js','public/pixel-art.js'
].map(path=>join(root,path));
const runtime=traverse(entries);
const tooling=traverse(files.filter(file=>['tests','scripts','docs'].some(x=>file.startsWith(join(root,x)+'/'))));
const candidates=files
 .filter(file=>file.startsWith(join(root,'public')+'/')&&extname(file)==='.js'&&!runtime.has(file))
 .map(file=>({
   path:relative(root,file),
   qaReferenced:tooling.has(file),
   referencedBy:[...(reverse.get(file)||[])].map(p=>relative(root,p)).sort(),
   classification:tooling.has(file)?'tooling-only':'investigate'
 })).sort((a,b)=>a.path.localeCompare(b.path));
const result={
 entryPoints:entries.map(x=>relative(root,x)),
 analyzedFiles:files.length,
 runtimeReachable:runtime.size,
 toolingReachable:tooling.size,
 candidates
};
console.log(JSON.stringify(result,null,2));
