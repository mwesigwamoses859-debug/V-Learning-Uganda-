export type Level = 'primary' | 'secondary' | 'all';
export type Kind = 'lesson' | 'pdf' | 'event' | 'quiz';
export interface Question { question: string; options: string[]; answer?: number; explanation?: string }
export interface Entry {
  id?: string; kind: Kind; status: 'draft' | 'published'; title: string; description: string;
  level: Level; classLevel: string; subject: string; topic: string; teacherName: string;
  videoAssetId: string; pdfAssetId: string; coverAssetId: string; galleryAssetIds: string[];
  eventType: string; date: string; time: string; venue: string; questions: Question[];
  access?: 'free'; priceUGX?: number; createdAt?: string; updatedAt?: string;
  lowDataVideoAssetId?:string; mediaInfo?:Record<string,{id:string;name:string;mime:string;size:number}>;
  examType?:''|'PLE'|'UCE'|'UACE'; examYear?:number|string; revisionType?:''|'paper'|'answers'|'revision';
  registrationOpen?:boolean; registrationCapacity?:number; registrationDeadline?:string; registeredParticipants?:number;
}
export interface Announcement {id:string;status:'draft'|'published';title:string;body:string;level:Level;classLevel:string;pinned:boolean;expiresOn:string;createdAt?:string;updatedAt?:string}
export const fileSize=(size?:number)=>size===undefined?'':size<1024?`${size} B`:size<1024*1024?`${(size/1024).toFixed(1)} KB`:`${(size/1024/1024).toFixed(1)} MB`;
export const CONTACT = { name: 'Tr Ojok Mtn', phone: '+256 778 441681', tel: '+256778441681', whatsapp: 'https://wa.me/256778441681' };
export const classes = (level: Level) => Array.from({length: level === 'primary' ? 7 : 6}, (_,i) => `${level === 'primary' ? 'P' : 'S'}${i+1}`);
export const mediaUrl = (id: string, download = false) => `/api/media/${id}${download ? '?download=1' : ''}`;
export const kindLabel: Record<Kind, string> = { lesson: 'Video lesson', pdf: 'PDF resource', event: 'Event', quiz: 'Practice quiz' };
export function blankEntry(kind: Kind = 'lesson'): Entry {
  return {kind,status:'draft',title:'',description:'',level:kind === 'event'?'all':'primary',classLevel:kind==='event'?'':'P1',subject:'',topic:'',teacherName:CONTACT.name,videoAssetId:'',lowDataVideoAssetId:'',pdfAssetId:'',coverAssetId:'',galleryAssetIds:[],eventType:'Seminar',date:'',time:'',venue:'',questions:[],examType:'',examYear:new Date().getFullYear(),revisionType:'',registrationOpen:false,registrationCapacity:0,registrationDeadline:''};
}

export function newRequestId(){const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;const h=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;}
