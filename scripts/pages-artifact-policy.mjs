import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { losslessWebpDimensions } from './lossless-webp.mjs';

const readmeName = /^read[._\-\s]*me(?:$|[._\-\s])/i;
const forbiddenName = /\.(?:save|lbak|bak|nso|zip|7z|key|pem|p12)$/i;
const binaryExtensions = new Set(['.webp']);
const forbiddenRasterExtensions = new Set(['.png','.jpg','.jpeg','.gif','.bmp','.avif','.tif','.tiff']);
const structuredExtensions = new Set(['.js', '.mjs', '.cjs', '.css', '.html', '.htm', '.json', '.svg', '.xml']);

// Distribution-only provenance removal. Keep original research inputs intact.
export function privateReferenceKey(key){
  const k=key.replace(/[_-]/g,'').toLowerCase();
  return /^(?:(?:source|manifest|text|private)?driveid|fileid|fileuri|privatefileid|privatepath|libraryfileid)$/.test(k);
}
export function publicJsonText(raw){
  let removed=0;
  const parsed=JSON.parse(raw);
  const clean=JSON.stringify(parsed,(k,v)=>{if(privateReferenceKey(k)){removed++;return undefined;}return v;});
  return removed?clean:raw;
}
function assertNoPrivateReferences(body,p,ext){
  const privateValue=/(?:https?:\/\/drive\.google\.com\/(?:file\/d\/|drive\/folders\/|open\?id=)|sediment:\/\/|\blibfile_[a-z0-9]+|\/mnt\/data\/|-----BEGIN (?:RSA |EC )?PRIVATE KEY-----)/i;
  const assertValue=value=>{if(privateValue.test(value))throw new Error(`private reference value prohibited: ${p}`);};
  if(ext==='.json'){
    JSON.parse(body,(k,v)=>{
      if(privateReferenceKey(k))throw new Error(`private reference key prohibited: ${p}:${k}`);
      assertValue(k);
      if(typeof v==='string')assertValue(v);
      return v;
    });
    // Parsed JSON drops shadowed duplicate members. Scan each validated string token too.
    for(const token of body.matchAll(/"(?:[^"\\]|\\[\s\S])*"/g)){
      const value=JSON.parse(token[0]);
      let end=token.index+token[0].length;
      while(/\s/.test(body[end]??''))end++;
      if(body[end]===':'&&privateReferenceKey(value))throw new Error(`private reference key prohibited: ${p}:${value}`);
      assertValue(value);
    }
  }
  assertValue(body);
}

function record(spans, start, end) { spans.push({start,end}); }

export function javaScriptComments(src) {
  const spans=[];
  let i=0, mode='code', quote='', regexClass=false, canRegex=true, codeBraces=[], prevIdentifier='';
  const templateNesting=[];
  const letter=c=>c!==undefined&&/[A-Za-z_$]/.test(c);
  const number=c=>c!==undefined&&/[0-9]/.test(c);
  const white=c=>c!==undefined&&/\s/.test(c);
  const keywordRegex = /^(?:return|throw|case|delete|void|typeof|new|instanceof|in|of|yield|await|else|do|extends)$/;
  while(i<src.length){
    const c=src[i],n=src[i+1];
    if(mode==='string'){
      if(c==='\\'){i+=Math.min(2,src.length-i);continue;}
      if(c===quote){mode='code';canRegex=false;}
      i++;continue;
    }
    if(mode==='template'){
      if(c==='\\'){i+=Math.min(2,src.length-i);continue;}
      if(c==='`'){mode='code';canRegex=false;i++;continue;}
      if(c==='$'&&n==='{'){templateNesting.push(codeBraces.length);codeBraces.push('template');mode='code';canRegex=true;i+=2;continue;}
      i++;continue;
    }
    if(mode==='regex'){
      if(c==='\\'){i+=Math.min(2,src.length-i);continue;}
      if(c==='['){regexClass=true;i++;continue;}
      if(c===']'){regexClass=false;i++;continue;}
      if(c==='/'&&!regexClass){mode='code';canRegex=false;i++;while(letter(src[i]))i++;continue;}
      if(c==='\n'||c==='\r')throw new Error(`unterminated JavaScript regex at ${i}`);
      i++;continue;
    }
    if(white(c)){i++;continue;}
    if(c==='/'&&n==='/'){
      const begin=i;i+=2;while(i<src.length&&src[i]!=='\n'&&src[i]!=='\r')i++;
      record(spans,begin,i);continue;
    }
    if(c==='/'&&n==='*'){
      const begin=i;i+=2;while(i<src.length&&!(src[i]==='*'&&src[i+1]==='/'))i++;
      if(i>=src.length)throw new Error(`unterminated JavaScript block comment at ${begin}`);
      i+=2;record(spans,begin,i);continue;
    }
    if(c==='\''||c==='"'){mode='string';quote=c;i++;continue;}
    if(c==='`'){mode='template';i++;continue;}
    if(c==='/'&&canRegex){mode='regex';regexClass=false;i++;continue;}
    if(letter(c)){
      const begin=i;i++;while(letter(src[i])||number(src[i]))i++;
      prevIdentifier=src.slice(begin,i);
      canRegex=keywordRegex.test(prevIdentifier);continue;
    }
    if(number(c)){
      i++;while(letter(src[i])||number(src[i])||src[i]==='.'||src[i]==='_')i++;
      canRegex=false;continue;
    }
    if(c==='{'){codeBraces.push('block');canRegex=true;i++;continue;}
    if(c==='}'){
      const popped=codeBraces.pop();i++;
      if(popped==='template'){
        templateNesting.pop();mode='template';
      } else canRegex=false;
      continue;
    }
    if(c==='/'&&n==='='){canRegex=true;i+=2;continue;}
    if(c==='+'&&n==='+'||c==='-'&&n==='-'){canRegex=false;i+=2;continue;}
    if(c==='='&&n==='>'){canRegex=true;i+=2;continue;}
    if(c===')'||c===']'){canRegex=false;i++;continue;}
    canRegex=!/[.]/.test(c);
    i++;
  }
  if(mode!=='code'||templateNesting.length)throw new Error(`unterminated JavaScript literal ${mode}`);
  return spans;
}

