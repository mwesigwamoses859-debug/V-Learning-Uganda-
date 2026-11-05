import {createServer} from 'vite';
import {build} from 'esbuild';
import {Miniflare} from 'miniflare';
import {randomBytes} from 'node:crypto';

// Local-only D1/R2. This process never opens the production databases or bucket.
const script=(await build({entryPoints:[new URL('../server/worker.mjs',import.meta.url).pathname],bundle:true,write:false,format:'esm',platform:'browser'})).outputFiles[0].text;
const password=process.env.VL_PREVIEW_ADMIN_PASSWORD||randomBytes(24).toString('hex');
const worker=new Miniflare({modules:true,script,compatibilityDate:'2026-07-30',d1Databases:['DB'],r2Buckets:['MEDIA'],bindings:{ADMIN_PASSWORD:password,...Object.fromEntries(['PAYMENT_MERCHANT_CODE','PAYMENT_MERCHANT_NAME','PAYMENT_QR_READY'].filter(key=>process.env[key]).map(key=>[key,process.env[key]]))}});
const args=process.argv.slice(2),portArg=args.indexOf('--port');
const server=await createServer({server:{host:'0.0.0.0',port:Number(portArg>=0?args[portArg+1]:process.env.PORT)||3000,strictPort:args.includes('--strictPort')},plugins:[{name:'isolated-local-api',configureServer(vite){vite.middlewares.use(async(req,res,next)=>{
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
