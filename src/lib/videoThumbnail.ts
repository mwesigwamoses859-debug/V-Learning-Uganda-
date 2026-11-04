// Capture an actual frame locally; no video is sent to a third-party service.
export function captureVideoThumbnail(source:File|string, signal?:AbortSignal):Promise<Blob>{
 return new Promise((resolve,reject)=>{
  const video=document.createElement('video');let settled=false,capturing=false;
  const temporary=typeof source==='string'?'':URL.createObjectURL(source);
  const clean=()=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);video.pause();video.removeAttribute('src');video.load();if(temporary)URL.revokeObjectURL(temporary);};
  const fail=(message:string)=>{if(settled)return;settled=true;clean();reject(new Error(message));};
  const abort=()=>fail('Thumbnail creation cancelled.');
  const timer=setTimeout(()=>fail('A thumbnail could not be generated. Upload a JPG or PNG image instead.'),20000);
  async function capture(){
   if(settled||capturing||video.readyState<2||!video.videoWidth)return;capturing=true;
   try{
    const canvas=document.createElement('canvas');canvas.width=960;canvas.height=540;
    const context=canvas.getContext('2d');if(!context)throw new Error('Canvas is unavailable.');
    const scale=Math.max(960/video.videoWidth,540/video.videoHeight),width=960/scale,height=540/scale;
    context.drawImage(video,(video.videoWidth-width)/2,(video.videoHeight-height)/2,width,height,0,0,960,540);
    const blob=await new Promise<Blob|null>(done=>canvas.toBlob(done,'image/jpeg',.84));
    if(!blob)throw new Error('This video frame could not be captured.');
    if(settled)return;settled=true;clean();resolve(blob);
   }catch{fail('This browser could not create a thumbnail. Upload a cover image instead.');}
  }
  video.muted=true;video.playsInline=true;video.preload='metadata';
  video.onloadedmetadata=()=>{const target=Number.isFinite(video.duration)&&video.duration>0?Math.min(2,video.duration*.12):0;try{if(target>.01)video.currentTime=target;else capture();}catch{capture();}};
  video.onseeked=()=>{capture();};
  video.onloadeddata=()=>{if(video.currentTime<.01)capture();};
  video.onerror=()=>fail('This video format could not be read. Upload a thumbnail image instead.');
  if(signal?.aborted){abort();return;}signal?.addEventListener('abort',abort,{once:true});
  video.src=temporary||source as string;video.load();
 });
}
