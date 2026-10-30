export type Level = 'primary' | 'secondary' | 'all';
export type Kind = 'lesson' | 'pdf' | 'event' | 'quiz';
export interface Question { question: string; options: string[]; answer?: number; explanation?: string }
export interface Entry {
  id?: string; kind: Kind; status: 'draft' | 'published'; title: string; description: string;
  level: Level; classLevel: string; subject: string; topic: string; teacherName: string;
  videoAssetId: string; pdfAssetId: string; coverAssetId: string; galleryAssetIds: string[];
  eventType: string; date: string; time: string; venue: string; questions: Question[];
  access?: 'free'; priceUGX?: number; createdAt?: string; updatedAt?: string;
}
export const CONTACT = { name: 'Tr Ojok Mtn', phone: '+256 778 441681', tel: '+256778441681', whatsapp: 'https://wa.me/256778441681' };
export const classes = (level: Level) => Array.from({length: level === 'primary' ? 7 : 6}, (_,i) => `${level === 'primary' ? 'P' : 'S'}${i+1}`);
export const mediaUrl = (id: string, download = false) => `/api/media/${id}${download ? '?download=1' : ''}`;
export const kindLabel: Record<Kind, string> = { lesson: 'Video lesson', pdf: 'PDF resource', event: 'Event', quiz: 'Practice quiz' };
export function blankEntry(kind: Kind = 'lesson'): Entry {
  return {kind,status:'draft',title:'',description:'',level:kind === 'event'?'all':'primary',classLevel:'P1',subject:'',topic:'',teacherName:CONTACT.name,videoAssetId:'',pdfAssetId:'',coverAssetId:'',galleryAssetIds:[],eventType:'Seminar',date:'',time:'',venue:'',questions:[]};
}
