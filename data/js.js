/* =====================================================
   AEC MV2 — js.js (v5.2) — OK
   Semua fungsi lama dipertahankan + update 8 fix
   ===================================================== */
var LOG=function(){console.log.apply(console,['[MV2]'].concat(Array.prototype.slice.call(arguments)));};
var ERR=function(){console.error.apply(console,['[MV2]'].concat(Array.prototype.slice.call(arguments)));};
window.addEventListener('error',function(e){ERR('window error',e.message);});
function $(i){return document.getElementById(i);}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function cleanTitle(s){
 if(s==null)return '';
 var o=String(s);
 var c=o.replace(/&bullet;|&middot;|&#8226;|&#183;|&#x2022;|•|·/g,'').trim();
 return c.length>0?c:o.trim();
}
var CFG=Object.assign({GH:"https://raw.githubusercontent.com/caksup/aec/main/data/",LOG:"",WA:"6285335913758",MINIGAME:"https://aec-id.blogspot.com/p/minigames.html",MCQ:"https://aec-id.blogspot.com/p/mcq.html"},window.AEC_CONFIG||{});
var up=new URLSearchParams(location.search);var TM=up.get('mode')==='test';
function LSK(n){return (TM?'test_':'')+n;}
/* ===== FIX 3: Avatar default = emoji murid ===== */
var DEFAULT_AVATAR='\u{1F9D1}\u{200D}\u{1F393}';
var AVATARS=[
 '\u{1F9D1}\u{200D}\u{1F393}','\u{1F468}\u{200D}\u{1F393}','\u{1F469}\u{200D}\u{1F393}',
 '\u{1F9D1}\u{200D}\u{1F3EB}','\u{1F468}\u{200D}\u{1F4BC}','\u{1F469}\u{200D}\u{1F4BC}',
 '\u{1F468}\u{200D}\u{2695}\u{FE0F}','\u{1F469}\u{200D}\u{2695}\u{FE0F}',
 '\u{1F468}\u{200D}\u{1F680}','\u{1F469}\u{200D}\u{1F680}',
 '\u{1F468}\u{200D}\u{1F3A4}','\u{1F469}\u{200D}\u{1F3A4}'
];
/* GIF placeholder 2 (cowok/cewek) — ganti sendiri nanti */
var AVATARS_GIF=[
 {emoji:'\u{1F466}\u{1F3FB}',label:'BOY',cls:'gif'},
 {emoji:'\u{1F467}\u{1F3FB}',label:'GIRL',cls:'gif'}
];
var GAMES=[['drag','Drag & Drop','drag_indicator'],['tf','True / False','task_alt'],['scramble','Scramble','shuffle'],['anagram','Anagram','spellcheck'],['flash','Flash Card','style'],['find','Find Match','search'],['group','Group Sort','sort'],['sentence','Complete','edit_note'],['box','Open Box','inventory_2'],['pairs','Memory Pairs','grid_view']];
var EXTRA_TOOLS=[{k:'mem',mi:'psychology',n:'Memorize it',d:'Hafal kalimat',go:'#mem'},{k:'mcq',mi:'quiz',n:'Multiple Choice',d:'Vocab quiz',go:'#mcq'},{k:'flash',mi:'style',n:'Flashcards',d:'Flip cards',go:'#flash'},{k:'listen',mi:'headphones',n:'Listening',d:'Hear & choose',go:'#listen'},{k:'scramble',mi:'shuffle',n:'Scramble',d:'Rearrange',go:'#scramble'},{k:'sentence',mi:'construction',n:'Sentence Builder',d:'Make sentence',go:'#sentence'},{k:'dict',mi:'menu_book',n:'Dictionary',d:'Search',go:'#dict'}];
var lang=localStorage.getItem('aecLang')||'en';
var I18N={
 en:{welcome:'Welcome Back',enter_idpin:'Sign in to continue',sign_in:'SIGN IN',learn:'Learn',practice:'Practice',speak:'Speak',extra:'Extra',welcome_to:'Welcome to',digital:'Digital',book:'Book',tagline:'Learning English is <b>easy</b>, <b>fun</b>, and <b>enjoyable!</b>'},
 id:{welcome:'Selamat Datang',enter_idpin:'Masuk untuk lanjut',sign_in:'MASUK',learn:'Belajar',practice:'Latihan',speak:'Bicara',extra:'Ekstra',welcome_to:'Selamat datang di',digital:'Digital',book:'Buku',tagline:'Belajar bahasa Inggris itu <b>mudah</b>, <b>seru</b>, dan <b>menyenangkan!</b>'}
};
var DAYS_EN=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var DAYS_ID=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
var MONTHS_EN=['January','February','March','April','May','June','July','August','September','October','November','December'];
var MONTHS_ID=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
function t(k){return (I18N[lang]&&I18N[lang][k])||k;}
function applyLang(){
 document.querySelectorAll('[data-i18n]').forEach(function(el){
  var k=el.getAttribute('data-i18n');
  if(k==='tagline'){el.innerHTML=I18N[lang][k]||k;}
  else if(I18N[lang][k])el.textContent=I18N[lang][k];
 });
 setGreet();updateTime();renderGuide();
}
function toggleLang(){lang=lang==='en'?'id':'en';localStorage.setItem('aecLang',lang);applyLang();}
function pad2(n){return n<10?'0'+n:''+n;}
function setGreet(){
 var now=new Date();var h=now.getHours();
 var greetEn=h>=4&&h<12?'Good morning':h<15?'Good afternoon':h<19?'Good evening':'Good night';
 var greetId=h>=4&&h<12?'Selamat pagi':h<15?'Selamat siang':h<19?'Selamat sore':'Selamat malam';
 var g=lang==='id'?greetId:greetEn;
 var gEl=$('greet');if(gEl)gEl.textContent=g+'!';
}
/* ===== FIX 2: Jam AM/PM ===== */
function updateTime(){
 var now=new Date();
 var days=lang==='id'?DAYS_ID:DAYS_EN;
 var months=lang==='id'?MONTHS_ID:MONTHS_EN;
 var day=days[now.getDay()];
 var dd=pad2(now.getDate());
 var month=months[now.getMonth()];
 var yyyy=now.getFullYear();
 var h24=now.getHours();
 var ampm=h24>=12?'PM':'AM';
 var h12=h24%12;if(h12===0)h12=12;
 var hh=pad2(h12);
 var mm=pad2(now.getMinutes());
 var ss=pad2(now.getSeconds());
 var str=day+', '+dd+' '+month+' '+yyyy+' | '+hh+':'+mm+':'+ss+' '+ampm;
 var el=$('time-display');
 if(el)el.textContent=str;
}
function todayStr(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function yestStr(){var d=new Date(Date.now()-86400000);return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function sess(){try{return JSON.parse(localStorage.getItem(LSK('aecSession'))||'null');}catch(e){return null;}}
function confetti(){var cols=['#10b981','#3b82f6','#f59e0b','#8b5cf6','#ef4444','#ec4899'];for(var i=0;i<50;i++){var c=document.createElement('div');c.className='cf';c.style.left=Math.random()*100+'vw';c.style.background=cols[i%cols.length];c.style.animationDuration=(1.5+Math.random()*1.8)+'s';document.body.appendChild(c);setTimeout(function(cc){return function(){cc.remove();};}(c),4000);}}
var _actx=null;
function sfx(t){try{_actx=_actx||new (window.AudioContext||window.webkitAudioContext)();var o=_actx.createOscillator(),g=_actx.createGain();o.connect(g);g.connect(_actx.destination);g.gain.value=.08;if(t==='ok'){o.frequency.value=880;o.type='sine';o.start();o.frequency.exponentialRampToValueAtTime(1320,_actx.currentTime+.15);o.stop(_actx.currentTime+.2);}else if(t==='bad'){o.frequency.value=200;o.type='square';o.start();o.stop(_actx.currentTime+.15);}else if(t==='click'){o.frequency.value=660;g.gain.value=.04;o.start();o.stop(_actx.currentTime+.05);}else if(t==='done'){o.frequency.value=523;o.start();o.frequency.setValueAtTime(659,_actx.currentTime+.15);o.frequency.setValueAtTime(784,_actx.currentTime+.3);o.stop(_actx.currentTime+.5);}}catch(e){}}
var fsDone=false;
function doFS(){try{var el=document.documentElement;if(el.requestFullscreen)el.requestFullscreen();else if(el.webkitRequestFullscreen)el.webkitRequestFullscreen();}catch(e){}}
document.addEventListener('pointerdown',function(){if(fsDone)return;fsDone=true;doFS();},{once:true});
function toggleFullscreen(){if(document.fullscreenElement||document.webkitFullscreenElement){if(document.exitFullscreen)document.exitFullscreen();$('fs-icon').textContent='fullscreen';}else{doFS();$('fs-icon').textContent='fullscreen_exit';}}
var focusMode=false;
function startFocusGuard(){
  focusMode=true;
  try{history.pushState({focus:1},'');}catch(e){}
  window.addEventListener('popstate',onFocusBack);
  window.addEventListener('beforeunload',onBeforeUnload);
}
function stopFocusGuard(){
  focusMode=false;
  window.removeEventListener('popstate',onFocusBack);
  window.removeEventListener('beforeunload',onBeforeUnload);
}
function onFocusBack(){
  if(!focusMode)return;
  try{history.pushState({focus:1},'');}catch(e){}
  showLockedMsg('focus','Ayo tetap fokus belajar!','Jangan keluar dulu, selesaikan sesi fokusmu.');
}
function onBeforeUnload(e){if(focusMode){e.preventDefault();e.returnValue='';}}
function showLockedMsg(title,msg,sub){
  $('locked-title').textContent=title||'Terkunci';
  $('locked-msg').innerHTML=esc(msg||'')+(sub?'<br><small>'+esc(sub)+'</small>':'');
  $('ov-locked').classList.add('on');
}
function showLocked(msg){showLockedMsg('Terkunci',msg||'Selesaikan materi untuk membuka.','');}
function showDevLocked(){showLockedMsg('Locked','Under development, please be patient to wait it','');}
document.addEventListener('fullscreenchange',function(){if(focusMode&&!document.fullscreenElement){showLockedMsg('focus','Ayo tetap fokus belajar!','Mode layar penuh dimatikan.');}});

function cacheGet(k){try{return JSON.parse(localStorage.getItem('c_'+k));}catch(e){return null;}}
function cacheSet(k,v){try{localStorage.setItem('c_'+k,JSON.stringify(v));}catch(e){}}
async function fetchRetry(url,n){var lastErr=null;for(var i=0;i<(n||3);i++){try{var c=new AbortController();var tm=setTimeout(function(){c.abort();},10000);var r=await fetch(url+'?t='+Date.now()+'-'+i,{signal:c.signal,cache:'no-store'});clearTimeout(tm);if(!r.ok)throw new Error('HTTP '+r.status);var txt=await r.text();try{return JSON.parse(txt);}catch(pe){throw new Error('JSON parse: '+pe.message);}}catch(e){lastErr=e;}}throw lastErr||new Error('fetch failed');}
async function loadJSON(key,url){var cached=cacheGet(key);try{var data=await fetchRetry(url);cacheSet(key,data);return data;}catch(e){if(cached)return cached;throw e;}}
function getQ(){try{return JSON.parse(localStorage.getItem(LSK('logq'))||'[]');}catch(e){return[];}}
function setQ(q){try{localStorage.setItem(LSK('logq'),JSON.stringify(q));}catch(e){}}
function enqueue(b){var q=getQ();q.push(b);setQ(q);}
function post(b){if(!CFG.LOG)return;if(!navigator.onLine){enqueue(b);return;}fetch(CFG.LOG,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(b)}).catch(function(){enqueue(b);});}
function flushQ(){var q=getQ();if(!q.length)return;setQ([]);q.forEach(post);}
window.addEventListener('online',function(){$('ofl').classList.remove('on');flushQ();});
window.addEventListener('offline',function(){$('ofl').classList.add('on');});
if(!navigator.onLine)$('ofl').classList.add('on');
function sendLog(tipe,detail,opt){opt=opt||{};var s=sess();if(!s)return;var b={tipe:tipe,id:s.id,nama:s.name,kelas:s.class,kategori:opt.kategori||curCat,unit:opt.unit||'',part:opt.part||'',detail:detail,durasi:opt.durasi||'',feedback:opt.feedback||'',quiz:opt.quiz||''};if(TM)b.target='test';post(b);}
function sendVocab(kata,arti,aksi,hasil,poin){var s=sess();if(!s)return;post({target:(TM?'test':'vocab'),id:s.id,nama:s.name,kelas:s.class,kata:kata,arti:arti,aksi:aksi,hasil:hasil,poin:poin});}
function sendProgress(unit,part,kat){var s=sess();if(!s)return;post({target:'progress',id:s.id,nama:s.name,kelas:s.class,kategori:kat,unit:unit,part:part,status:'done'});}
function sendAch(id,name){var s=sess();if(!s)return;post({target:'ach',id:s.id,nama:s.name,kelas:s.class,achId:id,achName:name});}
function sendNotes(){var s=sess();if(!s)return;post({target:'notes',id:s.id,nama:s.name,kelas:s.class,unit:curUnit,part:curPart,note:$('note-ta').value});}
function sendBookmark(en,id,aksi,cat,unit){var s=sess();if(!s)return;post({target:'bookmark',id:s.id,nama:s.name,kelas:s.class,en:en,arti:id,aksi:aksi,kategori:cat,unit:unit});}
function sendLeaderboard(){var s=sess();if(!s)return;var st=getStats();var plays=Object.values(st.plays||{}).reduce(function(a,b){return a+b;},0);var parts=countParts().dn;var poin=plays*5+parts*10+(st.dailyStreak||0)*5;post({target:'leaderboard',id:s.id,nama:s.name,kelas:s.class,poin:poin,parts:parts,streak:st.dailyStreak||0});}
function sendQuizSession(total,benar,salah,persen,grade,bintang,review,durasi){var s=sess();if(!s)return;post({target:'quizsession',id:s.id,nama:s.name,kelas:s.class,kategori:activeCat,unit:curUnit,part:curPart,total:total,benar:benar,salah:salah,persen:Math.round(persen),grade:grade,bintang:bintang,review:review,durasi:durasi});}
function sendGameSession(type,ok,total,poin){var s=sess();if(!s)return;post({target:'vocab',id:s.id,nama:s.name,kelas:s.class,kata:type,arti:'',aksi:'game-'+type,hasil:(ok===total?'SELESAI':'MAIN'),poin:poin});sendLeaderboard();}

/* ===== NEW: Online count (Fix 8: "X Online") ===== */
var _lbCache=null,_lbCacheTime=0;
async function fetchLeaderboardFromSheet(forceFresh){
 var now=Date.now();
 if(!forceFresh&&_lbCache&&(now-_lbCacheTime)<60000)return _lbCache;
 try{
  var url=(CFG.LOG||'')+'?action=fetch_leaderboard&_='+now;
  var r=await fetch(url,{cache:'no-store'});
  if(!r.ok)throw new Error('HTTP '+r.status);
  var data=await r.json();
  var arr=Array.isArray(data)?data:(data.rows||data.data||[]);
  _lbCache=arr;_lbCacheTime=now;
  return arr;
 }catch(e){ERR('fetchLeaderboard:',e.message);return _lbCache||[];}
}
async function updateOnlineCount(){
 try{
  if(!CFG.LOG)return;
  var r=await fetch(CFG.LOG+'?action=fetch_online&minutes=5&_='+Date.now(),{cache:'no-store'});
  if(!r.ok)return;
  var arr=await r.json();
  var count=Array.isArray(arr)?arr.length:0;
  var el=$('online-num');if(el)el.textContent=count;
 }catch(e){}
}

var D=null,_promise=null,_loadError=null;
var curCat='speaking',activeCat='speaking',curUnit='',curPart='';
var speakItems=[],speakIdx=0,rec=null,sttFinal='',sttStart=0;
var kem=localStorage.getItem(LSK('kemampuan'))||'B';
var ttsRate=0.7;
function setRate(v){ttsRate=parseFloat(v)||0.7;}
async function loadAll(forceFresh){
 if(forceFresh){['c_user','c_speaking','c_grammar','c_vocab','c_speaklive'].forEach(function(k){localStorage.removeItem(k);});D=null;_promise=null;_loadError=null;}
 if(D)return D;
 if(_promise)return _promise;
 showLoadingState();
 _promise=(async function(){
  var cu=cacheGet('user'),cs=cacheGet('speaking'),cg=cacheGet('grammar'),cv=cacheGet('vocab');
  if(cu&&cs&&cg&&cv){D={settings:cu.settings||{},students:cu.students||[],speaking:cs.materials||{},grammar:cg.materials||{},vocabMats:(cv.materials)||{},vocabWords:(cv.words)||[],speaklive:(cacheGet('speaklive')||{}).kemampuan||{A:[],B:[],C:[]}};setLogos(D);}
  var results=await Promise.allSettled([loadJSON('user',CFG.GH+'user.json'),loadJSON('speaking',CFG.GH+'speaking.json'),loadJSON('grammar',CFG.GH+'grammar.json'),loadJSON('vocab',CFG.GH+'vocab.json'),loadJSON('speaklive',CFG.GH+'speaklive.json')]);
  var u=results[0].status==='fulfilled'?results[0].value:null;
  var sp=results[1].status==='fulfilled'?results[1].value:null;
  var gr=results[2].status==='fulfilled'?results[2].value:null;
  var vc=results[3].status==='fulfilled'?results[3].value:null;
  var sl=results[4].status==='fulfilled'?results[4].value:null;
  if(!u)throw new Error('user.json gagal dimuat dari '+CFG.GH+'user.json');
  D={settings:u.settings||{},students:u.students||[],speaking:(sp&&sp.materials)||{},grammar:(gr&&gr.materials)||{},vocabMats:(vc&&vc.materials)||{},vocabWords:(vc&&vc.words)||[],speaklive:(sl&&sl.kemampuan)||{A:[],B:[],C:[]}};
  setLogos(D);
  return D;
 })().catch(function(e){_loadError=e;throw e;}).finally(function(){_promise=null;});
 return _promise;
}
function setLogos(d){
 var la=(d.settings&&d.settings.logoAEC)||'',ls=(d.settings&&d.settings.logoSchool)||'';
 var s1=$('lg1'),s2=$('lg2'),h1=$('h-logo1'),h2=$('h-logo2');
 var l1=$('login-logo1'),l2=$('login-logo2');
 if(la){s1.src=la;s1.style.display='';h1.src=la;h1.style.display='';if(l1)l1.src=la;}
 else{s1.style.display='none';h1.style.display='none';}
 if(ls){s2.src=ls;s2.style.display='';h2.src=ls;h2.style.display='';if(l2)l2.src=ls;}
 else{s2.style.display='none';h2.style.display='none';}
}
function getMats(cat){if(cat==='speaking')return D?D.speaking:{};if(cat==='grammar')return D?D.grammar:{};return D?D.vocabMats:{};}
function cats(){return D?{speaking:D.speaking||{},grammar:D.grammar||{},vocabulary:D.vocabMats||{}}:{speaking:{},grammar:{},vocabulary:{}};}
function findUnit(m){if(D.speaking[m])return{cat:'speaking',unit:D.speaking[m]};if(D.grammar[m])return{cat:'grammar',unit:D.grammar[m]};if(D.vocabMats&&D.vocabMats[m])return{cat:'vocabulary',unit:D.vocabMats[m]};return null;}
function allWords(){var w=[];(D&&D.vocabWords||[]).forEach(function(v){w.push(v);});Object.values(cats()).forEach(function(cat){Object.values(cat).forEach(function(u){Object.values(u.parts||{}).forEach(function(p){parseVocab(p).forEach(function(v){if(!w.find(function(x){return x.en===v.en;}))w.push(v);});});});});return w;}
function allSentences(){
 var sents=[];
 if(!D)return sents;
 Object.values(D.speaking||{}).forEach(function(u){
  Object.values(u.parts||{}).forEach(function(p){
   buildSent(p.transcript||'').forEach(function(s){if(s&&s.length>5&&s.split(' ').length>=3)sents.push(s);});
  });
 });
 return sents;
}
function showLoadingState(){var msg='<div class="load-state"><span class="material-icons-round">sync</span>Memuat materi dari GitHub...</div>';$('grid-speaking').innerHTML=msg;$('grid-grammar').innerHTML=msg;$('vocab-units-grid').innerHTML=msg;}
function showErrorState(err){var msg='<div class="err-state"><span class="material-icons-round">error_outline</span>Gagal memuat materi<code>'+esc(err||'')+'</code><button class="btn dg" style="margin-top:.6rem" onclick="forceRefresh()"><span class="material-icons-round">refresh</span> Coba Lagi</button></div>';$('grid-speaking').innerHTML=msg;$('grid-grammar').innerHTML=msg;$('vocab-units-grid').innerHTML=msg;}
function getProg(){try{return JSON.parse(localStorage.getItem(LSK('aecProgress'))||'{}');}catch(e){return{};}}
function isDone(m,p){return getProg()[m+'-'+p]===true;}
function markDone(m,p){var pr=getProg();pr[m+'-'+p]=true;localStorage.setItem(LSK('aecProgress'),JSON.stringify(pr));bumpDaily();checkAch('part1','First Part');if(countParts().dn>=5)checkAch('part5','On Fire');if(countParts().dn>=10)checkAch('part10','Scholar');if(countParts().dn>=20)checkAch('part20','Master');sendProgress(m,p,activeCat);sendLeaderboard();}
function getDaily(){try{var d=JSON.parse(localStorage.getItem(LSK('aecDaily'))||'null');if(!d||d.date!==todayStr())return{date:todayStr(),count:0};return d;}catch(e){return{date:todayStr(),count:0};}}
function bumpDaily(){var d=getDaily();d.count=(d.count||0)+1;d.date=todayStr();localStorage.setItem(LSK('aecDaily'),JSON.stringify(d));}
function getStats(){try{return JSON.parse(localStorage.getItem(LSK('aecStats'))||'{}');}catch(e){return{};}}
function saveStats(s){localStorage.setItem(LSK('aecStats'),JSON.stringify(s));}
function touchLoginStreak(){var st=getStats();var t0=todayStr();if(st.lastLogin!==t0){st.loginStreak=(st.lastLogin===yestStr())?((st.loginStreak||0)+1):1;st.lastLogin=t0;saveStats(st);checkAch('first','First Step');if(st.loginStreak>=3)checkAch('streak3','3-Day');if(st.loginStreak>=7)checkAch('streak7','7-Day');if(st.loginStreak>=14)checkAch('streak14','14-Day');if(st.loginStreak>=30)checkAch('streak30','30-Day');}}
function touchStudyStreak(){var st=getStats();var t0=todayStr();if(st.lastStudy!==t0){st.dailyStreak=(st.lastStudy===yestStr())?((st.dailyStreak||0)+1):1;st.lastStudy=t0;saveStats(st);if(st.dailyStreak>=3)checkAch('streak3','3-Day');if(st.dailyStreak>=7)checkAch('streak7','7-Day');}}
function countParts(){var t=0,dn=0;Object.values(cats()).forEach(function(cat){Object.entries(cat).forEach(function(e){Object.keys(e[1].parts||{}).forEach(function(p){t++;if(isDone(e[0],p))dn++;});});});return{t:t,dn:dn};}
/* FIX 7: helper unit selesai & pengulangan */
function countUnitsDone(){var n=0;Object.values(cats()).forEach(function(cat){Object.entries(cat).forEach(function(e){var ks=Object.keys(e[1].parts||{});if(ks.length&&ks.every(function(p){return isDone(e[0],p);})){n++;}});});return n;}
function countRepeat(){var pr=getProg();var n=0;Object.values(pr).forEach(function(v){if(v===true)n++;});return n;}
function unlockedCount(){var c=countParts();return (getDaily().count>=1)?Math.min(GAMES.length,c.dn):0;}
function getAch(){try{return JSON.parse(localStorage.getItem(LSK('ach'))||'[]');}catch(e){return[];}}
function checkAch(id,name){var l=getAch();if(l.indexOf(id)>=0)return;l.push(id);localStorage.setItem(LSK('ach'),JSON.stringify(l));sendAch(id,name||id);}
var ACH_LIST=[
 {id:'first',mi:'celebration',name:'First Step',d:'Login pertama kali'},
 {id:'part1',mi:'task_alt',name:'First Part',d:'Selesaikan 1 part materi'},
 {id:'part5',mi:'directions_run',name:'On Fire',d:'Selesaikan 5 part'},
 {id:'part10',mi:'flag',name:'Scholar',d:'Selesaikan 10 part'},
 {id:'part20',mi:'military_tech',name:'Master',d:'Selesaikan 20 part'},
 {id:'quiz1',mi:'quiz',name:'Quiz Starter',d:'Selesaikan quiz pertama'},
 {id:'quizA',mi:'star',name:'Quiz Master',d:'Nilai A di quiz'},
 {id:'vocab10',mi:'translate',name:'Word Hunter',d:'10 kata vocab dikuasai'},
 {id:'vocab50',mi:'auto_stories',name:'Word Master',d:'50 kata vocab dikuasai'},
 {id:'speak1',mi:'mic',name:'First Speech',d:'Speak live pertama'},
 {id:'speakA',mi:'record_voice_over',name:'Great Speaker',d:'Nilai A di speak'},
 {id:'bm1',mi:'bookmark_border',name:'Saver',d:'Bookmark pertama'},
 {id:'bm5',mi:'bookmark',name:'Bookworm',d:'5 bookmark'},
 {id:'bm20',mi:'bookmarks',name:'Library',d:'20 bookmark'},
 {id:'note1',mi:'edit_note',name:'Note Taker',d:'Catatan pertama'},
 {id:'note10',mi:'description',name:'Journal',d:'10 catatan'},
 {id:'game1',mi:'sports_esports',name:'First Game',d:'Main game pertama'},
 {id:'game5',mi:'games',name:'Gamer',d:'5 games dimainkan'},
 {id:'listen1',mi:'headphones',name:'Good Ear',d:'Listening pertama'},
 {id:'listen10',mi:'graphic_eq',name:'Pro Listener',d:'10 listening'},
 {id:'scramble1',mi:'shuffle',name:'Unscrambler',d:'Scramble pertama'},
 {id:'scramble10',mi:'sort_by_alpha',name:'Word Wizard',d:'10 scramble'},
 {id:'sent1',mi:'construction',name:'Word Smith',d:'Sentence builder pertama'},
 {id:'sent10',mi:'edit',name:'Writer',d:'10 sentence builder'},
 {id:'streak3',mi:'local_fire_department',name:'3-Day',d:'Streak 3 hari'},
 {id:'streak7',mi:'whatshot',name:'7-Day',d:'Streak 7 hari'},
 {id:'streak14',mi:'emoji_events',name:'14-Day',d:'Streak 14 hari'},
 {id:'streak30',mi:'shield',name:'30-Day',d:'Streak 30 hari'},
 {id:'pomodoro',mi:'timer',name:'Focus Time',d:'Selesaikan Focus Learn'},
 {id:'mcq10',mi:'verified',name:'MCQ Expert',d:'10 quiz MCQ'},
 {id:'perfect',mi:'verified_user',name:'Perfectionist',d:'Quiz sempurna'}
];
/* ===== FIX 3: getAv/renderAvatar/refreshAv ===== */
function getAv(){
 var a=localStorage.getItem(LSK('avatar'));
 if(!a)return DEFAULT_AVATAR;
 if(String(a).indexOf('gif:')===0){
  var idx=parseInt(String(a).slice(4));
  if(isNaN(idx)||idx<0||idx>=AVATARS_GIF.length)return DEFAULT_AVATAR;
  return a;
 }
 return a;
}
function renderAvatar(av,size){
 size=size||'1.2rem';
 if(String(av).indexOf('gif:')===0){
  var idx=parseInt(String(av).slice(4));
  var g=AVATARS_GIF[idx]||AVATARS_GIF[0];
  return '<span style="font-size:'+size+'">'+g.emoji+'</span>';
 }
 return '<span style="font-size:'+size+'">'+esc(av)+'</span>';
}
function refreshAv(){
 var av=getAv();
 var html=renderAvatar(av,'1.2rem');
 var hAv=$('h-av');if(hAv)hAv.innerHTML=html;
 var navAv=$('nav-av');if(navAv)navAv.innerHTML=html;
 var pfAv=$('pf-av');if(pfAv)pfAv.innerHTML=renderAvatar(av,'3.5rem');
}
/* FIX 7: stat card kecil */
function statCard(icon,label,val){return '<div class="stat-mini"><span class="material-icons-round">'+icon+'</span><div class="v">'+val+'</div><div class="l">'+label+'</div></div>';}
function profTab(n,btn){['data','ach','avatar'].forEach(function(x){$('pf-'+x).classList.toggle('hid',x!==n);});var b2=document.querySelectorAll('#ov-profile .ptabs button');b2.forEach(function(b){b.classList.remove('active');});var idx=n==='data'?0:n==='ach'?1:2;if(btn)btn.classList.add('active');else b2[idx].classList.add('active');}
function openBmFolder(cat){var l=getBM().filter(function(b){return (b.cat||'vocabulary')===cat;});$('bmfold-title').textContent='Bookmarks - '+cleanTitle(cat);var byUnit={};l.forEach(function(b){var u=cleanTitle(b.unit)||'(umum)';(byUnit[u]=byUnit[u]||[]).push(b);});var html='';Object.keys(byUnit).sort().forEach(function(u){html+='<div style="font-weight:700;font-size:.78rem;margin:.6rem 0 .3rem;color:var(--p)">'+esc(u)+'</div>';byUnit[u].forEach(function(b){var gi=getBM().indexOf(b);html+='<div class="bm-card"><div><b>'+esc(b.en)+'</b><div class="tx-m">'+esc(b.id)+'</div></div><div class="acts"><button class="ib" style="background:var(--sf);color:var(--tx);width:28px;height:28px" onclick="speakWord(\''+esc(b.en)+'\')"><span class="material-icons-round" style="font-size:14px">volume_up</span></button><button class="ib" style="background:var(--sf);color:var(--danger);width:28px;height:28px" onclick="delBM('+gi+');openBmFolder(\''+cat+'\')"><span class="material-icons-round" style="font-size:14px">delete</span></button></div></div>';});});$('bmfold-body').innerHTML=html||'<div class="tc tx-m" style="padding:1rem">Kosong.</div>';$('ov-bmfold').classList.add('on');}
function openNoteFolder(cat){var all=getNotesAll().filter(function(n){return (n.cat||'vocabulary')===cat;});$('notefold-title').textContent='Notes - '+cleanTitle(cat);var html='';all.forEach(function(n){html+='<div class="card" style="padding:.6rem;cursor:default"><div class="tx-m" style="font-size:.66rem;font-weight:700;margin-bottom:.2rem">'+esc(cleanTitle(n.key))+'</div><div style="white-space:pre-wrap;font-size:.8rem">'+esc(n.text)+'</div></div>';});$('notefold-body').innerHTML=html||'<div class="tc tx-m" style="padding:1rem">Kosong.</div>';$('ov-notefold').classList.add('on');}
/* ===== FIX 7: openProfile dengan stat cards ===== */
function openProfile(){
 var s=sess();refreshAv();
 $('pf-name').textContent=s?s.name:'-';
 $('pf-id').textContent=s?s.id.toUpperCase():'-';
 $('pf-class').textContent=s?(s.class||'').toUpperCase():'-';
 var st=getStats();$('pf-login').textContent=st.loginStreak||0;$('pf-daily').textContent=st.dailyStreak||0;$('pf-parts').textContent=countParts().dn;
 var dc=getDaily().count>0;$('pf-dc').innerHTML='<span>Daily Challenge</span><b style="color:'+(dc?'var(--p)':'var(--danger)')+'">'+(dc?'Done':'Not yet')+'</b>';
 /* FIX 7: isi pf-stats */
 var statsHtml='';
 statsHtml+=statCard('menu_book','Materi',countParts().t);
 statsHtml+=statCard('flag','Part Selesai',countParts().dn);
 statsHtml+=statCard('school','Unit Selesai',countUnitsDone());
 statsHtml+=statCard('repeat','Pengulangan',countRepeat());
 var ps=$('pf-stats');if(ps)ps.innerHTML=statsHtml;
 var l=getAch();$('pf-ach-grid').innerHTML=ACH_LIST.map(function(a){var got=l.indexOf(a.id)>=0;return '<div class="ach'+(got?'':' lk')+'" title="'+a.name+' - '+a.d+'"><span class="material-icons-round">'+a.mi+'</span><b>'+a.name+'</b></div>';}).join('');
 var cur=getAv();
 var html='';
 AVATARS.forEach(function(a){html+='<div class="av'+(a===cur?' sel':'')+'" onclick="pickAvatar(\''+a+'\')">'+a+'</div>';});
 AVATARS_GIF.forEach(function(g,idx){
  var key='gif:'+idx;
  html+='<div class="av '+g.cls+(key===cur?' sel':'')+'" onclick="pickAvatar(\''+key+'\')" title="'+g.label+'"><span class="av-inner" style="font-size:1.8rem">'+g.emoji+'</span><span class="av-label">'+g.label+'</span></div>';
 });
 $('pf-grid').innerHTML=html;
 profTab('data');
 $('ov-profile').classList.add('on');
}
function pickAvatar(a){localStorage.setItem(LSK('avatar'),a);refreshAv();openProfile();sfx('click');}
function exCtrl(k){var e=(D&&D.settings&&D.settings.extra)||{};return e[k]||{locked:false,hidden:false};}
function showDCBalloon(){if(getDaily().count===0&&!sessionStorage.getItem(LSK('dcshown'))){sessionStorage.setItem(LSK('dcshown'),'1');$('dc-balloon').classList.add('on');setTimeout(function(){$('dc-balloon').classList.remove('on');},6000);}}

var curScreen='learn';
function go(h,btn){if(h.indexOf('#')!==0)h='#'+h;if(location.hash===h){route();}else{location.hash=h;}if(btn){document.querySelectorAll('.bnav button:not(.nav-av)').forEach(function(b){b.classList.remove('on');});btn.classList.add('on');sfx('click');}}
window.addEventListener('hashchange',route);
function route(){
 var h=location.hash||'#learn';var p=h.slice(1).split('/');var s=p[0];
 ['sc-login','sc-learn','sc-practice','sc-sp','sc-extra','sc-mcq','sc-listen','sc-scramble','sc-sentence','sc-dict','sc-flash','sc-mem','sc-unit','sc-player','sc-grammar-unit'].forEach(function(i){$(i).classList.add('hid');});
 $('hdr').style.display='';document.querySelector('.subhdr').style.display='';$('bnav').classList.remove('hid');$('fbar').classList.add('hid');$('fab-focus').classList.remove('hid');
 if(s==='learn'){curScreen='learn';$('sc-learn').classList.remove('hid');setLearnTab('vocab');renderLearn();setNav(0);}
 else if(s==='practice'){curScreen='practice';$('sc-practice').classList.remove('hid');renderPractice();setNav(1);}
 else if(s==='sp'){curScreen='sp';$('sc-sp').classList.remove('hid');initSpeak();setNav(2);}
 else if(s==='extra'){curScreen='extra';$('sc-extra').classList.remove('hid');renderExtra();setNav(3);}
 else if(s==='mcq'){curScreen='mcq';$('sc-mcq').classList.remove('hid');initMCQ();$('bnav').classList.add('hid');}
 else if(s==='listen'){curScreen='listen';$('sc-listen').classList.remove('hid');initListen();$('bnav').classList.add('hid');}
 else if(s==='scramble'){curScreen='scramble';$('sc-scramble').classList.remove('hid');initScramble();$('bnav').classList.add('hid');}
 else if(s==='sentence'){curScreen='sentence';$('sc-sentence').classList.remove('hid');if(!window._sbWord)pickSent();$('bnav').classList.add('hid');}
 else if(s==='dict'){curScreen='dict';$('sc-dict').classList.remove('hid');renderDict();$('bnav').classList.add('hid');}
 else if(s==='flash'){curScreen='flash';$('sc-flash').classList.remove('hid');initFlash();$('bnav').classList.add('hid');}
 else if(s==='mem'){curScreen='mem';$('sc-mem').classList.remove('hid');memInit();$('bnav').classList.add('hid');}
 else if(s==='unit'&&p[1]){curScreen='unit';curUnit=p[1];$('sc-unit').classList.remove('hid');renderUnit();$('bnav').classList.add('hid');}
 else if(s==='grammar-unit'&&p[1]){curScreen='grammar-unit';curUnit=p[1];$('sc-grammar-unit').classList.remove('hid');renderGrammarUnit();$('bnav').classList.add('hid');}
 else if(s==='player'&&p[1]&&p[2]){curScreen='player';curUnit=p[1];curPart=p[2];$('sc-player').classList.remove('hid');renderPlayer();$('bnav').classList.add('hid');$('fbar').classList.remove('hid');}
 else{location.hash='#learn';}
 $('app').scrollTop=0;
}
function setNav(i){document.querySelectorAll('.bnav button:not(.nav-av)').forEach(function(b,j){b.classList.toggle('on',j===i);});}
function setLearnTab(n,btn){['vocab','speaking','grammar'].forEach(function(x){$('learn-'+x).classList.toggle('hid',x!==n);});var btns=document.querySelectorAll('#learn-tabs button');btns.forEach(function(b){b.classList.remove('active');});var idx=n==='vocab'?0:n==='speaking'?1:2;if(btn)btn.classList.add('active');else btns[idx].classList.add('active');if(n==='vocab')renderVocabUnitsGrid();else if(n==='speaking')renderUnitsGrid('speaking','grid-speaking');else if(n==='grammar')renderUnitsGrid('grammar','grid-grammar');}
function pracTab(n,b){['vocab','speaking','grammar'].forEach(function(x){$('prac-'+x).classList.toggle('hid',x!==n);});b.parentElement.querySelectorAll('button').forEach(function(x){x.classList.remove('active');});b.classList.add('active');}
function extraTab(n,b){['tools','games','overview'].forEach(function(x){var el=$('extra-'+x);if(el)el.classList.toggle('hid',x!==n);});b.parentElement.querySelectorAll('button').forEach(function(x){x.classList.remove('active');});b.classList.add('active');if(n==='overview')renderOverview();}
/* ===== FIX 5: Learn user-friendly ===== */
function renderVocabUnitsGrid(){
 if(!D){$('vocab-units-grid').innerHTML='<div class="load-state"><span class="material-icons-round">sync</span>Memuat...</div>';return;}
 var g=$('vocab-units-grid');g.innerHTML='';var count=0;
 Object.entries(D.vocabMats||{}).forEach(function(e){count++;var mId=e[0],mData=e[1];if(mData.hidden)return;var ks=Object.keys(mData.parts||{});var vc=0;ks.forEach(function(pId){vc+=parseVocab(mData.parts[pId]).length;});var done=ks.filter(function(p){return isDone(mId,p);}).length;var pct=ks.length?Math.round(done/ks.length*100):0;var card=document.createElement('div');card.className='card'+(mData.locked?' lk':'');var cta=mData.locked?'<span class="tag" style="margin-left:auto">🔒 Locked</span>':(pct>=100?'<span class="tag full" style="margin-left:auto">✅ Selesai</span>':'<span class="tag full" style="margin-left:auto">▶ Mulai</span>');card.innerHTML='<h4><span class="material-icons-round">folder</span><span style="flex:1">'+esc(cleanTitle(mData.title))+'</span>'+cta+'</h4>'+(ks.length?'<div style="margin:.3rem 0"><div style="background:var(--sf2);height:6px;border-radius:3px;overflow:hidden"><div style="background:var(--p);height:100%;width:'+pct+'%;border-radius:3px"></div></div><div class="sub" style="margin-top:.2rem">'+done+'/'+ks.length+' selesai • '+vc+' kata</div></div>':'')+'<div style="margin-top:.2rem;display:flex;flex-wrap:wrap;gap:.2rem">'+ks.slice(0,5).map(function(p){return '<span class="tag">'+p+'</span>';}).join('')+'</div>';if(!mData.locked)card.onclick=function(){go('#unit/'+mId);};g.appendChild(card);});
 if(!count)g.innerHTML='<div class="tc tx-m" style="padding:2rem 1rem;grid-column:1/-1">No vocabulary units yet.</div>';
}
function renderUnitsGrid(cat,id){var g=$(id);if(!D){g.innerHTML='<div class="load-state"><span class="material-icons-round">sync</span>Memuat...</div>';return;}g.innerHTML='';var mats=getMats(cat);var ks=Object.keys(mats);if(!ks.length){g.innerHTML='<div class="tc tx-m" style="padding:2rem 1rem;grid-column:1/-1">No '+cat+' material yet.</div>';return;}ks.forEach(function(mId){var mData=mats[mId];if(mData.hidden)return;var parts=mData.parts||{},locked=mData.locked===true,ks2=Object.keys(parts),done=ks2.filter(function(p){return isDone(mId,p);}).length;var pct=ks2.length?Math.round(done/ks2.length*100):0;var card=document.createElement('div');card.className='card'+(locked?' lk':'');var icon=locked?'lock':(cat==='grammar'?'school':'auto_stories');var cta=locked?'<span class="tag" style="margin-left:auto">🔒 Locked</span>':(pct>=100?'<span class="tag full" style="margin-left:auto">✅ Selesai</span>':'<span class="tag full" style="margin-left:auto">▶ Mulai</span>');card.innerHTML='<h4><span class="material-icons-round">'+icon+'</span><span style="flex:1">'+esc(cleanTitle(mData.title))+'</span>'+cta+'</h4>'+(ks2.length?'<div style="margin:.3rem 0"><div style="background:var(--sf2);height:6px;border-radius:3px;overflow:hidden"><div style="background:var(--p);height:100%;width:'+pct+'%;border-radius:3px"></div></div><div class="sub" style="margin-top:.2rem">'+done+'/'+ks2.length+' selesai</div></div>':'')+'<div style="margin-top:.2rem;display:flex;flex-wrap:wrap;gap:.2rem">'+ks2.slice(0,5).map(function(p){return '<span class="tag">'+p+'</span>';}).join('')+'</div>';if(!locked)card.onclick=function(){go(cat==='grammar'?'#grammar-unit/'+mId:'#unit/'+mId);};g.appendChild(card);});}
function speakWord(w){var u=new SpeechSynthesisUtterance(w);u.lang='en-US';speechSynthesis.speak(u);}
/* ===== FIX 4: c-n teks saja ===== */
async function renderLearn(){
 var s=sess();if(!s)return;
 var cnEl=$('c-n');if(cnEl)cnEl.textContent=(s.name||'—');
 $('c-i').textContent=s.id.toUpperCase();$('c-c').textContent=(s.class||'').toUpperCase();refreshAv();
 if(!D){try{await loadAll();}catch(e){showErrorState(e.message);return;}}
 if(!D){showErrorState(_loadError?_loadError.message:'Data tidak tersedia');return;}
 $('wl').textContent=(D.settings.welcomeMessage||'Hi {nama}!').replace('{nama}',s.name||'');
 var c=countParts(),un=unlockedCount();
 $('p-prog-t').textContent=c.dn+'/'+c.t;
 $('p-game-t').textContent=un+'/'+GAMES.length;
 $('p-stk-t').textContent=(getStats().dailyStreak||0);
 renderUnitsGrid('speaking','grid-speaking');renderUnitsGrid('grammar','grid-grammar');
}
function renderPractice(){
 var h='';
 h+='<div class="card" data-go="#mcq"><h4><span class="material-icons-round">quiz</span> Multiple Choice</h4><div class="sub">Test vocabulary</div></div>';
 h+='<div class="card" data-go="#flash"><h4><span class="material-icons-round">style</span> Flashcards</h4><div class="sub">Flip EN/ID</div></div>';
 h+='<div class="card" data-go="#listen"><h4><span class="material-icons-round">headphones</span> Listening</h4><div class="sub">Hear & choose</div></div>';
 h+='<div class="card" data-go="#scramble"><h4><span class="material-icons-round">shuffle</span> Word Scramble</h4><div class="sub">Rearrange letters</div></div>';
 h+='<div class="card" data-go="#dict"><h4><span class="material-icons-round">menu_book</span> Dictionary</h4><div class="sub">Search words</div></div>';
 $('prac-vocab').innerHTML=h;
 $('prac-speaking').innerHTML='<div class="card" data-go="#sentence"><h4><span class="material-icons-round">construction</span> Sentence Builder</h4><div class="sub">Make sentences</div></div><div class="card" data-go="#sp"><h4><span class="material-icons-round">mic</span> Speak Live</h4><div class="sub">Practice speaking</div></div>';
 $('prac-grammar').innerHTML='<div class="card" data-go="#sentence"><h4><span class="material-icons-round">construction</span> Sentence Builder</h4><div class="sub">Grammar practice</div></div><div class="card" data-go="#mcq?g=1"><h4><span class="material-icons-round">quiz</span> Grammar Quiz</h4><div class="sub">Test grammar</div></div><div class="card" data-go="#dict"><h4><span class="material-icons-round">menu_book</span> Dictionary</h4><div class="sub">Search words</div></div>';
 ['prac-vocab','prac-speaking','prac-grammar'].forEach(function(id){$(id).querySelectorAll('.card[data-go]').forEach(function(c){c.onclick=function(){go(c.getAttribute('data-go'));};});});
 renderLB();
}
function renderExtra(){var un=unlockedCount();$('ex-un').innerHTML='<span class="material-icons-round">'+(un>0?'lock_open':'lock')+'</span> '+un+'/'+GAMES.length;$('exgrid').innerHTML=GAMES.map(function(g,i){var open=i<un;return '<div class="card'+(open?'':' lk')+'" onclick="'+(open?"openMinigameType('"+g[0]+"')":"showLocked('Selesaikan "+(i+1)+" part untuk membuka game ini.')")+'"><h4><span class="material-icons-round">'+(open?g[2]:'lock')+'</span> '+g[1]+'</h4><span class="tag '+(open?'full':'')+'">'+(open?'Open':'Locked')+'</span></div>';}).join('');
 var tg='';EXTRA_TOOLS.forEach(function(tl){var c=exCtrl(tl.k);if(c.hidden)return;if(c.locked){tg+='<div class="card lk" onclick="showDevLocked()"><h4><span class="material-icons-round">lock</span> '+tl.n+'</h4><div class="sub">Locked</div></div>';return;}tg+='<div class="card" data-go="'+tl.go+'"><h4><span class="material-icons-round">'+tl.mi+'</span> '+tl.n+'</h4><div class="sub">'+tl.d+'</div></div>';});
 $('tools-grid').innerHTML=tg;
 $('tools-grid').querySelectorAll('.card[data-go]').forEach(function(c){c.onclick=function(){go(c.getAttribute('data-go'));};});
}
/* ===== Overview Siswa (fix key Nama Siswa/Poin/Kelas) ===== */
async function renderOverview(){
 var box=$('overview-box');
 if(!box)return;
 box.innerHTML='<div class="load-state"><span class="material-icons-round">sync</span>Memuat leaderboard...</div>';
 var s=sess();var me=s?s.id:'';
 try{
  var rows=await fetchLeaderboardFromSheet(true);
  if(!rows||!rows.length){
   box.innerHTML='<div class="empty" style="padding:2rem;text-align:center;color:var(--tx2)"><span class="material-icons-round" style="font-size:2.5rem;color:var(--tx3);display:block;margin-bottom:.5rem">leaderboard</span><b style="font-size:.9rem">Leaderboard Kosong</b><p style="font-size:.76rem;margin-top:.4rem">Endpoint Apps Script belum siap atau belum ada data.</p><button class="btn gh" style="margin-top:.8rem;max-width:200px" onclick="renderOverview()"><span class="material-icons-round">refresh</span> Coba Lagi</button></div>';
   return;
  }
  rows.sort(function(a,b){return (Number(b["Poin"])||0)-(Number(a["Poin"])||0);});
  var totalStudents=rows.length;
  var totalPoints=rows.reduce(function(a,b){return a+(Number(b["Poin"])||0);},0);
  var myIdx=rows.findIndex(function(r){return (r["ID Siswa"]||'').toString().toLowerCase()===me.toLowerCase();});
  var html='<div class="ov-stat">';
  html+='<div class="ov-stat-card"><div class="v">'+totalStudents+'</div><div class="l">Total Siswa</div></div>';
  html+='<div class="ov-stat-card"><div class="v">'+totalPoints+'</div><div class="l">Total Poin</div></div>';
  html+='<div class="ov-stat-card"><div class="v">'+(myIdx>=0?'#'+(myIdx+1):'-')+'</div><div class="l">Rank Kamu</div></div>';
  html+='</div>';
  if(rows.length>=3){
   var p=[rows[1],rows[0],rows[2]];
   var cls=['silver','gold','bronze'];
   var med=['🥈','🥇',''];
   html+='<div class="ov-podium">';
   for(var i=0;i<3;i++){
    var pr_=p[i];
    var nm=(pr_["Nama Siswa"]||pr_.nama||pr_["ID Siswa"]||'-');
    var pt=Number(pr_["Poin"]||pr_.poin)||0;
    var avChar=renderAvatar(DEFAULT_AVATAR,'1.5rem');
    html+='<div class="ov-podium-card '+cls[i]+'"><span class="medal">'+med[i]+'</span><div class="av-mini">'+avChar+'</div><div class="nm">'+esc(nm)+'</div><div class="pt">'+pt+' pt</div></div>';
   }
   html+='</div>';
  }
  html+='<div class="sec-t"><span class="material-icons-round">format_list_numbered</span> Semua Peringkat</div>';
  html+='<div style="max-height:50vh;overflow-y:auto">';
  rows.forEach(function(r,i){
   var isMe=(r["ID Siswa"]||'').toString().toLowerCase()===me.toLowerCase();
   var nm=(r["Nama Siswa"]||r.nama||r["ID Siswa"]||'-');
   var kelas=r["Kelas"]||r.kelas||'';
   var pt=Number(r["Poin"]||r.poin)||0;
   var avChar=renderAvatar(DEFAULT_AVATAR,'1rem');
   html+='<div class="lb'+(isMe?' me':'')+'"><div class="rk">'+(i+1)+'</div><div class="nm">'+avChar+' '+esc(nm)+' '+(kelas?'<span class="tag" style="font-size:.52rem;padding:.05rem .3rem">'+esc(kelas)+'</span>':'')+(isMe?'<span class="tag full" style="font-size:.52rem;padding:.05rem .3rem">YOU</span>':'')+'</div><div class="pt">'+pt+' pt</div></div>';
  });
  html+='</div>';
  box.innerHTML=html;
 }catch(e){
  box.innerHTML='<div class="err-state"><span class="material-icons-round">error_outline</span>Gagal load leaderboard<code>'+esc(e.message)+'</code><button class="btn dg" style="margin-top:.6rem" onclick="renderOverview()"><span class="material-icons-round">refresh</span> Coba Lagi</button></div>';
 }
}
function renderLB(){var me=sess();if(!me){$('lb-box').innerHTML='';return;}var st=getStats();var plays=Object.values(st.plays||{}).reduce(function(a,b){return a+b;},0);var myAv=renderAvatar(getAv(),'1.2rem');$('lb-box').innerHTML='<div class="lb me"><div class="rk">1</div><div class="nm">'+myAv+' '+esc(me.name)+' (you)</div><div class="pt">'+(plays*5+countParts().dn*10+(st.dailyStreak||0)*5)+' pt</div></div>';}
function renderUnit(){var fu=findUnit(curUnit);if(!fu){$('u-title').textContent='Not found';return;}activeCat=fu.cat;curCat=fu.cat;$('u-title').textContent=cleanTitle(fu.unit.title);var box=$('u-parts');box.innerHTML='';Object.entries(fu.unit.parts||{}).forEach(function(e){var pId=e[0],pd=e[1];if(pd.hidden)return;var done=isDone(curUnit,pId),plock=pd.locked===true;var r=document.createElement('div');r.className='row'+(done?' done':'');r.innerHTML='<div class="row-main"><span class="material-icons-round">'+(plock?'lock':(done?'check_circle':'play_circle'))+'</span><div><div class="row-t">'+esc(cleanTitle(pd.title))+'</div><div class="row-s">'+pId+(done?' - done':'')+'</div></div></div><span class="material-icons-round tx-m">chevron_right</span>';if(!plock)r.onclick=function(){go('#player/'+curUnit+'/'+pId);};box.appendChild(r);});}
/* ===== Grammar materi + exercise (dari admin grammar.json) ===== */
function renderGrammarUnit(){
 var fu=findUnit(curUnit);
 if(!fu||fu.cat!=='grammar'){$('gu-title').textContent='Not found';return;}
 activeCat='grammar';curCat='grammar';
 $('gu-title').textContent=cleanTitle(fu.unit.title);
 var body=$('gu-body');body.innerHTML='';
 var unit=fu.unit;
 var materi=unit.materi||'Grammar rule belum tersedia.';
 var exercises=unit.exercise||[];
 body.innerHTML+='<div class="grammar-materi"><h4><span class="material-icons-round">auto_stories</span> Materi</h4><div>'+formatMateri(materi)+'</div></div>';
 if(exercises.length){
  var exHtml='<div class="sec-t"><span class="material-icons-round">edit_note</span> Exercise <span class="tag full" style="margin-left:.3rem">'+exercises.length+' soal</span></div>';
  exercises.forEach(function(ex,i){exHtml+=renderGrammarExercise(ex,i);});
  exHtml+='<button class="btn" onclick="checkGrammarExercises()" style="margin-top:.5rem"><span class="material-icons-round">check_circle</span> Cek Jawaban</button>';
  exHtml+='<div id="gu-result" style="margin-top:.7rem"></div>';
  body.innerHTML+=exHtml;
 }else{
  body.innerHTML+='<div class="sec-t"><span class="material-icons-round">edit_note</span> Exercise Otomatis</div>';
  body.innerHTML+='<div class="tx-m" style="font-size:.76rem;margin-bottom:.5rem">Exercise dibuat otomatis dari vocab & speaking materi.</div>';
  body.innerHTML+=renderAutoGrammarExercise();
  body.innerHTML+='<button class="btn" onclick="checkGrammarExercises()" style="margin-top:.5rem"><span class="material-icons-round">check_circle</span> Cek Jawaban</button>';
  body.innerHTML+='<div id="gu-result" style="margin-top:.7rem"></div>';
 }
 sendLog('Buka Grammar',curUnit,{kategori:'grammar'});
}
function formatMateri(txt){
 var s=esc(txt);
 s=s.replace(/\*\*(.+?)\*\*/g,'<code>$1</code>');
 s=s.replace(/\n/g,'<br>');
 return s;
}
function renderGrammarExercise(ex,i){
 var html='<div class="grammar-exercise" data-idx="'+i+'" data-answer="'+esc(ex.answer||'')+'">';
 html+='<div class="ex-q">';
 if(ex.type==='fill'){
  var parts=(ex.q||'').split('___');
  html+=esc(parts[0]||'')+'<input type="text" class="gu-input" data-idx="'+i+'" placeholder="...">'+(esc(parts[1]||''));
 }else if(ex.type==='choose'){
  html+=esc(ex.q||'')+'<div style="margin-top:.5rem;display:flex;flex-direction:column;gap:.3rem">';
  (ex.opts||[]).forEach(function(o,j){
   html+='<label style="display:flex;align-items:center;gap:.4rem;padding:.4rem .6rem;background:var(--sf2);border-radius:var(--r-sm);cursor:pointer"><input type="radio" name="gu-'+i+'" value="'+esc(o)+'" class="gu-radio" data-idx="'+i+'" style="width:auto">'+esc(o)+'</label>';
  });
  html+='</div>';
 }else if(ex.type==='arrange'){
  html+=esc(ex.q||'')+'<input type="text" class="gu-input" data-idx="'+i+'" placeholder="Susun kalimat..." style="width:100%">';
 }else{
  html+=esc(ex.q||'')+'<input type="text" class="gu-input" data-idx="'+i+'" placeholder="Jawaban...">';
 }
 html+='</div></div>';
 return html;
}
function renderAutoGrammarExercise(){
 var words=allWords();
 var sents=allSentences();
 var exercises=[];
 var w1=shuffle(words.slice()).slice(0,3);
 w1.forEach(function(w){exercises.push({type:'fill',q:'The Indonesian meaning of "'+w.en+'" is ___.',answer:w.id.toLowerCase()});});
 if(sents.length){
  var s1=shuffle(sents.slice()).slice(0,2);
  s1.forEach(function(sent){
   var toks=sent.split(' ');
   if(toks.length>3){
    var target=toks[Math.floor(Math.random()*Math.min(toks.length,5))].replace(/[.,!?]/g,'');
    if(target.length>2){
     var opts=[target];
     var pool=words.map(function(w){return w.en.toLowerCase();}).filter(function(w){return w!==target.toLowerCase()&&w.length>2;});
     while(opts.length<3&&pool.length){
      var r=pool[Math.floor(Math.random()*pool.length)];
      if(opts.indexOf(r)<0)opts.push(r);
      pool=pool.filter(function(p){return p!==r;});
     }
     var q=sent.replace(new RegExp('\\b'+target.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i'),'___');
     exercises.push({type:'choose',q:'Fill in the blank: '+q,opts:shuffle(opts),answer:target.toLowerCase()});
    }
   }
  });
 }
 window._guAuto=exercises;
 var html='';
 exercises.forEach(function(ex,i){
  html+='<div class="grammar-exercise" data-idx="'+i+'" data-answer="'+esc(ex.answer||'')+'">';
  html+='<div class="ex-q">';
  if(ex.type==='fill'){
   var parts=(ex.q||'').split('___');
   html+=esc(parts[0]||'')+'<input type="text" class="gu-input" data-idx="'+i+'" placeholder="...">'+(esc(parts[1]||''));
  }else if(ex.type==='choose'){
   html+=esc(ex.q||'')+'<div style="margin-top:.5rem;display:flex;flex-direction:column;gap:.3rem">';
   (ex.opts||[]).forEach(function(o){
    html+='<label style="display:flex;align-items:center;gap:.4rem;padding:.4rem .6rem;background:var(--sf2);border-radius:var(--r-sm);cursor:pointer"><input type="radio" name="gu-auto-'+i+'" value="'+esc(o)+'" class="gu-radio" data-idx="'+i+'" style="width:auto">'+esc(o)+'</label>';
   });
   html+='</div>';
  }
  html+='</div></div>';
 });
 return html;
}
function checkGrammarExercises(){
 var exes=document.querySelectorAll('.grammar-exercise');
 var correct=0,total=exes.length;
 exes.forEach(function(el){
  var ans=(el.getAttribute('data-answer')||'').toLowerCase().trim();
  var input=el.querySelector('.gu-input');
  var radio=el.querySelector('.gu-radio:checked');
  var userAns='';
  if(input)userAns=(input.value||'').toLowerCase().trim();
  else if(radio)userAns=(radio.value||'').toLowerCase().trim();
  var ok=userAns&&userAns===ans;
  if(ok){correct++;el.style.borderColor='var(--p)';el.style.background='var(--p-light)';}
  else{el.style.borderColor='var(--danger)';el.style.background='rgba(239,68,68,.08)';}
 });
 var pct=total?Math.round(correct/total*100):0;
 var grade=pct>=80?'A':pct>=65?'B':pct>=50?'C':'D';
 var r=$('gu-result');
 r.innerHTML='<div class="sr" style="background:var(--p-light)"><span style="font-weight:700">Hasil</span><b>'+correct+'/'+total+' ('+pct+'%) - Grade '+grade+'</b></div>';
 sfx(pct>=50?'ok':'bad');
 if(pct>=70)confetti();
 sendLog('Grammar Exercise',curUnit+' = '+correct+'/'+total,{kategori:'grammar'});
 if(pct>=70)markDone(curUnit,'exercise');
}
/* ===== FIX 1: renderPlayer (tabel baris + kalimat per-kata) ===== */
function renderPlayer(){var fu=findUnit(curUnit);if(!fu)return;activeCat=fu.cat;curCat=fu.cat;var part=fu.unit.parts[curPart];if(!part)return;localStorage.setItem(LSK('lastUnit'),curUnit);$('pl-u').textContent=cleanTitle(fu.unit.title);$('pl-p').textContent=cleanTitle(part.title);var vocab=parseVocab(part);window._vocab=vocab;var bm=getBM();if(vocab.length){window._tts=vocab.map(function(v){return v.en;});$('pl-txt').innerHTML='<table class="vocab"><thead><tr><th>English</th><th>Indonesian</th></tr></thead><tbody>'+vocab.map(function(v,i){var b=bm.find(function(x){return x.en===v.en;});return '<tr class="tts-line" data-tts-idx="'+i+'"><td><span class="material-icons-round ic'+(b?' on':'')+'" onclick="bookmarkWord(\''+esc(v.en)+'\',\''+esc(v.id)+'\',\''+activeCat+'\',\''+curUnit+'\')">'+(b?'bookmark':'bookmark_border')+'</span>'+esc(v.en)+'</td><td>'+esc(v.id)+'</td></tr>';}).join('')+'</tbody></table>';}else{var sentences=buildSent(part.transcript);window._tts=sentences;$('pl-txt').innerHTML=sentences.map(function(s,i){return '<div class="tts-line" data-tts-idx="'+i+'">'+wrapTtsWords(s,i)+'</div>';}).join('');}$('pl-done').classList.toggle('hid',!isDone(curUnit,curPart));$('note-ta').value=getNote(curUnit,curPart);sendLog('Buka Materi',curUnit+' - '+curPart,{kategori:activeCat,unit:curUnit,part:curPart});}
function wrapTtsWords(text,lineIdx){
 var words=String(text||'').split(/(\s+)/);
 var html='';var wordIdx=0;
 words.forEach(function(w){
  if(/^\s+$/.test(w)){html+=w;return;}
  if(!w)return;
  html+='<span class="tts-word" data-line="'+lineIdx+'" data-widx="'+(wordIdx++)+'" onclick="ttsSpeakWord('+lineIdx+','+(wordIdx-1)+')">'+esc(w)+'</span>';
 });
 return html;
}
function ttsSpeakWord(lineIdx,widx){
 if(!window._tts||!window._tts[lineIdx])return;
 var sentence=window._tts[lineIdx];
 var words=String(sentence).split(/\s+/).filter(Boolean);
 var word=words[widx];
 if(!word)return;
 speakWord(word);
 document.querySelectorAll('.tts-word').forEach(function(el){el.classList.remove('active');});
 var el=document.querySelector('.tts-word[data-line="'+lineIdx+'"][data-widx="'+widx+'"]');
 if(el){el.classList.add('active');setTimeout(function(){el.classList.remove('active');},800);}
}
function parseVocab(p){var v=p.vocab;if(Object.prototype.toString.call(v)==='[object Array]')return v;return parseLines(p.transcript||'');}
function parseLines(t){var L=String(t).split(/\n/).map(function(l){return l.trim();}).filter(Boolean);if(!L.some(function(l){return /(\||=|->)/.test(l);}))return[];return L.map(function(l){var sep=l.indexOf('|')>=0?'|':(l.indexOf('->')>=0?'->':'=');var i=l.indexOf(sep);return{en:l.slice(0,i).trim(),id:l.slice(i+sep.length).trim()};});}
function buildSent(t){var c=String(t||'').replace(/\[\d{1,2}:\d{2}\]/g,' ');var m=c.match(/[^.!?\n]+[.!?]*/g)||[];return m.map(function(s){return s.trim();}).filter(Boolean);}
var ttsOn=false,ttsIdx=0;
function floatToggle(){if(!window._tts||!window._tts.length)return;if(ttsOn){ttsOn=false;speechSynthesis.cancel();$('f-icon').textContent='play_arrow';}else{if(ttsIdx>=window._tts.length)ttsIdx=0;ttsOn=true;$('f-icon').textContent='pause';speakAt(ttsIdx);}}
function floatStop(){ttsOn=false;speechSynthesis.cancel();ttsIdx=0;$('f-icon').textContent='play_arrow';highlight(-1);}
function speakAt(i){if(!ttsOn)return;if(i>=window._tts.length){ttsOn=false;$('f-icon').textContent='play_arrow';onDone();return;}ttsIdx=i;highlightLine(i);$('tts-prog').textContent=(i+1)+'/'+window._tts.length;var u=new SpeechSynthesisUtterance(window._tts[i]);u.lang='en-US';u.rate=ttsRate;u.onboundary=function(e){if(e.name==='word'&&ttsOn){highlightWordInLine(i,e.charIndex,e.charLength);}};u.onend=function(){highlightWordInLine(i,-1,0);if(ttsOn)speakAt(i+1);};u.onerror=function(){if(ttsOn)speakAt(i+1);};speechSynthesis.speak(u);}
function highlightLine(i){document.querySelectorAll('.tts-line.active').forEach(function(el){el.classList.remove('active');});document.querySelectorAll('.tts-word.active').forEach(function(el){el.classList.remove('active');});var el=document.querySelector('.tts-line[data-tts-idx="'+i+'"]');if function highlightLine(i){document.querySelectorAll('.tts-line.active').forEach(function(el){el.classList.remove('active');});document.querySelectorAll('.tts-word.active').forEach(function(el){el.classList.remove('active');});var el=document.querySelector('.tts-line[data-tts-idx="'+i+'"]');if(el){el.classList.add('active');el.scrollIntoView({block:'center',behavior:'smooth'});}}
function highlightWordInLine(lineIdx,charIdx,charLen){
 if(charIdx<0){document.querySelectorAll('.tts-word.active').forEach(function(el){el.classList.remove('active');});return;}
 var sentence=window._tts[lineIdx]||'';
 var beforeText=String(sentence).substring(0,charIdx);
 var wordCount=beforeText.split(/\s+/).filter(Boolean).length;
 document.querySelectorAll('.tts-word.active').forEach(function(el){el.classList.remove('active');});
 var el=document.querySelector('.tts-word[data-line="'+lineIdx+'"][data-widx="'+wordCount+'"]');
 if(el){el.classList.add('active');el.scrollIntoView({block:'center',behavior:'smooth'});}
}
function highlight(i){document.querySelectorAll('.tts-line.active').forEach(function(el){el.classList.remove('active');});if(i<0)return;var el=document.querySelector('.tts-line[data-tts-idx="'+i+'"]');if(el){el.classList.add('active');el.scrollIntoView({block:'center',behavior:'smooth'});}}
function onDone(){markDone(curUnit,curPart);touchStudyStreak();$('pl-done').classList.remove('hid');sfx('done');confetti();sendLog('Selesai Audio',curUnit+' - '+curPart,{kategori:activeCat,unit:curUnit,part:curPart});$('rc1').classList.remove('hid');$('rc2').classList.add('hid');$('ov-react').classList.add('on');}
function react(e){sfx('click');sendLog('Feedback',curUnit+' - '+curPart+' '+e,{feedback:e,kategori:activeCat,unit:curUnit,part:curPart});$('rc1').classList.add('hid');$('rc2').classList.remove('hid');}
function openMCQEmbed(){closeOv('ov-react');openGM(CFG.MCQ+'?unit='+curUnit+'&part='+curPart+'&cat='+activeCat+(TM?'&mode=test':''));}
function openMinigamesEmbed(){closeOv('ov-react');openGM(CFG.MINIGAME+'?unit='+curUnit+'&cat='+activeCat+(TM?'&mode=test':''));}
function replay(){if(window._tts){ttsOn=true;$('f-icon').textContent='pause';speakAt(0);}}
function openMinigameType(t){checkAch('game1','First Game');var st=getStats();st.plays=st.plays||{};st.plays[t]=(st.plays[t]||0)+1;saveStats(st);sendLeaderboard();var lastUnit=localStorage.getItem(LSK('lastUnit'))||curUnit||'s1';openGM(CFG.MINIGAME+'?unit='+lastUnit+'&type='+t+'&cat='+curCat+(TM?'&mode=test':''));}
function openGM(url){$('gm-fr').src=url;$('gm').classList.add('on');}
function closeGM(){$('gm').classList.remove('on');$('gm-fr').src='about:blank';}
window.addEventListener('message',function(e){
  if(e.data&&e.data.type==='aec-game-back'){closeGM();var d=e.data;if(d.ok!=null&&d.total!=null){var pct=d.total?Math.round(d.ok/d.total*100):0;confetti();sfx('done');showReward(d.source||'game',d.ok,d.total,pct);sendGameSession(d.type||d.source||'game',d.ok,d.total,d.ok*10);if(d.ok===d.total&&d.total>=5)checkAch('perfect','Perfectionist');}}
});
function showReward(src,ok,total,pct){var t=document.createElement('div');t.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#10b981,#059669);color:#fff;padding:.8rem 1.4rem;border-radius:20px;font-weight:700;font-size:.9rem;z-index:99999;box-shadow:0 12px 32px rgba(0,0,0,.2);animation:pop .4s';t.innerHTML='<span class="material-icons-round" style="vertical-align:middle">sports_esports</span> '+esc(src)+' selesai! '+ok+'/'+total+' ('+pct+'%)';document.body.appendChild(t);setTimeout(function(){t.remove();},2500);}

var pomoRun=null,pomoLeft=25*60;
var fab=$('fab-focus'),fabDrag=false,fabMoved=0,fabX=0,fabY=0;
fab.addEventListener('pointerdown',function(e){fabDrag=true;fabMoved=0;fabX=e.clientX;fabY=e.clientY;try{fab.setPointerCapture(e.pointerId);}catch(e2){}});
fab.addEventListener('pointermove',function(e){if(!fabDrag)return;var dx=e.clientX-fabX,dy=e.clientY-fabY;fabMoved+=Math.abs(dx)+Math.abs(dy);if(fabMoved>6){var r=fab.getBoundingClientRect();var nx=r.left+dx,ny=r.top+dy;nx=Math.max(4,Math.min(window.innerWidth-62,nx));ny=Math.max(4,Math.min(window.innerHeight-62,ny));fab.style.right='auto';fab.style.top=ny+'px';fab.style.left=nx+'px';fabX=e.clientX;fabY=e.clientY;}});
fab.addEventListener('pointerup',function(){fabDrag=false;if(fabMoved<=6){openFocus();}});
function openFocus(){$('ov-focus').classList.add('on');updatePomo();}
function updatePomo(){var txt=String(Math.floor(pomoLeft/60)).padStart(2,'0')+':'+String(pomoLeft%60).padStart(2,'0');if(pomoRun){$('fab-ic').classList.add('hid');$('fab-tx').classList.remove('hid');$('fab-tx').textContent=txt;fab.classList.add('run');}else{$('fab-ic').classList.remove('hid');$('fab-tx').classList.add('hid');fab.classList.remove('run');}$('focus-play').innerHTML=pomoRun?'<span class="material-icons-round">pause</span> Pause':'<span class="material-icons-round">play_arrow</span> Play';}
function pomoStart(){
 if(pomoRun){clearInterval(pomoRun);pomoRun=null;stopFocusGuard();}
 else{
  closeOv('ov-focus');
  doFS();
  startFocusGuard();
  pomoRun=setInterval(function(){pomoLeft--;updatePomo();if(pomoLeft<=0){clearInterval(pomoRun);pomoRun=null;pomoLeft=25*60;updatePomo();sfx('done');checkAch('pomodoro','Focus Time');stopFocusGuard();if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen();}},1000);
 }
 updatePomo();
}
function pomoReset(){if(pomoRun)clearInterval(pomoRun);pomoRun=null;pomoLeft=25*60;stopFocusGuard();updatePomo();}
function stopFocus(){closeOv('ov-focus');if(pomoRun){clearInterval(pomoRun);pomoRun=null;stopFocusGuard();updatePomo();}}

async function initSpeak(){$('sp-kem').innerHTML='<span class="material-icons-round">grade</span> Level '+kem;await loadSpeak();if(!speakItems.length){$('sp-target').textContent='No material.';return;}showSpeakItem();}
async function loadSpeak(){if(speakItems.length)return;if(!D){try{await loadAll();}catch(e){return;}}var k=(D&&D.speaklive)||{A:[],B:[],C:[]};speakItems=(k[kem]||k['B']||[]);}
function setKem(k,btn){kem=k;localStorage.setItem(LSK('kemampuan'),k);$('sp-kem').innerHTML='<span class="material-icons-round">grade</span> Level '+k;btn.parentElement.querySelectorAll('button').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');speakItems=[];speakIdx=0;initSpeak();}
function showSpeakItem(){var it=speakItems[speakIdx%speakItems.length];window._spIt=it;$('sp-target').innerHTML=wrapTtsWords(it.text,0);$('sp-focus').textContent=it.focus?('Focus: '+it.focus):'';$('sp-live').innerHTML='<span class="material-icons-round">mic</span> Tap mic and speak';$('sp-res').classList.add('hid');}
function nextSpeak(){sfx('click');speakIdx++;showSpeakItem();}
function tapMic(){if(rec){rec.stop();return;}var SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){alert('STT not supported');return;}rec=new SR();rec.lang='en-US';rec.interimResults=true;sttFinal='';sttStart=Date.now();$('sp-mic').classList.add('rec');rec.onresult=function(e){var t='';for(var i=0;i<e.results.length;i++)t+=e.results[i][0].transcript;sttFinal=t;$('sp-live').textContent=t||'...';};rec.onend=function(){rec=null;$('sp-mic').classList.remove('rec');computeSpeak();};rec.start();}
function words(s){return String(s).toLowerCase().replace(/[^a-z0-9' ]/g,'').split(/\s+/).filter(Boolean);}
function computeSpeak(){var it=window._spIt;if(!it)return;var tw=words(it.text),sw=words(sttFinal);var set={};sw.forEach(function(w){set[w]=1;});var matched=tw.filter(function(w){return set[w];}).length;var akurasi=sw.length?Math.round(matched/sw.length*100):0;var kelengkapan=tw.length?Math.round(matched/tw.length*100):0;var fw=['is','are','the','a','to','has','have','be','my','i','you','she','he'];var need=fw.filter(function(w){return tw.indexOf(w)>=0;});var got=need.filter(function(w){return set[w];}).length;var grammar=need.length?Math.round(got/need.length*100):100;var dur=Math.round((Date.now()-sttStart)/1000);var wpm=sw.length&&dur?Math.round(sw.length/(dur/60)):0;var fluency=(wpm>=60&&wpm<=180)?100:Math.max(40,100-Math.abs(120-wpm)/2);var total=Math.round(akurasi*.35+kelengkapan*.3+grammar*.15+fluency*.2);var grade=total>=80?'A':total>=65?'B':total>=50?'C':'D';var missing=tw.filter(function(w){return !set[w];});var feedback=missing.length?('Missing: '+missing.join(', ')):'Perfect!';
 $('sp-res').classList.remove('hid');$('sp-res').innerHTML='<div class="sr"><span>Accuracy</span><b>'+akurasi+'%</b></div><div class="sr"><span>Completeness</span><b>'+kelengkapan+'%</b></div><div class="sr"><span>Grammar</span><b>'+grammar+'%</b></div><div class="sr"><span>Fluency</span><b>'+Math.round(fluency)+'</b></div><div class="sr" style="background:var(--p-light)"><span style="font-weight:700">TOTAL</span><b>'+total+' ('+grade+')</b></div><div class="tx-m" style="font-size:.74rem;margin-top:.4rem;text-align:center">'+esc(feedback)+'</div>';
 sfx(total>=50?'ok':'bad');if(total>=70)confetti();checkAch('speak1','First Speech');if(grade==='A')checkAch('speakA','Great Speaker');
 var s=sess();if(s){post({target:(TM?'test':'speak'),id:s.id,nama:s.name,kelas:s.class,kemampuan:kem,itemId:it.id,target:it.text,stt:sttFinal,akurasi:akurasi,kelengkapan:kelengkapan,fluency:Math.round(fluency),grammar:grammar,total:total,grade:grade,feedback:feedback,durasi:dur});}
 sendLog('SpeakLive',kem+' / '+it.id+' = '+total,{kategori:'speaking',durasi:dur});sendLeaderboard();}

var mcqList=[],mcqI=0,mcqScore=0,mcqGrammar=false;
function initMCQ(){mcqGrammar=(location.hash.indexOf('g=1')>=0);if(mcqGrammar){var qs=[];Object.values(cats().grammar||{}).forEach(function(u){Object.values(u.parts||{}).forEach(function(p){(p.quiz||[]).forEach(function(q){qs.push({text:q.q,opts:q.opts,answer:q.opts[q.a],en:q.q,id:q.opts[q.a]});});});});mcqList=shuffle(qs).slice(0,8);}else{var w=shuffle(allWords()).slice(0,8);mcqList=w.map(function(v){var opts=[v.id];while(opts.length<4){var r=allWords()[Math.floor(Math.random()*allWords().length)].id;if(opts.indexOf(r)<0&&r!==v.id)opts.push(r);}return{text:v.en,opts:shuffle(opts),answer:v.id,en:v.en,id:v.id};});}mcqI=0;mcqScore=0;showMCQ();}
function showMCQ(){if(mcqI>=mcqList.length){confetti();checkAch('mcq10','MCQ Expert');go('#practice');return;}var q=mcqList[mcqI];$('mcq-prog').textContent=(mcqI+1)+'/'+mcqList.length;$('mcq-score').textContent=mcqScore;$('mcq-q').textContent=q.text;$('mcq-opts').innerHTML=q.opts.map(function(o){return '<button class="opt-btn" onclick="answerMCQ(this,\''+esc(o).replace(/'/g,"\\'")+'\')">'+esc(o)+'</button>';}).join('');}
function answerMCQ(btn,ans){var q=mcqList[mcqI];var ok=ans===q.answer;if(ok){mcqScore++;btn.classList.add('ok');sfx('ok');}else{btn.classList.add('no');sfx('bad');}sendVocab(q.en,q.id,'quiz',ok?'BENAR':'SALAH',ok?10:0);checkAch('quiz1','Quiz Starter');if(ok&&mcqScore===mcqList.length)checkAch('perfect','Perfectionist');sendLeaderboard();setTimeout(function(){mcqI++;showMCQ();},500);}
var lsList=[],lsI=0;
function initListen(){lsList=shuffle(allWords()).slice(0,6);lsI=0;showListen();}
function showListen(){if(lsI>=lsList.length){checkAch('listen10','Pro Listener');go('#extra');return;}var v=lsList[lsI];$('ls-prog').textContent=(lsI+1)+'/'+lsList.length;var opts=[v.id];while(opts.length<3){var r=allWords()[Math.floor(Math.random()*allWords().length)].id;if(opts.indexOf(r)<0&&r!==v.id)opts.push(r);}window._ls=v;$('ls-opts').innerHTML=shuffle(opts).map(function(o){return '<button class="opt-btn" onclick="answerListen(this,\''+esc(o).replace(/'/g,"\\'")+'\')">'+esc(o)+'</button>';}).join('');setTimeout(function(){speakWord(v.en);},300);}
function playListen(){if(window._ls)speakWord(window._ls.en);}
function answerListen(btn,ans){var ok=ans===window._ls.id;btn.classList.add(ok?'ok':'no');sfx(ok?'ok':'bad');sendVocab(window._ls.en,window._ls.id,'listening',ok?'BENAR':'SALAH',ok?10:0);checkAch('listen1','Good Ear');setTimeout(function(){lsI++;showListen();},500);}
var scList=[],scI=0;
function initScramble(){scList=shuffle(allWords()).slice(0,6);scI=0;showScramble();}
function showScramble(){if(scI>=scList.length){checkAch('scramble10','Word Wizard');go('#extra');return;}var v=scList[scI];window._sc=v;$('sc-prog').textContent=(scI+1)+'/'+scList.length;$('sc-word').textContent=shuffle(v.en.split('')).join('');$('sc-mean').textContent=v.id;$('sc-in').value='';}
function checkScramble(){var ok=$('sc-in').value.trim().toLowerCase()===window._sc.en.toLowerCase();sfx(ok?'ok':'bad');sendVocab(window._sc.en,window._sc.id,'scramble',ok?'BENAR':'SALAH',ok?10:0);checkAch('scramble1','Unscrambler');if(ok){scI++;showScramble();}}
function nextScramble(){scI++;showScramble();}
function pickSent(){var all=allWords();var v=all[Math.floor(Math.random()*all.length)]||{en:'eat',id:'makan'};window._sbWord=v;$('sb-word').textContent=v.en;$('sb-mean').textContent=v.id;$('sb-in').value='';$('sb-res').classList.add('hid');}
function isPron(w){return /^(i|you|we|they|he|she|it)$/i.test(w);}
function analyze(word,sent){var raw=sent.trim();if(!raw)return null;var issues=[];var s=raw;var f=s.charAt(0);if(f&&f!==f.toUpperCase()){issues.push('Start with capital letter');s=f.toUpperCase()+s.slice(1);}if(!/[.?!]$/.test(s)){issues.push('End with punctuation');s=s+'.';}var tokens=s.replace(/[.?!]/g,'').split(/\s+/).filter(Boolean);var subj=tokens[0]||'';var third=/^(he|she|it)$/i.test(subj)||(!isPron(subj)&&subj&&/^[A-Z]/.test(subj));var base=word.toLowerCase();if(new RegExp('\\b'+base+'\\b','i').test(s)&&third){issues.push('Subject "'+subj+'" needs verb+s');s=s.replace(new RegExp('\\b'+base+'\\b','i'),base+'s');}var hasTime=/(every|today|now|always|usually|often|sometimes|morning|day|week)/i.test(s);if(!hasTime){s=s.replace(/[.?!]$/,'')+' every day.';}var bd=[{w:subj,l:isPron(subj)?'Pronoun subject (TPS)':'Subject (noun)'}];var verbTok=null;for(var i=0;i<tokens.length;i++){var lw=tokens[i].toLowerCase();if(lw===base||lw===base+'s'){verbTok=tokens[i];break;}}if(verbTok)bd.push({w:verbTok,l:'Verb'+(third?'+s':'')});if(verbTok){var vi=tokens.indexOf(verbTok);if(tokens[vi+1])bd.push({w:tokens[vi+1],l:'Object'});}var score=issues.length===0?100:Math.max(40,100-issues.length*20);return{corrected:s,issues:issues,bd:bd,score:score};}
function checkSent(){var r=analyze(window._sbWord?window._sbWord.en:'eat',$('sb-in').value);if(!r)return;var html='<div class="sr" style="background:var(--p-light)"><span style="font-weight:700">Corrected</span><b>'+esc(r.corrected)+'</b></div>';r.bd.forEach(function(b){html+='<div class="sr"><b>'+esc(b.w)+'</b><span>'+esc(b.l)+'</span></div>';});if(r.issues.length)r.issues.forEach(function(i){html+='<div class="sr" style="border-color:var(--danger)"><span style="color:var(--danger)">'+esc(i)+'</span></div>';});html+='<div class="sr"><span>Score</span><b>'+r.score+'%</b></div>';$('sb-res').innerHTML=html;$('sb-res').classList.remove('hid');sfx(r.score>=70?'ok':'bad');if(r.score>=80)confetti();checkAch('sent1','Word Smith');sendVocab(window._sbWord.en,window._sbWord.id,'sentence',r.score+'%',r.score);}
function renderDict(){var q=($('dict-in').value||'').toLowerCase();var w=allWords().filter(function(v){return v.en.toLowerCase().indexOf(q)>=0||v.id.toLowerCase().indexOf(q)>=0;});$('dict-box').innerHTML='<table class="vocab"><thead><tr><th></th><th>English</th><th>Indonesian</th></tr></thead><tbody>'+w.slice(0,50).map(function(v){var bm=getBM().find(function(x){return x.en===v.en;});return '<tr><td><span class="material-icons-round ic'+(bm?' on':'')+'" onclick="bookmarkWord(\''+esc(v.en)+'\',\''+esc(v.id)+'\',\'vocabulary\',\'\')">'+(bm?'bookmark':'bookmark_border')+'</span></td><td>'+esc(v.en)+' <span class="material-icons-round ic" onclick="speakWord(\''+esc(v.en)+'\')">volume_up</span></td><td>'+esc(v.id)+'</td></tr>';}).join('')+'</tbody></table>';}
var flashList=[],flashI=0;
function initFlash(){flashList=shuffle(allWords());flashI=0;showFlash();}
function showFlash(){if(!flashList.length)return;var v=flashList[flashI%flashList.length];$('fl-f').textContent=v.en;$('fl-b').textContent=v.id;$('flc').classList.remove('flipped');$('fl-prog').textContent=(flashI+1)+'/'+flashList.length;}
function flipFlash(){$('flc').classList.toggle('flipped');sfx('click');}
function flashNext(){flashI++;showFlash();sfx('click');}
function flashPrev(){flashI=Math.max(0,flashI-1);showFlash();sfx('click');}
var memText='',memList=[];
function memInit(){if(!D)return;memList=[];(D.speaklive||{}).A.concat((D.speaklive||{}).B,(D.speaklive||{}).C).forEach(function(x){if(x&&x.text)memList.push(x.text);});Object.values(D.speaking||{}).forEach(function(u){Object.values(u.parts||{}).forEach(function(p){buildSent(p.transcript||'').forEach(function(l){if(l)memList.push(l);});});});var sel=$('mem-tmpl');if(memList.length){sel.innerHTML='<option value="">-- pilih template --</option>'+memList.slice(0,100).map(function(t,i){return '<option value="'+i+'">'+esc(t.substring(0,60))+(t.length>60?'...':'')+'</option>';}).join('');}else{sel.innerHTML='<option value="">(tidak ada template)</option>';}$('mem-txt').value='';$('mem-play').classList.add('hid');}
function memPickTmpl(){var i=$('mem-tmpl').value;if(i==='')return;$('mem-txt').value=memList[parseInt(i)]||'';}
function memStart(){memText=($('mem-txt').value||'').trim();if(!memText){showLocked('Isi teks atau pilih template dulu!');return;}$('mem-play').classList.remove('hid');$('mem-show').textContent=memText;$('mem-step2').classList.add('hid');$('mem-in').value='';$('mem-res').innerHTML='';}
function memSpeak(){speakWord(memText);}
function memStep2(){$('mem-show').style.filter='blur(8px)';$('mem-step2').classList.remove('hid');$('mem-in').focus();}
function memCheck(){var target=memText.toLowerCase().replace(/[^a-z0-9 ]/g,'').trim();var ans=($('mem-in').value||'').toLowerCase().replace(/[^a-z0-9 ]/g,'').trim();var tw=target.split(/\s+/),aw=ans.split(/\s+/);var set={};aw.forEach(function(w){set[w]=1;});var matched=tw.filter(function(w){return set[w];}).length;var acc=tw.length?Math.round(matched/tw.length*100):0;var html='<div class="sr" style="background:var(--p-light)"><span>Accuracy</span><b>'+acc+'%</b></div>';html+='<div style="margin-top:.5rem;line-height:1.8">';tw.forEach(function(w){var ok=set[w];html+=ok?'<span style="background:var(--p-light);color:var(--p3);padding:.1rem .3rem;border-radius:4px;font-weight:700">'+esc(w)+'</span> ':'<span style="background:#fee2e2;color:var(--danger);padding:.1rem .3rem;border-radius:4px;font-weight:700;text-decoration:line-through">'+esc(w)+'</span> ';});html+='</div>';$('mem-res').innerHTML=html;sfx(acc>=60?'ok':'bad');if(acc>=80)confetti();}
function memRestart(){$('mem-show').style.filter='';$('mem-step2').classList.add('hid');$('mem-in').value='';$('mem-res').innerHTML='';}
function getBM(){try{return JSON.parse(localStorage.getItem(LSK('bm'))||'[]');}catch(e){return[];}}
function bookmarkWord(en,id,cat,unit){var l=getBM();var i=-1;for(var j=0;j<l.length;j++){if(l[j].en===en){i=j;break;}}if(i>=0){l.splice(i,1);sendBookmark(en,id,'remove',cat||'vocabulary',unit||'');}else{l.push({en:en,id:id,cat:cat||'vocabulary',unit:unit||''});sfx('ok');sendBookmark(en,id,'add',cat||'vocabulary',unit||'');checkAch('bm1','Saver');if(l.length>=5)checkAch('bm5','Bookworm');if(l.length>=20)checkAch('bm20','Library');}localStorage.setItem(LSK('bm'),JSON.stringify(l));if(curScreen==='player')renderPlayer();if(curScreen==='dict')renderDict();}
function delBM(i){var l=getBM();sendBookmark(l[i].en,l[i].id,'remove',l[i].cat||'vocabulary',l[i].unit||'');l.splice(i,1);localStorage.setItem(LSK('bm'),JSON.stringify(l));}
function getNote(u,p){try{var a=JSON.parse(localStorage.getItem(LSK('notes'))||'{}');return a[u+'-'+p]?a[u+'-'+p].text:'';}catch(e){return'';}}
function getNotesAll(){var a={};try{a=JSON.parse(localStorage.getItem(LSK('notes'))||'{}');}catch(e){}return Object.entries(a).map(function(e){return{key:e[0],text:e[1].text||'',cat:e[1].cat||'vocabulary'};});}
function saveNote(){var a={};try{a=JSON.parse(localStorage.getItem(LSK('notes'))||'{}');}catch(e){}a[curUnit+'-'+curPart]={text:$('note-ta').value,cat:activeCat};localStorage.setItem(LSK('notes'),JSON.stringify(a));checkAch('note1','Note Taker');if(Object.keys(a).length>=10)checkAch('note10','Journal');sendNotes();}
function openMenu(){$('ov-menu').classList.add('on');}
function openGuide(){$('ov-guide').classList.add('on');}
function openReport(){$('ov-report').classList.add('on');}
function openLogout(){$('ov-logout').classList.add('on');}
function closeOv(id){$(id).classList.remove('on');}
function sendReport(){var m=$('rep-t').value.trim();if(!m)return;window.open('https://wa.me/'+CFG.WA+'?text='+encodeURIComponent('AEC Report: '+m),'_blank');closeOv('ov-report');$('rep-t').value='';}
async function forceRefresh(){try{await loadAll(true);showToastMsg('Data refreshed!');route();}catch(e){alert('Gagal refresh: '+e.message);}}
function showToastMsg(m){var t=document.createElement('div');t.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--p);color:#fff;padding:.6rem 1.2rem;border-radius:20px;font-weight:700;font-size:.82rem;z-index:99999;box-shadow:var(--sh3);';t.textContent=m;document.body.appendChild(t);setTimeout(function(){t.remove();},2000);}
function renderGuide(){var g=lang==='id'?[{i:'menu_book',t:'Learn: Vocabulary (units), Speaking, Grammar + Exercise'},{i:'quiz',t:'Practice: latihan vocab/speaking/grammar'},{i:'mic',t:'Speak: latihan bicara STT'},{i:'language',t:'Extra: English Tools, Games, Overview Siswa'},{i:'timer',t:'Focus Learn: tombol melayang, klik untuk fokus (fullscreen + kunci back)'},{i:'fullscreen',t:'Ketuk layar / tombol fullscreen'},{i:'person',t:'Klik nama = profil'}]:[{i:'menu_book',t:'Learn: Vocabulary (units), Speaking, Grammar + Exercise'},{i:'quiz',t:'Practice: vocab/speaking/grammar drills'},{i:'mic',t:'Speak: STT speaking practice'},{i:'language',t:'Extra: English Tools, Games, Student Overview'},{i:'timer',t:'Focus Learn: floating button, tap to focus (fullscreen + back lock)'},{i:'fullscreen',t:'Tap screen / fullscreen button'},{i:'person',t:'Tap name = profile'}];$('guide-list').innerHTML=g.map(function(x){return '<li style="display:flex;gap:.7rem;margin:.6rem 0;font-size:.84rem;align-items:flex-start"><span class="material-icons-round" style="color:var(--p);font-size:19px;flex-shrink:0">'+x.i+'</span><span>'+x.t+'</span></li>';}).join('');}
var obStep=0;
function openOnb(){obStep=0;showOB();$('ov-onb').classList.add('on');}
function showOB(){var steps=[{mi:'waving_hand',t:'Welcome to AEC!',d:'Your English learning platform'},{mi:'menu_book',t:'Learn',d:'Vocabulary, Speaking & Grammar + Exercise'},{mi:'quiz',t:'Practice',d:'Drill your skills'},{mi:'mic',t:'Speak Live',d:'STT speaking practice'},{mi:'timer',t:'Focus Learn',d:'Floating button, tap to focus (fullscreen + back lock)'},{mi:'emoji_events',t:'Earn Badges',d:'31 achievements'}];var s=steps[obStep];$('ob-body').innerHTML='<div class="tc" style="padding:1rem 0"><span class="material-icons-round" style="font-size:3.6rem;color:var(--p);display:block;margin-bottom:.7rem">'+s.mi+'</span><h3>'+s.t+'</h3><p class="tx-m">'+s.d+'</p></div>';$('ob-next').innerHTML=(obStep<steps.length-1?'Next <span class="material-icons-round">arrow_forward</span>':'<span class="material-icons-round">rocket_launch</span> Start');}
function obNext(){obStep++;if(obStep>=6){closeOv('ov-onb');localStorage.setItem(LSK('onb'),'1');return;}showOB();}
async function login(){
 var id=$('in-id').value.trim().toLowerCase(),pin=$('in-pin').value.trim(),err=$('login-err'),errL=$('login-err-load');
 err.classList.remove('on');errL.classList.remove('on');
 if(!id||!pin){$('login-err-msg').textContent='Isi ID dan PIN!';err.classList.add('on');return;}
 try{await loadAll();}catch(e){$('login-err-load-msg').textContent='Gagal memuat data: '+e.message;errL.classList.add('on');return;}
 var st=(D.students||[]).find(function(s){return s.id&&String(s.id).toLowerCase()===id&&String(s.pin)===pin;});
 if(!st){$('login-err-msg').textContent='ID atau PIN salah!';err.classList.add('on');sfx('bad');return;}
 if(st.active===false){$('login-err-msg').textContent='Akun tidak aktif. Hubungi admin.';err.classList.add('on');sfx('bad');return;}
 localStorage.setItem(LSK('aecSession'),JSON.stringify({id:st.id,name:st.name,class:st.class,loginTime:Date.now(),durationDays:D.settings.sessionDuration||10}));
 sendLog('Login','Berhasil login',{kategori:'-'});touchLoginStreak();refreshAv();
 if(!localStorage.getItem(LSK('onb')))openOnb();showDCBalloon();location.hash='#learn';route();
}
async function doLogout(){closeOv('ov-logout');localStorage.removeItem(LSK('aecSession'));location.href=location.pathname;}
function toggleTheme(){var h=document.documentElement;var isDark=h.getAttribute('data-theme')==='dark';if(isDark){h.setAttribute('data-theme','light');$('thi').textContent='dark_mode';localStorage.setItem('theme','light');}else{h.setAttribute('data-theme','dark');$('thi').textContent='light_mode';localStorage.setItem('theme','dark');}}
var lastY=0,tick=false;
$('app').addEventListener('scroll',function(){if(!tick){requestAnimationFrame(function(){var y=$('app').scrollTop;if(y>lastY&&y>60)$('hdr').classList.add('hide');else if(y<lastY)$('hdr').classList.remove('hide');lastY=y;tick=false;});tick=true;}},{passive:true});
var swX=0,swY=0;
$('app').addEventListener('touchstart',function(e){swX=e.touches[0].clientX;swY=e.touches[0].clientY;});
$('app').addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-swX,dy=e.changedTouches[0].clientY-swY;if(Math.abs(dx)>70&&Math.abs(dy)<40){var tabs=['learn','practice','sp','extra'];var i=tabs.indexOf(curScreen);if(dx<0&&i<tabs.length-1)go('#'+tabs[i+1]);else if(dx>0&&i>0)go('#'+tabs[i-1]);}});
function updateCountdown(){var s=sess();if(!s)return;var rem=(s.loginTime+s.durationDays*86400000)-Date.now();if(rem<=0){doLogout();return;}var d=Math.floor(rem/86400000),h=Math.floor((rem%86400000)/3600000);$('c-d').textContent=d>0?d+'d '+h+'h':h+'h';}
async function checkSession(){
 var sd=localStorage.getItem(LSK('aecSession'));
 loadAll().catch(function(e){ERR('preload gagal:',e.message);});
 if(!sd){setTimeout(function(){$('splash').classList.add('hide');},2600);showLogin();return;}
 try{
  var s=JSON.parse(sd);
  if(Date.now()-s.loginTime>s.durationDays*86400000){localStorage.removeItem(LSK('aecSession'));setTimeout(function(){$('splash').classList.add('hide');},2600);showLogin();return;}
  var cnEl=$('c-n');if(cnEl)cnEl.textContent=(s.name||'—');
  $('c-i').textContent=s.id.toUpperCase();updateCountdown();setInterval(updateCountdown,60000);touchLoginStreak();refreshAv();
  try{await loadAll();setTimeout(function(){$('splash').classList.add('hide');},2600);if(!localStorage.getItem(LSK('onb')))openOnb();showDCBalloon();route();}
  catch(e){setTimeout(function(){$('splash').classList.add('hide');},2600);route();}
 }catch(e){setTimeout(function(){$('splash').classList.add('hide');},2600);showLogin();}
}
function showLogin(){$('sc-login').classList.remove('hid');$('hdr').style.display='none';document.querySelector('.subhdr').style.display='none';$('bnav').classList.add('hid');$('fab-focus').classList.add('hid');}
/* ===== INIT ===== */
if(localStorage.getItem('theme')==='dark'){document.documentElement.setAttribute('data-theme','dark');$('thi').textContent='light_mode';}else{document.documentElement.setAttribute('data-theme','light');$('thi').textContent='dark_mode';}
if(TM){document.title='AEC TEST';}
applyLang();
updateTime();
setInterval(updateTime,1000);
setInterval(setGreet,60000);
updateOnlineCount();
setInterval(updateOnlineCount,30000);
flushQ();updatePomo();
setTimeout(function(){$('splash').classList.add('hide');},7000);
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',checkSession);}else{checkSession();}
                          window.__mv2Ready=true;
/* ===== ANTI-STUCK SPLASH (jalan di js.js eksternal) ===== */
window.__mv2Ready=true;
setTimeout(function(){
  var s=document.getElementById('splash');
  if(s && s.className.indexOf('hide')<0){
    s.className+=' hide';
  }
},8000);                          
/* ===== END js.js ===== */
