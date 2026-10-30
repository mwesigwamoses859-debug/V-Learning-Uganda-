import {useState} from 'react';
import {ArrowRight,BookOpen,CalendarDays,Check,FileText,GraduationCap,Search,Sparkles,Video} from 'lucide-react';
import {classes} from '../models';

type Props={onNavigate:(view:string,classLevel?:string)=>void;onSearch:(query:string)=>void};

export default function SchoolHome({onNavigate,onSearch}:Props) {
  const [search,setSearch]=useState('');
  return <>
    <section className="school-hero">
      <div className="hero-copy">
        <span className="eyebrow"><span className="green-dot"/>THE UGANDAN DIGITAL CLASSROOM</span>
        <h1>Great learning.<br/><em>Closer to home.</em></h1>
        <p>A place to learn, revise and grow. Discover video lessons, PDF notes and quizzes for Primary and Secondary schools across Uganda.</p>
        <div className="hero-actions"><button className="button" onClick={()=>onNavigate('primary')}>Explore Primary<ArrowRight size={17}/></button><button className="button secondary" onClick={()=>onNavigate('secondary')}>Explore Secondary<ArrowRight size={17}/></button></div>
        <div className="hero-assurances"><span><Check size={15}/>Free access for now</span><span><Check size={15}/>No learner account needed</span></div>
      </div>
      <div className="classroom-scene" aria-label="An illustrated school chalkboard and books">
        <span className="scene-caption"><Sparkles size={14}/>A little curiosity goes a long way.</span>
        <div className="chalkboard"><div className="chalkboard-heading"><BookOpen size={18}/><span>V-LEARNING CLASSROOM</span><span className="chalk-star">✧</span></div><div className="chalk-message">Every learner.<br/>Every possibility.</div><div className="chalk-subjects"><span>Aa Bb Cc</span><span>√ a² + b²</span><svg viewBox="0 0 58 52" width="58" height="52" fill="none" aria-hidden="true"><path d="M10 39L28 7l19 32H10ZM28 7v32M11 41c7 4 27 4 35 0" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3"/><circle cx="28" cy="40" r="2" fill="currentColor"/></svg></div><div className="chalk-rule"/><p>Learn at your pace. Dream without limits.</p><span className="chalk-piece"/></div>
        <div className="scene-base"><div className="book-stack" aria-hidden="true"><span>DISCOVER</span><span>LEARN</span><span>GROW</span></div><div className="pencil-pot" aria-hidden="true"><i/><i/><i/><span>✦</span></div></div>
        <div className="school-stamp"><GraduationCap size={21}/><span>Made for<br/><strong>Ugandan learners</strong></span></div>
      </div>
    </section>
    <div className="home-search-wrap"><form className="home-search" onSubmit={e=>{e.preventDefault();onSearch(search);}}><label htmlFor="home-search"><Search size={21}/><span>What would you like to learn?</span></label><input id="home-search" placeholder="Search a subject, topic or class…" value={search} onChange={e=>setSearch(e.target.value)}/><button className="button" type="submit">Find materials<ArrowRight size={17}/></button></form><p>Video lessons <span>·</span> PDF notes <span>·</span> Practice quizzes</p></div>
    <section className="section classroom-paths"><div className="section-heading"><div><span className="eyebrow">FIND YOUR CLASSROOM</span><h2>Where shall we begin?</h2></div><p className="section-note">Your class. Your subjects. Your pace.</p></div><div className="classroom-grid">
      {(['primary','secondary'] as const).map((level,i)=><article className={'classroom-card '+level} key={level}><div className="classroom-card-heading"><span className="classroom-icon">{i===0?<BookOpen size={25}/>:<GraduationCap size={27}/>}</span><span className="class-range">{i===0?'P1 — P7':'S1 — S6'}</span></div><h3>{i===0?'Primary school':'Secondary school'}</h3><p>{i===0?'Build a strong foundation, one discovery at a time.':'Go further with O-Level and A-Level learning.'}</p><div className="class-shortcuts" aria-label={level+' classes'}>{classes(level).map(c=><button key={c} onClick={()=>onNavigate(level,c)}>{c}</button>)}</div><button className="classroom-link" onClick={()=>onNavigate(level)}>Enter {level} classroom<ArrowRight size={19}/></button></article>)}
    </div></section>
    <section className="school-noticeboard section"><div className="noticeboard-copy"><span className="eyebrow"><CalendarDays size={16}/>BEYOND THE CLASSROOM</span><h2>School life.<br/>Shared moments.</h2><p>Come together for quiz events, seminars and workshops. Find announcements, event photos and recordings in one place.</p><button className="button secondary" onClick={()=>onNavigate('events')}>Visit the noticeboard<ArrowRight size={17}/></button></div><div className="noticeboard-links"><button onClick={()=>onNavigate('events')}><span className="noticeboard-symbol"><CalendarDays size={24}/></span><span><strong>Events & seminars</strong><small>Announcements, photos and videos</small></span><ArrowRight size={20}/></button><button onClick={()=>onNavigate('quiz')}><span className="noticeboard-symbol gold"><Sparkles size={24}/></span><span><strong>Quiz Arena</strong><small>Practise, check and keep improving</small></span><ArrowRight size={20}/></button><button onClick={()=>onNavigate('resources')}><span className="noticeboard-symbol blue"><FileText size={24}/></span><span><strong>The reading room</strong><small>Download PDF notes for revision</small></span><ArrowRight size={20}/></button></div></section>
  </>;
}
