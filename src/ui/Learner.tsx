import {SubscriptionBanner,type Subscription} from './Subscriptions';
import {useEffect, useRef, useState, type FormEvent} from 'react';
import {ArrowLeft, ArrowRight, BookOpen, CalendarDays, Check, CheckCircle2, Copy, Eye, EyeOff, FileText, GraduationCap, KeyRound, LogOut, ShieldCheck, UserRound, School, Phone, Mail, Sparkles} from 'lucide-react';
import {api} from '../api';
import {classes} from '../models';

export interface Learner {id:string; username:string; displayName:string; classLevel:string; schoolName?:string; phone?:string; email?:string; createdAt:string;accountType?:'student'|'school';trial?:{limit:number;used:number;remaining:number};subscription?:Subscription}
export type LearnerView = 'login'|'signup'|'account'|'recover';
interface Props {
  view:LearnerView; learner:Learner|null; loading:boolean; sessionError:string;
  recoveryCode:string; feedback:string; onRetry:()=>void;
  onNavigate:(view:string,classLevel?:string)=>void;
  onAuthenticated:(result:{learner:Learner;recoveryCode?:string})=>void|Promise<void>;
  onUpdated:(learner:Learner)=>void; onSignedOut:(message?:string)=>void; onRecoverySaved:()=>void;
}

function ClassChoice({value,onChange,required=false}:{value:string;onChange:(value:string)=>void;required?:boolean}) {
  return (
    <label>
      Select your class {required ? <strong style={{color:'#be1373'}}>*</strong> : <span className="optional-label">(optional)</span>}
      <select value={value} onChange={e=>onChange(e.target.value)} required={required}>
        <option value="">{required ? '-- Choose your class to see your work --' : 'I’m exploring all learning'}</option>
        <optgroup label="Primary School">
          {classes('primary').map(c=><option key={c} value={c}>{c} {c==='P7'?'(PLE Candidate)':''}</option>)}
        </optgroup>
        <optgroup label="Secondary School">
          {classes('secondary').map(c=><option key={c} value={c}>{c} {c==='S4'?'(UCE Candidate)':c==='S6'?'(UACE Candidate)':''}</option>)}
        </optgroup>
      </select>
      <small className="field-help">You will be placed directly in this class to see your lessons and past papers.</small>
    </label>
  );
}

function PasswordField({label,name,value,onChange,newPassword=false}:{label:string;name:string;value:string;onChange:(value:string)=>void;newPassword?:boolean}) {
  const [visible,setVisible]=useState(false);
  const showHelp=newPassword&&!name.includes('confirm');
  return <label htmlFor={name}>{label}<span className="learner-password"><input id={name} name={name} aria-label={label} type={visible?'text':'password'} value={value} onChange={e=>onChange(e.target.value)} autoComplete={newPassword?'new-password':'current-password'} minLength={newPassword?12:undefined} maxLength={128} required aria-describedby={showHelp?name+'-help':undefined}/><button type="button" className="icon-button" aria-label={(visible?'Hide ':'Show ')+label.toLowerCase()} aria-pressed={visible} onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></span>{showHelp&&<small className="field-help" id={name+'-help'}>At least 12 characters. Keep your password private.</small>}</label>;
}

function RecoveryCode({code,onDone,recovered=false}:{code:string;onDone:()=>void;recovered?:boolean}) {
  const [copied,setCopied]=useState(false),[saved,setSaved]=useState(false),[copyError,setCopyError]=useState('');
  useEffect(()=>{const guard=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue='';};window.addEventListener('beforeunload',guard);return()=>window.removeEventListener('beforeunload',guard);},[]);
  return <section className="recovery-panel panel" aria-labelledby="recovery-title"><span className="learner-icon"><KeyRound size={25}/></span><span className="eyebrow">{recovered?'PASSWORD RESET':'ACCOUNT CREATED'}</span><h1 id="recovery-title">Save your private recovery code.</h1><p>This code lets you reset a forgotten password without an email address. Keep it somewhere safe and private. It will only be shown now.</p><div className="recovery-code"><code>{code}</code><button className="button secondary" type="button" onClick={async()=>{try{await navigator.clipboard.writeText(code);setCopied(true);setCopyError('');}catch{setCopyError('Please write down the code or select it to copy.');}}}>{copied?<Check size={17}/>:<Copy size={17}/>} {copied?'Copied':'Copy code'}</button></div>{copyError&&<p role="status" className="field-help">{copyError}</p>}<p className="recovery-note"><ShieldCheck size={18}/>Anyone with this code can reset your password. Don’t share it.</p><label className="learner-checkbox"><input type="checkbox" checked={saved} onChange={e=>setSaved(e.target.checked)}/>I have saved my recovery code in a safe place.</label><button className="button" disabled={!saved} onClick={onDone}>{recovered?'Continue to login':'Continue to learning'}<ArrowRight size={18}/></button></section>;
}

