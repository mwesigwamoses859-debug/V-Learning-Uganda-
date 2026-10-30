// Local development only. Production uses Cloudflare's D1, R2 and secret bindings.
import {readFile} from 'node:fs/promises';
import {createServer} from 'vite';
import {Miniflare} from 'miniflare';

const portFlag=process.argv.indexOf('--port');
const port=Number(process.env.PORT || (portFlag>=0?process.argv[portFlag+1]:5173));
const mf=new Miniflare({
  modules:true,script:await readFile(new URL('../server/worker.mjs',import.meta.url),'utf8'),
  compatibilityDate:'2026-07-30',d1Databases:['DB'],r2Buckets:['MEDIA'],
  bindings:{ADMIN_PASSWORD:process.env.LOCAL_ADMIN_PASSWORD || 'local-preview-only-do-not-use-in-production'},
});
const server=await createServer({
  server:{host:'0.0.0.0',port,strictPort:true,allowedHosts:true},
  plugins:[{name:'isolated-cloudflare-api',configureServer(vite){
    vite.middlewares.use(async(req,res,next)=>{
      if(!req.url?.startsWith('/api/'))return next();
      try{
        const headers=new Headers();
        for(const [name,value] of Object.entries(req.headers))if(value!==undefined)headers.set(name,Array.isArray(value)?value.join(', '):value);
        const origin=headers.get('Origin') || `${headers.get('x-forwarded-proto') || 'http'}://${headers.get('host')}`;
        const chunks=[];for await(const chunk of req)chunks.push(Buffer.from(chunk));
        const body=Buffer.concat(chunks);
        const response=await mf.dispatchFetch(origin+req.url,{method:req.method,headers,...(body.length?{body}:{} )});
        res.statusCode=response.status;
        // The local preview is HTTP; production keeps its Secure HTTPS cookie.
        response.headers.forEach((value,name)=>res.setHeader(name,name==='set-cookie'&&origin.startsWith('http://')?value.replace(/; Secure\b/g,''):value));
        res.end(Buffer.from(await response.arrayBuffer()));
      }catch(error){
        console.error('Local API error:',error);
        res.statusCode=503;res.setHeader('Content-Type','application/json');
        res.end(JSON.stringify({error:'The local development API is unavailable.'}));
      }
    });
  }}],
});
await server.listen();
server.printUrls();
async function close(){await server.close();await mf.dispose();process.exit(0);}
process.once('SIGINT',close);process.once('SIGTERM',close);
