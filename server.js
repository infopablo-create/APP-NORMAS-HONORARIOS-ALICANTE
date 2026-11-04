import http from 'node:http';
import { readFile, mkdir, chmod } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { DatabaseSync } from 'node:sqlite';
const scrypt=promisify(scryptCallback);
const root=path.resolve(fileURLToPath(new URL('./public/',import.meta.url)));
const SESSION_SECONDS=60*60*24*7;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.pdf':'application/pdf'};
const tokenHash=value=>createHash('sha256').update(value).digest('hex');
const bad=(status,message)=>Object.assign(new Error(message),{status});
export async function createApp({dbPath=process.env.APP_DB_PATH||path.resolve('data/accounts.sqlite'),secureCookies=process.env.NODE_ENV==='production',publicOrigin=process.env.PUBLIC_ORIGIN||null}={}){
 if(dbPath!==':memory:')await mkdir(path.dirname(dbPath),{recursive:true,mode:0o700});
 const db=new DatabaseSync(dbPath);
 if(dbPath!==':memory:')await chmod(dbPath,0o600);
 db.exec(`PRAGMA foreign_keys=ON;
 CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,salt TEXT NOT NULL,created_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,expires_at INTEGER NOT NULL);
 CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);`);
 const attempts=new Map();
 function throttle(key,limit){const now=Date.now();let row=attempts.get(key);if(!row||row.until<now){row={count:0,until:now+15*60*1000};attempts.set(key,row);}if(attempts.size>10000){for(const[k,v]of attempts){if(v.until<now)attempts.delete(k);}if(attempts.size>10000)throw bad(429,'Demasiados intentos. Prueba más tarde.');}if(++row.count>limit)throw bad(429,'Demasiados intentos. Prueba dentro de 15 minutos.');}
 function session(req){const match=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('honorarios_session='));if(!match)return null;const token=match.slice('honorarios_session='.length);if(!/^[a-f0-9]{64}$/.test(token))return null;return db.prepare('SELECT users.id,users.name,users.email FROM sessions JOIN users ON users.id=sessions.user_id WHERE token_hash=? AND expires_at>?').get(tokenHash(token),Date.now())||null;}
 function json(res,status,value){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));}
 async function body(req){if(!(req.headers['content-type']||'').toLowerCase().startsWith('application/json'))throw bad(415,'Se requiere JSON.');let total=0;const chunks=[];for await(const chunk of req){total+=chunk.length;if(total>8192)throw bad(413,'Solicitud demasiado grande.');chunks.push(chunk);}try{const value=JSON.parse(Buffer.concat(chunks).toString('utf8'));if(!value||typeof value!=='object'||Array.isArray(value))throw Error();return value;}catch{throw bad(400,'Solicitud no válida.');}}
 function clearSession(req,res){const cookie=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('honorarios_session='));if(cookie)db.prepare('DELETE FROM sessions WHERE token_hash=?').run(tokenHash(cookie.slice('honorarios_session='.length)));res.setHeader('Set-Cookie',`honorarios_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secureCookies?'; Secure':''}`);}
 function startSession(req,res,userId){clearSession(req,res);db.prepare('DELETE FROM sessions WHERE expires_at<=?').run(Date.now());const token=randomBytes(32).toString('hex');db.prepare('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)').run(tokenHash(token),userId,Date.now()+SESSION_SECONDS*1000);res.setHeader('Set-Cookie',`honorarios_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_SECONDS}${secureCookies?'; Secure':''}`);}
 const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','DENY');res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' https://*.supabase.co; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");
  try{
   const pathname=new URL(req.url,'http://localhost').pathname;
   if(pathname.startsWith('/api/')){
    if(req.method==='GET'&&pathname==='/api/session'){json(res,200,{user:session(req)});return;}
    if(req.method!=='POST'){json(res,405,{error:'Método no permitido.'});return;}
    const expected=publicOrigin||(secureCookies?'https://':'http://')+req.headers.host;
    if(req.headers.origin&&req.headers.origin!==expected)throw bad(403,'Origen de solicitud no permitido.');
    if(pathname==='/api/logout'){await body(req);clearSession(req,res);json(res,200,{ok:true});return;}
    if(!['/api/register','/api/login'].includes(pathname))throw bad(404,'Servicio no disponible.');
    throttle(`${req.socket.remoteAddress}:${pathname}`,pathname==='/api/register'?10:30);
    const input=await body(req),email=typeof input.email==='string'?input.email.trim().toLowerCase():'',password=input.password;
    if(email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||typeof password!=='string'||password.length>128)throw bad(400,'Revisa el correo y la contraseña.');
    if(pathname==='/api/register'){
     const name=typeof input.name==='string'?input.name.trim():'';
     if(name.length<2||name.length>100||password.length<12)throw bad(400,'Introduce tu nombre y una contraseña de al menos 12 caracteres.');
     if(db.prepare('SELECT id FROM users WHERE email=?').get(email))throw bad(409,'No se puede crear una cuenta con ese correo. Prueba a iniciar sesión.');
     const salt=randomBytes(16).toString('hex'),hash=(await scrypt(password,salt,64)).toString('hex');
     let result;try{result=db.prepare('INSERT INTO users(name,email,password_hash,salt,created_at) VALUES(?,?,?,?,?)').run(name,email,hash,salt,Date.now());}catch(e){if(e.code?.includes('CONSTRAINT'))throw bad(409,'No se puede crear una cuenta con ese correo.');throw e;}
     const id=Number(result.lastInsertRowid);startSession(req,res,id);json(res,201,{user:{id,name,email}});return;
    }
    const user=db.prepare('SELECT * FROM users WHERE email=?').get(email);
    const calculated=await scrypt(password,user?.salt||'00000000000000000000000000000000',64);
    const correct=user&&timingSafeEqual(calculated,Buffer.from(user.password_hash,'hex'));
    if(!correct)throw bad(401,'Correo o contraseña incorrectos.');
    startSession(req,res,user.id);json(res,200,{user:{id:user.id,name:user.name,email:user.email}});return;
   }
   if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
   const file=path.resolve(root,'.'+decodeURIComponent(pathname==='/'?'/index.html':pathname));
   if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
   const data=await readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(req.method==='HEAD'?undefined:data);
  }catch(e){if(req.url.startsWith('/api/')){json(res,e.status||500,{error:e.status?e.message:'No se pudo completar la operación.'});}else{res.writeHead(404);res.end('No encontrado');}}
 });
 server.on('close',()=>db.close());
 return server;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const server=await createApp();server.listen(Number(process.env.PORT||3000),process.env.HOST||'127.0.0.1',()=>console.log('Honorarios Alicante: servidor iniciado'));
}