function AuthStory(){return <aside className="auth-story"><span className="eyebrow"><GraduationCap size={18}/>YOUR NEXT CHAPTER</span><h2>A little curiosity.<br/><em>A world of learning.</em></h2><p>One learner account, for wherever your school journey takes you in Uganda.</p><div className="auth-school-photo"><img src="/images/classroom-uganda.jpg" width={1440} height={960} alt="Students studying in a classroom in Uganda"/><span><BookOpen size={18}/>Made for Ugandan learners</span></div><div className="auth-story-points"><span><CheckCircle2 size={17}/>Primary P1–P7</span><span><CheckCircle2 size={17}/>Secondary S1–S6</span><span><CheckCircle2 size={17}/>Flexible access plans</span></div></aside>;}

function LearnerAccount({learner,onNavigate,onUpdated,onSignedOut}:{learner:Learner;onNavigate:Props['onNavigate'];onUpdated:Props['onUpdated'];onSignedOut:Props['onSignedOut']}) {
  const [displayName,setDisplayName]=useState(learner.displayName),[classLevel,setClassLevel]=useState(learner.classLevel),[currentPassword,setCurrentPassword]=useState(''),[newPassword,setNewPassword]=useState(''),[confirmation,setConfirmation]=useState(''),[busy,setBusy]=useState(''),[profileError,setProfileError]=useState(''),[passwordError,setPasswordError]=useState(''),[logoutError,setLogoutError]=useState(''),[saved,setSaved]=useState(false);
  useEffect(()=>{setDisplayName(learner.displayName);setClassLevel(learner.classLevel);},[learner.displayName,learner.classLevel]);
  const [schoolName,setSchoolName]=useState(learner.schoolName||''),[phone,setPhone]=useState(learner.phone||''),[email,setEmail]=useState(learner.email||'');
  async function saveProfile(event:FormEvent){event.preventDefault();setBusy('profile');setProfileError('');setSaved(false);try{const result=await api<{learner:Learner}>('/api/learner/profile',{displayName,classLevel,schoolName,phone,email});onUpdated(result.learner);setSaved(true);}catch(error){setProfileError((error as Error).message);}finally{setBusy('');}}
  async function changePassword(event:FormEvent){event.preventDefault();setPasswordError('');if(newPassword!==confirmation){setPasswordError('Your new passwords do not match.');return;}setBusy('password');try{await api('/api/learner/password',{currentPassword,newPassword});setCurrentPassword('');setNewPassword('');setConfirmation('');onSignedOut('Password changed. Log in with your new password.');}catch(error){setPasswordError((error as Error).message);}finally{setBusy('');}}

  return (
    <section className="section learner-account">
      <div className="learner-welcome">
        <div>
          <span className="eyebrow"><UserRound size={16}/>MY LEARNER ACCOUNT</span>
          <h1>Welcome, {learner.displayName}.</h1>
          <p>{learner.classLevel ? learner.classLevel + ' Candidate · ' : ''}Assigned to {learner.classLevel || 'all learning materials'}.</p>
        </div>
        <div className="learner-welcome-actions">
          <span className="badge"><CheckCircle2 size={16}/>Learner account</span>
          <button className="button secondary" disabled={!!busy} onClick={async()=>{setBusy('logout');setLogoutError('');try{await api('/api/learner/logout',{});onSignedOut('You have logged out safely.');}catch(error){setLogoutError((error as Error).message);}finally{setBusy('');}}}>
            <LogOut size={17}/>{busy==='logout'?'Logging out…':'Log out'}
          </button>
        </div>
      </div>
      {logoutError && <p className="alert error" role="alert">{logoutError}</p>}

      <SubscriptionBanner learner={learner} onNavigate={onNavigate}/>
      {/* Direct class shortcut */}
      <div className="learner-shortcuts">
        {[
          {view: learner.classLevel.startsWith('S') ? 'secondary' : 'primary', title: learner.classLevel ? 'Open My ' + learner.classLevel + ' Work & Lessons' : 'Explore Primary', icon: GraduationCap, classLevel: learner.classLevel},
          {view: 'learning', title: 'My Learning Dashboard', icon: BookOpen},
          {view: 'revision', title: 'UNEB Past Papers Vault', icon: FileText},
          {view: 'events', title: 'School Quiz & Events', icon: CalendarDays}
        ].map(({view, title, icon: Icon, classLevel})=>(
          <button key={view} onClick={()=>onNavigate(view, classLevel)}>
            <span><Icon size={23}/></span>
            <strong>{title}</strong>
            <ArrowRight size={17}/>
          </button>
        ))}
      </div>

      <div className="account-settings">
        <form className="panel learner-form account-card" onSubmit={saveProfile}>
          <div className="account-card-heading">
            <span className="learner-icon"><UserRound size={22}/></span>
            <div>
              <h2>My Student Details</h2>
              <p>Your name, school and assigned class.</p>
            </div>
          </div>
          <label>Default Login Username<input value={learner.username} readOnly autoComplete="username"/><small className="field-help">Use this username to log in on any device. It stays the same.</small></label>
          <label>Student name<input name="displayName" value={displayName} onChange={e=>{setDisplayName(e.target.value);setSaved(false);}} minLength={2} maxLength={80} autoComplete="nickname" required/></label>
          <label>School name<input value={schoolName} maxLength={150} onChange={e=>setSchoolName(e.target.value)}/></label>
          <label>Contact phone (optional)<input value={phone} maxLength={25} type="tel" onChange={e=>setPhone(e.target.value)}/></label>
          <label>Email (optional)<input value={email} maxLength={254} type="email" onChange={e=>setEmail(e.target.value)}/></label>
          <ClassChoice value={classLevel} onChange={value=>{setClassLevel(value);setSaved(false);}}/>
          {profileError && <p role="alert" className="error-text">{profileError}</p>}
          {saved && <p role="status" className="learner-success"><CheckCircle2 size={17}/>Your details have been saved.</p>}
          <button className="button" disabled={!!busy}>{busy==='profile'?'Saving…':'Save my details'}</button>
        </form>

        <form className="panel learner-form account-card" onSubmit={changePassword}>
          <div className="account-card-heading">
            <span className="learner-icon yellow"><KeyRound size={22}/></span>
            <div>
              <h2>Change Password</h2>
              <p>Keep your learning account private.</p>
            </div>
          </div>
          <PasswordField label="Current password" name="account-current-password" value={currentPassword} onChange={setCurrentPassword}/>
          <PasswordField label="New password" name="account-new-password" value={newPassword} onChange={setNewPassword} newPassword/>
          <PasswordField label="Confirm new password" name="account-confirm-password" value={confirmation} onChange={setConfirmation} newPassword/>
          {passwordError && <p role="alert" className="error-text">{passwordError}</p>}
          <p className="field-help">You’ll log in again on your devices after changing your password.</p>
          <button className="button secondary" disabled={!!busy}>{busy==='password'?'Updating…':'Update password'}</button>
        </form>
      </div>

      <div className="learner-free-note">
        <ShieldCheck size={21}/>
        <p>Your account keeps your learning records. Full access to lessons, PDFs and quizzes requires an approved subscription.</p>
      </div>
    </section>
  );
}