export function cssComments(src){
  const spans=[];let i=0,quote='';
  while(i<src.length){const c=src[i],n=src[i+1];
    if(quote){if(c==='\\'){i+=Math.min(2,src.length-i);continue;}if(c===quote)quote='';i++;continue;}
    if(c==='"'||c==='\''){quote=c;i++;continue;}
    if(c==='/'&&n==='*'){const begin=i;i+=2;while(i<src.length&&!(src[i]==='*'&&src[i+1]==='/'))i++;if(i>=src.length)throw new Error(`unterminated CSS comment at ${begin}`);i+=2;record(spans,begin,i);continue;}
    i++;
  }
  return spans;
}

export function htmlComments(src){
  const spans=[];let i=0,quote='';
  while(i<src.length){
    const c=src[i];
    if(quote){if(c===quote)quote='';i++;continue;}
    if(c==='"'||c==='\''){quote=c;i++;continue;}
    if(src.slice(i,i+4)==='<!--'){const begin=i,iEnd=src.indexOf('-->',i+4);if(iEnd===-1)throw new Error(`unterminated HTML comment at ${begin}`);i=iEnd+3;record(spans,begin,i);continue;}
    i++;
  }
  return spans;
}

function allFiles(folder){
  const files=[];
  for(const entry of readdirSync(folder,{withFileTypes:true})){
    const p=join(folder,entry.name);
    if(entry.isSymbolicLink())throw new Error(`symlink prohibited: ${p}`);
    if(entry.isDirectory())files.push(...allFiles(p));
    else if(entry.isFile())files.push(p);
  }
  return files;
}

export function inspectFile(p){
  const name=p.split(/[\\/]/).at(-1);
  if(readmeName.test(name))throw new Error(`README prohibited: ${p}`);
  if(forbiddenName.test(name))throw new Error(`private/archive file prohibited: ${p}`);
  if(name==='.nojekyll'){if(statSync(p).size!==0)throw new Error(`.nojekyll must be empty: ${p}`);return;}
  const ext=extname(name).toLowerCase();
  if(forbiddenRasterExtensions.has(ext))throw new Error(`game images must use lossless WebP: ${p}`);
  if(binaryExtensions.has(ext)){
    losslessWebpDimensions(readFileSync(p));
    return;
  }
  if(!structuredExtensions.has(ext))throw new Error(`unexpected Pages asset type: ${p}`);
  const body=readFileSync(p,'utf8');
  if(body.charCodeAt(0)===0xFEFF)throw new Error(`leading BOM prohibited: ${p}`);
  let spans=[];
  if(['.js','.mjs','.cjs'].includes(ext))spans=javaScriptComments(body);
  if(ext==='.css')spans=cssComments(body);
  if(['.html','.htm','.xml','.svg'].includes(ext)){
    spans=htmlComments(body);
    for(const tag of ['script','style']){
      const pattern=new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)<\\/${tag}\\s*>`,'gi');
      for(const match of body.matchAll(pattern)){
        const content=match[2];
        if(!content.trim())continue;
        if(tag==='script'&&javaScriptComments(content).length)throw new Error(`inline JS comments prohibited: ${p}`);
        if(tag==='style'&&cssComments(content).length)throw new Error(`inline CSS comments prohibited: ${p}`);
      }
    }
  }
  if(ext==='.json')JSON.parse(body);
  if(spans.length){
    const first=spans[0],line=body.slice(0,first.start).split('\n').length;
    throw new Error(`comments prohibited: ${p}:${line} (${spans.length} comment tokens)`);
  }
}

export function verifySource(root){
  for(const name of ['index.html','.nojekyll'])inspectFile(join(root,name));
  for(const folder of ['src','data','assets']){
    const path=join(root,folder);
    if(existsSync(path))for(const f of allFiles(path))inspectFile(f);
  }
  const readme=[];
  for(const f of allFiles(root)){
    const name=f.split(/[\\/]/).at(-1);
    if(readmeName.test(name))readme.push(relative(root,f));
  }
  if(readme.length)throw new Error(`README files prohibited in repository: ${readme.join(', ')}`);
  return true;
}

export function verifyDist(dist){
  if(!existsSync(dist))throw new Error(`Missing Pages directory: ${dist}`);
  const files=allFiles(dist);
  if(!files.some(x=>x.endsWith(`${sep}index.html`)))throw new Error('Pages index.html missing');
  for(const file of files){inspectFile(file);const ext=extname(file).toLowerCase();if(structuredExtensions.has(ext))assertNoPrivateReferences(readFileSync(file,'utf8'),file,ext);}
  return files.length;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const root=fileURLToPath(new URL('../',import.meta.url));
  verifySource(root);
  const dist=join(root,'dist');
  if(existsSync(dist)){const count=verifyDist(dist);console.log(`PASS: README absent; source and ${count} Pages artifacts contain no comments`);}
  else console.log('PASS: README absent; Pages source contains no comments; dist not present');
}
