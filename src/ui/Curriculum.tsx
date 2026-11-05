import {secondarySubjects,subjectGroup} from '../curriculum';
export default function Curriculum({classLevel,subject,onSelect}:{classLevel:string;subject:string;onSelect:(subject:string)=>void}) {
  return <details className="curriculum-panel panel" open={classLevel!=='all'} key={classLevel}>
    <summary>Subjects for {classLevel==='all'?'Uganda Secondary':classLevel.replace('S','S.')} <span>{['S5','S6'].includes(classLevel)?'A-Level · UACE':classLevel==='all'?'S.1–S.6':'O-Level · UCE'}</span></summary>
    <p>Choose a subject to find published videos, notes and quizzes. This is a subject directory; materials appear as teachers publish them. Optional subjects depend on the school and, at A-Level, the learner’s combination.</p>
    <div className="subject-directory">{secondarySubjects(classLevel).map(name=><button key={name} aria-pressed={subject===name} className={subject===name?'active':''} onClick={()=>onSelect(subject===name?'all':name)}><strong>{name}</strong>{classLevel!=='all'&&<small>{subjectGroup(name,classLevel)}</small>}</button>)}</div>
    <a href="https://ncdc.go.ug/directorates/" target="_blank" rel="noopener noreferrer">Uganda curriculum subject information · NCDC</a>
  </details>;
}