export default function LearnerPages(props:Props){
  const {view,learner,loading,sessionError,recoveryCode,feedback,onRetry,onNavigate,onAuthenticated,onUpdated,onSignedOut,onRecoverySaved}=props;
  
  // Sign up fields required by user
  const [studentName, setStudentName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [accountType,setAccountType]=useState<'student'|'school'>('student');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [classLevel, setClassLevel] = useState('');

  // Login & auth states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [customLogin, setCustomLogin] = useState(false);
  const [code, setCode] = useState('');
  const [replacementCode, setReplacementCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  
  const errorRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(error)errorRef.current?.focus();},[error]);

  // Auto-generate default login username whenever student name or class changes
  useEffect(() => {
    if (view === 'signup' && !customLogin) {
      const cleanName = studentName.trim().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) || 'student';
      const cleanClass = accountType==='school'?'school':(classLevel || 'student').toLowerCase();
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      setUsername(`vl.${cleanClass}.${cleanName}.${randomSuffix}`);
      if (!password) {
        const uniquePassword='learn-'+Array.from(crypto.getRandomValues(new Uint8Array(12)),b=>b.toString(16).padStart(2,'0')).join('');
        setPassword(uniquePassword);
        setConfirmation(uniquePassword);
      }
    }
  }, [studentName, classLevel, view, customLogin,accountType]);

  if(view==='account') {
    if(loading)return <section className="section account-loading" role="status">Opening your learner account…</section>;
    if(sessionError)return <section className="section"><div className="panel account-message"><h1>We couldn’t open your account.</h1><p role="alert">{sessionError}</p><button className="button" onClick={()=>onRetry()}>Try again</button></div></section>;
    if(!learner)return <section className="section"><div className="panel account-message"><span className="learner-icon"><UserRound size={25}/></span><h1>Your learning space awaits.</h1><p>Log in to open your account, or create a free learner account.</p><div className="account-message-actions"><button className="button" onClick={()=>onNavigate('login')}>Log in<ArrowRight size={17}/></button><button className="button secondary" onClick={()=>onNavigate('signup')}>Create an account</button></div></div></section>;
    if(recoveryCode)return <section className="section recovery-section"><RecoveryCode code={recoveryCode} onDone={onRecoverySaved}/></section>;
    return <LearnerAccount learner={learner} onNavigate={onNavigate} onUpdated={onUpdated} onSignedOut={onSignedOut}/>;
  }

  const signup = view === 'signup', recover = view === 'recover';

  async function submit(event:FormEvent){
    event.preventDefault();
    setError('');

    if((signup || recover) && password !== confirmation){
      setError('Your passwords do not match.');
      return;
    }

    if(signup && accountType==='student' && !classLevel){
      setError('Please select your class so we can put you in that class to see your work.');
      return;
    }

    setBusy(true);
    try{
      if(recover){
        const result = await api<{recoveryCode:string}>('/api/learner/recover',{username,recoveryCode:code,newPassword:password});
        setPassword('');setConfirmation('');setCode('');setReplacementCode(result.recoveryCode);
      } else if (signup) {
        // Construct display name combining Student Name and School Name
        const finalDisplayName = studentName.trim();

        const result = await api<{learner:Learner;recoveryCode?:string}>('/api/learner/signup', {
          username: username.toLowerCase().trim(),
          password,
          displayName: finalDisplayName,
          schoolName:schoolName.trim(),phone:phone.trim(),email:email.trim(),accountType,
          classLevel:accountType==='school'?'':classLevel
        });


        setPassword('');
        setConfirmation('');
        await onAuthenticated(result);

      } else {
        const result = await api<{learner:Learner;recoveryCode?:string}>('/api/learner/login', {
          username: username.toLowerCase().trim(),
          password
        });
        setPassword('');
        setConfirmation('');
        await onAuthenticated(result);

      }
    } catch(error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }


  return (
    <section className="section learner-auth">
      <a className="auth-back" href="/" onClick={e=>{e.preventDefault();onNavigate('home');}}>
        <ArrowLeft size={16}/>Back to learning
      </a>

      {replacementCode ? (
        <RecoveryCode code={replacementCode} recovered onDone={()=>{setReplacementCode('');onSignedOut('Password reset. Log in with your new password.');}}/>
      ) : (
        <div className="auth-layout">
          <AuthStory/>
          
          <div className="auth-card panel">
            <div className="auth-card-heading">
              <span className="learner-icon">{recover ? <KeyRound size={24}/> : <UserRound size={24}/>}</span>
              <span className="eyebrow">V-LEARNING UGANDA</span>
              <h1>{signup ? 'Student & School Registration' : recover ? 'Find your way back.' : 'Student & Learner Sign In'}</h1>
              <p>
                {signup
                  ? 'Sign up to be placed directly in your class, receive your default student login, and see your syllabus work.'
                  : recover
                  ? 'Use the private recovery code saved when you signed up.'
                  : 'Log in with your Student Login Username and password to see your class work.'}
              </p>
            </div>

            {!recover && (
              <div className="auth-tabs" aria-label="Learner account pages">
                <a href="/login" aria-current={!signup?'page':undefined} className={!signup?'active':''} onClick={e=>{e.preventDefault();onNavigate('login');}}>Log in</a>
                <a href="/signup" aria-current={signup?'page':undefined} className={signup?'active':''} onClick={e=>{e.preventDefault();onNavigate('signup');}}>Sign up</a>
              </div>
            )}

            {feedback && <p className="learner-success" role="status"><CheckCircle2 size={18}/>{feedback}</p>}

            {learner && !recover ? (
              <div className="already-signed-in">
                <p>You’re already logged in as <strong>{learner.displayName}</strong> ({learner.classLevel || 'Learner'}).</p>
                <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
                  <button className="button" onClick={()=>onNavigate(learner.classLevel.startsWith('S')?'secondary':'primary', learner.classLevel)}>
                    Open My {learner.classLevel} Work<ArrowRight size={17}/>
                  </button>
                  <button className="button secondary" onClick={()=>onNavigate('learning')}>
                    My Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <form className="learner-form" onSubmit={submit}>
                
                {/* SIGN UP FIELDS */}
                {signup && (
                  <>
                    <label>Register as<select value={accountType} onChange={e=>setAccountType(e.target.value as 'student'|'school')}><option value="student">Student</option><option value="school">School account</option></select><small className="field-help">Both accounts receive five free full video lessons. School accounts can submit a bulk subscription for registered students.</small></label>
                    <label>
                      {accountType==='school'?'School contact person':'Name of the Student'} <strong style={{color:'#be1373'}}>*</strong>
                      <input
                        name="studentName"
                        placeholder="e.g. Mukasa Ronald"
                        autoComplete="name"
                        value={studentName}
                        onChange={e=>setStudentName(e.target.value)}
                        minLength={2}
                        maxLength={60}
                        required
                      />
                    </label>

                    <label>
                      {accountType==='school'?'School name':'School Where You Study'} <strong style={{color:'#be1373'}}>*</strong>
                      <input
                        name="schoolName"
                        placeholder="e.g. Kampala Parents School / Greenhill / Kitende"
                        value={schoolName}
                        onChange={e=>setSchoolName(e.target.value)}
                        minLength={2}
                        maxLength={70}
                        required
                      />
                    </label>

                    <>{accountType==='student'&&<ClassChoice value={classLevel} onChange={setClassLevel} required />}</>

                    <label>
                      Phone Number <span className="optional-label">(if available — MTN or Airtel)</span>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="e.g. 0772 000 000"
                        value={phone}
                        onChange={e=>setPhone(e.target.value)}
                      />
                    </label>

                    <label>
                      Email Address <span className="optional-label">(if available)</span>
                      <input
                        type="email"
                        name="email"
                        placeholder="e.g. student@school.ac.ug"
                        value={email}
                        onChange={e=>setEmail(e.target.value)}
                      />
                    </label>

                    {/* ASSIGNED DEFAULT LOGIN PREVIEW CARD */}
                    <div className="panel" style={{background:'#fff0f8', padding:'16px', borderRadius:'12px', border:'1px solid #eadfe6'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px'}}>
                        <span className="eyebrow" style={{margin:0}}><Sparkles size={14}/>ASSIGNED DEFAULT LOGIN</span>
                        <button
                          type="button"
                          className="text-button"
                          style={{fontSize:'11px', minHeight:'auto'}}
                          onClick={()=>setCustomLogin(!customLogin)}
                        >
                          {customLogin ? 'Use Auto Default' : 'Custom Username?'}
                        </button>
                      </div>

                      <div style={{fontSize:'13px', lineHeight:'1.6'}}>
                        <div>Default Username: <code style={{fontWeight:800, color:'#be1373', background:'#fff', padding:'2px 8px', borderRadius:'6px', border:'1px solid #ebdbe4'}}>{username || 'Assigning...'}</code></div>
                        <div style={{marginTop:'4px', color:'#626477', fontSize:'12px'}}>
                          Default Password: <code style={{color:'#24324b', background:'#fff', padding:'2px 6px', borderRadius:'4px'}}>{password}</code>
                        </div>
                        <div style={{marginTop:'4px', fontSize:'11px', color:'#167d7f'}}>
                          {accountType==='school'?'Your school will appear automatically in the school management panel.':<>Your student record will be placed automatically in <strong>{classLevel || 'your selected class'}</strong>.</>} Five free video lessons are included.
                        </div>
                      </div>
                    </div>

                    {customLogin && (
                      <label>
                        Customize Username
                        <input
                          name="username"
                          autoComplete="username"
                          autoCapitalize="none"
                          spellCheck={false}
                          value={username}
                          onChange={e=>setUsername(e.target.value)}
                          minLength={3}
                          maxLength={30}
                          pattern="[a-zA-Z0-9][a-zA-Z0-9._\-]{2,29}"
                          title="3–30 letters, numbers, dots, underscores or hyphens"
                          required
                        />
                      </label>
                    )}
                  </>
                )}

                {/* SIGN IN USERNAME FIELD */}
                {!signup && !recover && (
                  <label>
                    Student Login Username
                    <input
                      name="username"
                      placeholder="e.g. vl.p7.mukasa.281"
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      value={username}
                      onChange={e=>setUsername(e.target.value)}
                      required
                    />
                    <small className="field-help">Enter the default username assigned when you registered.</small>
                  </label>
                )}

                {recover && (
                  <label>
                    Private recovery code
                    <input
                      name="recoveryCode"
                      autoComplete="off"
                      autoCapitalize="characters"
                      value={code}
                      onChange={e=>setCode(e.target.value)}
                      maxLength={80}
                      required
                    />
                    <small className="field-help">Enter the code you saved when creating your account.</small>
                  </label>
                )}

                <PasswordField
                  label={recover ? 'New password' : signup ? 'Password (Default assigned or your own)' : 'Password'}
                  name="learner-password"
                  value={password}
                  onChange={setPassword}
                  newPassword={signup || recover}
                />

                {(signup || recover) && (
                  <PasswordField
                    label="Confirm password"
                    name="learner-confirm-password"
                    value={confirmation}
                    onChange={setConfirmation}
                    newPassword
                  />
                )}

                <div ref={errorRef} tabIndex={-1}>
                  {error && <p className="alert error" role="alert">{error}</p>}
                </div>

                <button className="button auth-submit" disabled={busy || loading}>
                  {busy
                    ? (signup ? accountType==='school'?'Registering school…':'Enrolling in ' + classLevel + '…' : recover ? 'Resetting password…' : 'Logging in…')
                    : signup
                    ? accountType==='school'?'Register School':`Sign Up & Enter ${classLevel || 'Class'}`
                    : recover
                    ? 'Reset password'
                    : 'Log in'}
                  <ArrowRight size={18}/>
                </button>

                {!signup && !recover && (
                  <a className="auth-recover-link" href="/recover" onClick={e=>{e.preventDefault();onNavigate('recover');}}>
                    Forgot your password?
                  </a>
                )}

                {recover && (
                  <a className="auth-recover-link" href="/login" onClick={e=>{e.preventDefault();onNavigate('login');}}>
                    Back to login
                  </a>
                )}
              </form>
            )}

            <div className="auth-free-note">
              <ShieldCheck size={17}/>
              <span>Your registration details and quiz marks are saved with your account. Watch selected preview videos before signing up, then choose a subscription and submit your payment reference for full access.</span>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
