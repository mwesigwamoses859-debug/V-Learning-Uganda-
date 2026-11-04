import {useEffect,useRef,useState} from 'react';
import {Play,BookOpen} from 'lucide-react';
import {Entry,mediaUrl} from '../models';
import {captureVideoThumbnail} from '../lib/videoThumbnail';
export default function VideoThumbnail({item,eager=false}:{item:Entry;eager?:boolean}){
 const host=useRef<HTMLSpanElement>(null),[image,setImage]=useState('');
 useEffect(()=>{
  setImage('');if(item.coverAssetId||!item.videoAssetId)return;
  const reducedData=(navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData;if(reducedData)return;
  const controller=new AbortController();let preview='',started=false;
  const create=()=>{if(started)return;started=true;captureVideoThumbnail(mediaUrl(item.videoAssetId),controller.signal).then(blob=>{if(controller.signal.aborted)return;preview=URL.createObjectURL(blob);setImage(preview);}).catch(()=>{});};
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){create();observer.disconnect();}},{rootMargin:'100px'});
  if(eager)create();else if(host.current)observer.observe(host.current);
  return()=>{controller.abort();observer.disconnect();if(preview)URL.revokeObjectURL(preview);};
 },[item.videoAssetId,item.coverAssetId,eager]);
 const src=item.coverAssetId?mediaUrl(item.coverAssetId):image;
 return <span ref={host} className="video-thumbnail">{src?<img loading={eager?'eager':'lazy'} src={src} alt=""/>:<span className="video-thumbnail-fallback"><span className="thumbnail-brand">V-LEARNING UGANDA</span><BookOpen size={30}/><strong>{item.subject||'Video lesson'}</strong><small>{item.classLevel}{item.topic?' · '+item.topic:''}</small></span>}<span className="thumbnail-play" aria-hidden="true"><Play size={22} fill="currentColor"/></span><span className="thumbnail-class">{item.classLevel||'Video lesson'}</span></span>;
}
