import {BookOpen} from 'lucide-react';

export default function SchoolBrand({light=false}:{light?:boolean}) {
  return <span className={'school-brand'+(light?' light':'')}><span className="school-crest"><BookOpen size={24} strokeWidth={1.7}/><span>V</span></span><span><strong>V-Learning<span>UGANDA</span></strong><small>Knowledge opens doors.</small></span></span>;
}
