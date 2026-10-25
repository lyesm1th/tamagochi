// Stage 1 snapshot: compare tracked graphics with the last approved version.
// These checks deliberately protect visual identity; update the baseline only
// in a separately reviewed graphics change, never during code cleanups.
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {join,dirname} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
export function gitBlobHash(bytes){
 return createHash('sha1').update(Buffer.from('blob '+bytes.length+'\\0')).update(bytes).digest('hex');
}
export function checkVisualBaseline(){
 const expected=JSON.parse(readFileSync(join(root,'tests/baselines/visual-files.json'),'utf8'));
 const errors=[];
 for(const [path,sha] of Object.entries(expected)){
  const absolute=join(root,path);
  if(!existsSync(absolute)){errors.push(path+': missing');continue;}
  const actual=gitBlobHash(readFileSync(absolute));
  if(actual!==sha)errors.push(path+': changed (expected '+sha+', got '+actual+')');
 }
 if(errors.length)throw Error('Visual baseline mismatch:\\n'+errors.join('\\n')+'\\nDo not regenerate this baseline during nonvisual optimization.');
 return Object.keys(expected).length;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const count=checkVisualBaseline();console.log('Visual baseline verified: '+count+' files.');
}
