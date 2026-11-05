import {createServer} from 'vite';
import {build} from 'esbuild';
import {Miniflare} from 'miniflare';
import {randomBytes} from 'node:crypto';

// Local-only D1/R2. This process never opens the production databases or bucket.
const script=(await build({entryPoints:[new URL('../server/worker.mjs',import.meta.url).pathname],bundle:true,write:false,format:'esm',platform:'browser'})).outputFiles[0].text;
const args=process.argv.slice(2),fixture=args.includes('--fixture');
const password=process.env.VL_PREVIEW_ADMIN_PASSWORD||(fixture?'local-preview-fixture-only-2026':randomBytes(24).toString('hex'));
const worker=new Miniflare({modules:true,script,compatibilityDate:'2026-07-30',d1Databases:['DB'],r2Buckets:['MEDIA'],bindings:{ADMIN_PASSWORD:password,...Object.fromEntries(['PAYMENT_MERCHANT_CODE','PAYMENT_MERCHANT_NAME','PAYMENT_QR_READY'].filter(key=>process.env[key]).map(key=>[key,process.env[key]]))}});
if(fixture)await (await import('./preview-fixture.mjs')).seedPreview(worker,password);
const portArg=args.indexOf('--port');
const server=await createServer({server:{host:'0.0.0.0',port:Number(portArg>=0?args[portArg+1]:process.env.PORT)||3000,strictPort:args.includes('--strictPort')},plugins:[{name:'isolated-local-api',configureServer(vite){vite.middlewares.use(async(req,res,next)=>{
 if(fixture&&req.url?.startsWith('/__preview')){
  const role=req.url.split('?')[0].split('/')[2];
  if(role==='mobile'){
   const requested=new URL(req.url,'http://preview.test').searchParams.get('page')||'/school',path=['/school','/notifications','/','/admin?section=reports'].includes(requested)?requested:'/school';
   res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html><title>Isolated mobile preview</title><body style="background:#eee;display:grid;place-items:center;margin:20px"><iframe title="Mobile preview" style="width:390px;height:844px;border:1px solid #ccc;border-radius:18px;background:white" src="'+path+'"></iframe></body>');return;
  }
  if(!['student','school','admin','guest'].includes(role)){
   res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html><title>Isolated preview roles</title><main style="font:18px system-ui;max-width:600px;margin:60px auto;line-height:2"><h1>Isolated preview roles</h1><p>Disposable local data only. No real payments, students or email delivery.</p>'+['guest','student','school','admin'].map(role=>'<p><a href="/__preview/'+role+'">View as '+role+'</a></p>').join('')+'</main>');return;
  }
  const origin='https://preview.test';let cookies=['vl_learner=; Path=/api; HttpOnly; SameSite=Strict; Max-Age=0','vl_admin=; Path=/api; HttpOnly; SameSite=Strict; Max-Age=0'];
  if(role!=='guest'){
   const response=await worker.dispatchFetch(origin+'/api/'+(role==='admin'?'login':'learner/login'),{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(role==='admin'?{password}:{username:role==='school'?'preview.school':'preview.learner',password})});
   if(!response.ok){res.statusCode=500;res.end('Isolated preview role unavailable.');return;}
   const cookie=response.headers.get('set-cookie').replace(/; Secure/g,'');cookies=cookies.filter(c=>!c.startsWith(role==='admin'?'vl_admin=':'vl_learner='));cookies.push(cookie);
  }
  res.statusCode=302;res.setHeader('Set-Cookie',cookies);res.setHeader('Location',role==='admin'?'/admin?section=reports':role==='school'?'/school':role==='student'?'/notifications':'/');res.end();return;
 }
 if(!req.url?.startsWith('/api/'))return next();
 try{
  const chunks=[];for await(const chunk of req)chunks.push(chunk);
  const body=Buffer.concat(chunks),protocol=req.headers['x-forwarded-proto']||'http',origin=protocol+'://'+req.headers.host;
  const response=await worker.dispatchFetch(origin+req.url,{method:req.method,headers:req.headers,...(body.length?{body}: {})});
  res.statusCode=response.status;for(const [key,value]of response.headers)res.setHeader(key,key==='set-cookie'&&protocol==='http'?value.replace(/; Secure/g,''):value);res.end(Buffer.from(await response.arrayBuffer()));
 }catch(error){res.statusCode=500;res.end(JSON.stringify({error:'Local preview API failed.'}));}
 });}}]});
await server.listen();server.printUrls();
console.log('Isolated local preview administrator password: '+password);
async function stop(){await server.close();await worker.dispose();process.exit(0);}
process.on('SIGTERM',stop);process.on('SIGINT',stop);
