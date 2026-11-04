import {build} from 'esbuild';
import {copyFile,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
await build({entryPoints:['src/auth.js'],bundle:true,minify:true,format:'iife',platform:'browser',target:['es2022'],outfile:'auth.js',legalComments:'inline'});
const lock=JSON.parse(await readFile('package-lock.json','utf8'));
const notices=[];
for(const [location,entry] of Object.entries(lock.packages||{})){
 if(!location||entry.dev)continue;
 let license='';
 for(const name of ['LICENSE','LICENSE.md','LICENSE.txt','LICENSE-MIT','LICENSE-MIT.txt']){
  try{license=(await readFile(path.join(location,name),'utf8')).replace(/\r\n?/g,'\n');break;}catch(e){if(e.code!=='ENOENT')throw e;}
 }
 notices.push(`${location.replace(/^node_modules\//,'')} ${entry.version}\nLicense: ${entry.license||'see package'}\n${license}\n`);
}
await writeFile('THIRD_PARTY_NOTICES.txt',notices.join('\n---\n\n'));
await Promise.all(['auth.js','auth-config.js','THIRD_PARTY_NOTICES.txt'].map(name=>copyFile(name,'public/'+name)));
