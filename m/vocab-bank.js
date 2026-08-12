/* =====================================================
   AEC Modular — vocab-bank.js v1.0
   Kata Sulit Saya (latihan dari bookmark)
   ===================================================== */
(function(){
  'use strict';
  var KEY = 'vocab-bank';

  function el(id){ return document.getElementById(id); }
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function todayStr(){ var d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
  function speakWord(w){ try{ var u=new SpeechSynthesisUtterance(w); u.lang='en-US'; speechSynthesis.speak(u);}catch(e){} }
  function confettiLocal(){
    var cols=['#10b981','#3b82f6','#f59e0b','#8b5cf6','#ef4444'];
    for(var i=0;i<30;i++){
      var c=document.createElement('div');
      c.style.cssText='position:fixed;top:-10px;width:10px;height:14px;border-radius:2px;z-index:99999;pointer-events:none;left:'+Math.random()*100+'vw;background:'+cols[i%cols.length]+';animation:fall '+(1.5+Math.random()*1.5)+'s linear forwards';
      document.body.appendChild(c);
      (function(cc){setTimeout(function(){cc.remove();},3500);})(c);
    }
  }
  function sfxLocal(t){
    try{
      var actx=window._aecModActx||new (window.AudioContext||window.webkitAudioContext)();
      window._aecModActx=actx;
      var o=actx.createOscillator(),g=actx.createGain();
      o.connect(g);g.connect(actx.destination);g.gain.value=.08;
      if(t==='ok'){o.frequency.value=880;o.type='sine';o.start();o.frequency.exponentialRampToValueAtTime(1320,actx.currentTime+.15);o.stop(actx.currentTime+.2);}
      else if(t==='bad'){o.frequency.value=200;o.type='square';o.start();o.stop(actx.currentTime+.15);}
    }catch(e){}
  }

  function getSess(){
    try{
      var up=new URLSearchParams(location.search);
      var TM=up.get('mode')==='test';
      return JSON.parse(localStorage.getItem((TM?'test_':'')+'aecSession')||'null');
    }catch(e){return null;}
  }

  function getBookmarks(){
    try{
      var up=new URLSearchParams(location.search);
      var TM=up.get('mode')==='test';
      return JSON.parse(localStorage.getItem((TM?'test_':'')+'bm')||'[]');
    }catch(e){return [];}
  }

  function sendPractice(fitur, sub, skor, durasi, detail){
    var s=getSess(); if(!s) return;
    var CFG=window.AEC_CONFIG||{LOG:''}; if(!CFG.LOG) return;
    fetch(CFG.LOG,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({
      target:'practice', id:s.id, nama:s.name, kelas:s.class,
      fitur:fitur, sub:sub, skor:skor, durasi:durasi, detail:detail
    })}).catch(function(){});
  }

  var _bank=[];
  var _currentIdx=0;
  var _score=0;
  var _total=0;

  function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}

  function renderEmpty(container){
    container.innerHTML =
      '<div style="text-align:center;padding:2rem;background:var(--sf);border-radius:var(--r);border:1px solid var(--bd)">' +
        '<span class="material-icons-round" style="font-size:3rem;color:var(--tx3);display:block;margin-bottom:.5rem">bookmark_border</span>' +
        '<h3 style="margin:.5rem 0">Belum ada kata sulit</h3>' +
        '<p class="tx-m" style="font-size:.86rem;max-width:300px;margin:0 auto">Bookmark kata-kata saat belajar di menu Learn. Kata yang di-bookmark akan muncul di sini untuk dilatih.</p>' +
        '<button class="btn" style="max-width:200px;margin:1rem auto 0" onclick="go(\'#learn\')"><span class="material-icons-round">arrow_forward</span> Mulai Belajar</button>' +
      '</div>';
  }

  function generateOptions(correct, pool){
    var opts=[correct.id];
    var others=pool.filter(function(w){return w.en!==correct.en;});
    shuffle(others);
    for(var i=0;i<others.length && opts.length<4;i++){
      if(opts.indexOf(others[i].id)<0) opts.push(others[i].id);
    }
    shuffle(opts);
    return opts;
  }

  function renderQuestion(container){
    if(_currentIdx>=_bank.length){
      renderFinish(container);
      return;
    }
    var w=_bank[_currentIdx];
    var opts=generateOptions(w, _bank);
    container.innerHTML =
      '<div class="bn"><h3><span class="material-icons-round" style="vertical-align:middle">bookmark</span> Kata Sulit</h3><div class="pills"><span class="pill">'+(_currentIdx+1)+'/'+_bank.length+'</span><span class="pill">Skor: '+_score+'</span></div></div>' +
      '<div style="background:var(--sf);border:1px solid var(--bd);border-radius:var(--r);padding:1.3rem;text-align:center;margin-bottom:.8rem;box-shadow:var(--sh2)">' +
        '<div style="font-size:.72rem;color:var(--tx2);font-weight:600;margin-bottom:.3rem">Arti dari:</div>' +
        '<div style="font-size:2rem;font-weight:800;color:var(--p);margin:.3rem 0">'+esc(w.en)+'</div>' +
        '<button class="btn gh" style="width:auto;margin:0 auto;padding:.4rem 1rem" onclick="window._bankSpeak()"><span class="material-icons-round" style="font-size:16px">volume_up</span> Dengar</button>' +
      '</div>' +
      '<div id="bank-opts">' +
        opts.map(function(o){
          return '<button class="opt-btn" style="width:100%;text-align:left;background:var(--sf2);border:2px solid var(--bd);border-radius:var(--r-sm);padding:.8rem;margin:.35rem 0;font-size:.95rem;font-weight:700;cursor:pointer" onclick="window._bankAnswer(this,\''+esc(o).replace(/'/g,"\\'")+'\')">'+esc(o)+'</button>';
        }).join('') +
      '</div>' +
      '<div style="display:flex;gap:.5rem;margin-top:.6rem">' +
        '<button class="btn gh" onclick="window._bankSkip()"><span class="material-icons-round">skip_next</span> Lewati</button>' +
        '<button class="btn gh" onclick="window._bankRemove()"><span class="material-icons-round">delete</span> Hapus dari Bank</button>' +
      '</div>';
  }

  function renderFinish(container){
    var pct=_total?Math.round(_score/_total*100):0;
    var emoji=pct>=80?'🏆':pct>=60?'🎉':pct>=40?'👍':'💪';
    container.innerHTML =
      '<div style="text-align:center;padding:2rem;background:var(--sf);border-radius:var(--r);border:1px solid var(--bd)">' +
        '<div style="font-size:3rem">'+emoji+'</div>' +
        '<h3 style="margin:.5rem 0">Selesai!</h3>' +
        '<div style="font-size:1.5rem;font-weight:800;color:var(--p)">'+_score+' / '+_total+'</div>' +
        '<div class="tx-m" style="margin:.3rem 0">'+pct+'% benar</div>' +
      '</div>' +
      '<div style="display:flex;gap:.5rem;margin-top:.8rem">' +
        '<button class="btn" onclick="window._bankRestart()"><span class="material-icons-round">refresh</span> Ulangi</button>' +
        '<button class="btn gh" onclick="go(\'#practice\')"><span class="material-icons-round">arrow_back</span> Kembali</button>' +
      '</div>';
    sendPractice('vocab-bank','session-complete',_score,0,_score+'/'+_total);
    if(pct>=70) confettiLocal();
  }

  window._bankAnswer=function(btn,val){
    var w=_bank[_currentIdx];
    var correct=(val===w.id);
    _total++;
    var btns=btn.parentElement.querySelectorAll('button');
    for(var i=0;i<btns.length;i++){
      btns[i].disabled=true;
      if(btns[i].textContent===w.id){
        btns[i].style.borderColor='var(--p)';
        btns[i].style.background='var(--p-light)';
      }else{
        btns[i].style.opacity='.4';
      }
    }
    if(correct){
      _score++;
      btn.style.borderColor='var(--p)';
      btn.style.background='var(--p-light)';
      sfxLocal('ok');
      sendPractice('vocab-bank','correct',10,0,w.en+'='+w.id);
    }else{
      btn.style.borderColor='var(--danger)';
      btn.style.background='rgba(239,68,68,.1)';
      sfxLocal('bad');
      sendPractice('vocab-bank','wrong',0,0,w.en+'='+w.id+'|jawab:'+val);
    }
    setTimeout(function(){
      _currentIdx++;
      renderQuestion(el('bank-body'));
    },800);
  };

  window._bankSkip=function(){
    sendPractice('vocab-bank','skip',0,0,_bank[_currentIdx].en);
    _currentIdx++;
    renderQuestion(el('bank-body'));
  };

  window._bankRemove=function(){
    var w=_bank[_currentIdx];
    // hapus dari localStorage bookmark
    try{
      var up=new URLSearchParams(location.search);
      var TM=up.get('mode')==='test';
      var key=(TM?'test_':'')+'bm';
      var bm=JSON.parse(localStorage.getItem(key)||'[]');
      var nb=bm.filter(function(b){return b.en!==w.en;});
      localStorage.setItem(key,JSON.stringify(nb));
      _bank=_bank.filter(function(x){return x.en!==w.en;});
      sendPractice('vocab-bank','remove',0,0,w.en);
      sfxLocal('ok');
    }catch(e){}
    renderQuestion(el('bank-body'));
  };

  window._bankSpeak=function(){
    speakWord(_bank[_currentIdx].en);
  };

  window._bankRestart=function(){
    _currentIdx=0;_score=0;_total=0;
    _bank=shuffle(_bank.slice());
    renderQuestion(el('bank-body'));
  };

  async function init(container){
    if(!container) return;
    var title=el('modular-title');
    if(title) title.textContent='Kata Sulit Saya';
    container.innerHTML='<div class="load-state"><span class="material-icons-round">sync</span>Memuat kata sulit...</div>';

    var bm=getBookmarks();
    if(!bm.length){ renderEmpty(container); return; }

    _bank=bm.map(function(b){return {en:b.en, id:b.arti||b.id||''};}).filter(function(w){return w.en;});
    _bank=shuffle(_bank);
    _currentIdx=0;_score=0;_total=0;

    container.innerHTML='<div id="bank-body"></div>';
    renderQuestion(el('bank-body'));
  }

  window.AEC_MOD=window.AEC_MOD||{};
  window.AEC_MOD[KEY]={init:init, name:'Kata Sulit Saya', version:'1.0'};
})();
