/* =====================================================
   AEC Modular — vocab-duel.js v1.0
   Vocab Duel — Lawan AI cepat-cepatan
   ===================================================== */
(function(){
  'use strict';
  var KEY='vocab-duel';
  var TOTAL_ROUNDS=10;

  function el(id){return document.getElementById(id);}
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function speakWord(w){try{var u=new SpeechSynthesisUtterance(w);u.lang='en-US';speechSynthesis.speak(u);}catch(e){}}
  function sfxLocal(t){
    try{
      var actx=window._aecModActx||new (window.AudioContext||window.webkitAudioContext)();
      window._aecModActx=actx;
      var o=actx.createOscillator(),g=actx.createGain();
      o.connect(g);g.connect(actx.destination);g.gain.value=.08;
      if(t==='ok'){o.frequency.value=880;o.type='sine';o.start();o.frequency.exponentialRampToValueAtTime(1320,actx.currentTime+.15);o.stop(actx.currentTime+.2);}
      else if(t==='bad'){o.frequency.value=200;o.type='square';o.start();o.stop(actx.currentTime+.15);}
      else if(t==='go'){o.frequency.value=660;o.type='sine';o.start();o.frequency.exponentialRampToValueAtTime(880,actx.currentTime+.1);o.stop(actx.currentTime+.15);}
    }catch(e){}
  }
  function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}

  function getSess(){try{var up=new URLSearchParams(location.search);var TM=up.get('mode')==='test';return JSON.parse(localStorage.getItem((TM?'test_':'')+'aecSession')||'null');}catch(e){return null;}}

  function sendPractice(fitur,sub,skor,durasi,detail){
    var s=getSess();if(!s)return;
    var CFG=window.AEC_CONFIG||{LOG:''};if(!CFG.LOG)return;
    fetch(CFG.LOG,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({
      target:'practice',id:s.id,nama:s.name,kelas:s.class,
      fitur:fitur,sub:sub,skor:skor,durasi:durasi,detail:detail
    })}).catch(function(){});
  }

  var _words=[];
  var _round=0;
  var _playerScore=0;
  var _aiScore=0;
  var _startTime=0;
  var _aiTimer=null;
  var _locked=false;

  async function loadWords(){
    var CFG=window.AEC_CONFIG||{GH:''};
    try{
      var r=await fetch(CFG.GH+'vocab.json?t='+Date.now(),{cache:'no-store'});
      if(!r.ok) throw new Error('HTTP '+r.status);
      var vj=await r.json();
      var all=[];
      (vj.words||[]).forEach(function(w){if(w.en&&w.id)all.push({en:w.en,id:w.id});});
      Object.values(vj.materials||{}).forEach(function(u){
        Object.values(u.parts||{}).forEach(function(p){
          (p.vocab||[]).forEach(function(w){
            if(w.en&&w.id&&!all.find(function(x){return x.en===w.en;}))all.push({en:w.en,id:w.id});
          });
        });
      });
      return all.length>5?all:[{en:'apple',id:'apel'},{en:'book',id:'buku'},{en:'cat',id:'kucing'},{en:'dog',id:'anjing'},{en:'eat',id:'makan'},{en:'drink',id:'minum'}];
    }catch(e){return [{en:'apple',id:'apel'},{en:'book',id:'buku'},{en:'cat',id:'kucing'},{en:'dog',id:'anjing'}];}
  }

  function generateOptions(correct,pool){
    var opts=[correct.id];
    var others=pool.filter(function(w){return w.en!==correct.en;});
    shuffle(others);
    for(var i=0;i<others.length&&opts.length<4;i++){
      if(opts.indexOf(others[i].id)<0)opts.push(others[i].id);
    }
    shuffle(opts);
    return opts;
  }

  function renderScoreboard(container,word,opts){
    var progressPct=Math.round((_round/TOTAL_ROUNDS)*100);
    container.innerHTML=
      '<div class="bn"><h3><span class="material-icons-round" style="vertical-align:middle">bolt</span> Vocab Duel</h3><div class="pills"><span class="pill">Round '+(_round+1)+'/'+TOTAL_ROUNDS+'</span></div></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-bottom:.8rem">' +
        '<div style="background:var(--sf);border:2px solid var(--p);border-radius:var(--r);padding:.8rem;text-align:center">' +
          '<div style="font-size:.68rem;color:var(--p);font-weight:700;text-transform:uppercase">YOU</div>' +
          '<div style="font-size:1.8rem;font-weight:800;color:var(--p)">'+_playerScore+'</div>' +
        '</div>' +
        '<div style="background:var(--sf);border:2px solid var(--acc);border-radius:var(--r);padding:.8rem;text-align:center">' +
          '<div style="font-size:.68rem;color:var(--acc);font-weight:700;text-transform:uppercase">AI 🤖</div>' +
          '<div style="font-size:1.8rem;font-weight:800;color:var(--acc)">'+_aiScore+'</div>' +
        '</div>' +
      '</div>' +
      '<div style="background:var(--sf2);height:6px;border-radius:3px;overflow:hidden;margin-bottom:.8rem"><div style="background:var(--p);height:100%;width:'+progressPct+'%;border-radius:3px"></div></div>' +
      '<div style="background:var(--sf);border:1px solid var(--bd);border-radius:var(--r);padding:1.3rem;text-align:center;margin-bottom:.8rem;box-shadow:var(--sh2)">' +
        '<div style="font-size:.72rem;color:var(--tx2);font-weight:600;margin-bottom:.3rem">Cepat! Arti dari:</div>' +
        '<div style="font-size:2rem;font-weight:800;color:var(--p);margin:.3rem 0">'+esc(word.en)+'</div>' +
      '</div>' +
      '<div id="duel-opts">' +
        opts.map(function(o){
          return '<button class="opt-btn" style="width:100%;text-align:left;background:var(--sf2);border:2px solid var(--bd);border-radius:var(--r-sm);padding:.8rem;margin:.35rem 0;font-size:.95rem;font-weight:700;cursor:pointer" onclick="window._duelAnswer(this,\''+esc(o).replace(/'/g,"\\'")+'\')">'+esc(o)+'</button>';
        }).join('') +
      '</div>';
  }

  function renderRound(){
    if(_round>=TOTAL_ROUNDS){ renderResult(); return; }
    var container=el('duel-body');
    if(!container) return;
    var word=_words[_round%_words.length];
    var opts=generateOptions(word,_words);
    renderScoreboard(container,word,opts);

    _locked=false;
    _startTime=Date.now();

    // AI answers after random delay (1.5-3.5 seconds)
    var aiDelay=1500+Math.random()*2000;
    var aiCorrect=Math.random()<0.7; // AI 70% accurate
    if(_aiTimer) clearTimeout(_aiTimer);
    _aiTimer=setTimeout(function(){
      if(_locked) return;
      // AI menjawab
      if(aiCorrect){
        _aiScore++;
        sendPractice('vocab-duel','ai-correct',10,0,word.en);
      }else{
        sendPractice('vocab-duel','ai-wrong',0,0,word.en);
      }
      _locked=true;
      sfxLocal('go');
      // highlight jawaban benar
      var btns=container.querySelectorAll('#duel-opts button');
      btns.forEach(function(b){
        b.disabled=true;
        if(b.textContent===word.id){
          b.style.borderColor='var(--p)';
          b.style.background='var(--p-light)';
        }
      });
      // feedback: AI duluan jawab
      var fb=document.createElement('div');
      fb.style.cssText='text-align:center;padding:.6rem;margin-top:.6rem;background:#fee2e2;border-radius:var(--r-sm);color:var(--danger);font-weight:700;font-size:.86rem';
      fb.innerHTML='🤖 AI duluan jawab! '+(_aiCorrect?'Benar':'Salah');
      container.appendChild(fb);
      setTimeout(function(){
        _round++;
        renderRound();
      },1500);
    },aiDelay);
  }

  function renderResult(){
    if(_aiTimer) clearTimeout(_aiTimer);
    var container=el('duel-body');
    var win=_playerScore>_aiScore;
    var draw=_playerScore===_aiScore;
    var emoji=win?'🏆':draw?'🤝':'😔';
    var msg=win?'Kamu Menang!':draw?'Seri!':'AI Menang!';
    var sub=win?'Hebat! Kamu lebih cepat.':draw?'Coba lagi, kamu hampir menang.':'Latihan lagi ya!';
    container.innerHTML=
      '<div style="text-align:center;padding:2rem;background:var(--sf);border-radius:var(--r);border:1px solid var(--bd)">' +
        '<div style="font-size:4rem">'+emoji+'</div>' +
        '<h2 style="margin:.5rem 0">'+msg+'</h2>' +
        '<p class="tx-m">'+sub+'</p>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-top:1rem;max-width:300px;margin-left:auto;margin-right:auto">' +
          '<div style="background:var(--p-light);padding:.8rem;border-radius:var(--r-sm);text-align:center">' +
            '<div style="font-size:.7rem;color:var(--p);font-weight:700">YOU</div>' +
            '<div style="font-size:2rem;font-weight:800;color:var(--p)">'+_playerScore+'</div>' +
          '</div>' +
          '<div style="background:#fef3c7;padding:.8rem;border-radius:var(--r-sm);text-align:center">' +
            '<div style="font-size:.7rem;color:var(--acc);font-weight:700">AI</div>' +
            '<div style="font-size:2rem;font-weight:800;color:var(--acc)">'+_aiScore+'</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:.5rem;margin-top:.8rem">' +
        '<button class="btn" onclick="window._duelRestart()"><span class="material-icons-round">refresh</span> Duel Lagi</button>' +
        '<button class="btn gh" onclick="go(\'#practice\')"><span class="material-icons-round">arrow_back</span> Kembali</button>' +
      '</div>';
    sendPractice('vocab-duel','match-end',_playerScore,0,_playerScore+'-'+_aiScore);
    if(win){
      for(var i=0;i<30;i++){
        var c=document.createElement('div');
        c.style.cssText='position:fixed;top:-10px;width:10px;height:14px;border-radius:2px;z-index:99999;pointer-events:none;left:'+Math.random()*100+'vw;background:#10b981;animation:fall '+(1.5+Math.random()*1.5)+'s linear forwards';
        document.body.appendChild(c);
        (function(cc){setTimeout(function(){cc.remove();},3500);})(c);
      }
    }
  }

  window._duelAnswer=function(btn,val){
    if(_locked) return;
    _locked=true;
    if(_aiTimer) clearTimeout(_aiTimer);
    var word=_words[_round%_words.length];
    var correct=(val===word.id);
    var usedMs=Date.now()-_startTime;
    var btns=btn.parentElement.querySelectorAll('button');
    btns.forEach(function(b){
      b.disabled=true;
      if(b.textContent===word.id){
        b.style.borderColor='var(--p)';
        b.style.background='var(--p-light)';
      }
    });
    if(correct){
      _playerScore++;
      btn.style.borderColor='var(--p)';
      btn.style.background='var(--p-light)';
      sfxLocal('ok');
      sendPractice('vocab-duel','player-correct',Math.max(1,Math.round(20-usedMs/100)),usedMs,word.en);
    }else{
      btn.style.borderColor='var(--danger)';
      btn.style.background='rgba(239,68,68,.1)';
      sfxLocal('bad');
      sendPractice('vocab-duel','player-wrong',0,usedMs,word.en+'|jawab:'+val);
    }
    setTimeout(function(){
      _round++;
      renderRound();
    },900);
  };

  window._duelRestart=function(){
    _round=0;_playerScore=0;_aiScore=0;
    _words=shuffle(_words.slice());
    renderRound();
  };

  async function init(container){
    if(!container) return;
    var title=el('modular-title');
    if(title) title.textContent='Vocab Duel vs AI';
    container.innerHTML='<div class="load-state"><span class="material-icons-round">sync</span>Memuat arena duel...</div>';
    try{
      _words=shuffle(await loadWords());
      _round=0;_playerScore=0;_aiScore=0;
      container.innerHTML='<div id="duel-body"></div>';
      // intro
      el('duel-body').innerHTML=
        '<div style="text-align:center;padding:2rem;background:var(--sf);border-radius:var(--r);border:1px solid var(--bd)">' +
          '<div style="font-size:3rem">🤖⚡👤</div>' +
          '<h3 style="margin:.5rem 0">Siap Duel?</h3>' +
          '<p class="tx-m" style="max-width:300px;margin:.3rem auto">'+TOTAL_ROUNDS+' ronde. Jawab lebih cepat dari AI untuk menang!</p>' +
          '<button class="btn" style="max-width:200px;margin:1rem auto 0" onclick="window._duelStart()"><span class="material-icons-round">play_arrow</span> Mulai Duel</button>' +
        '</div>';
    }catch(e){
      container.innerHTML='<div class="err-state">Gagal load: '+esc(e.message)+'</div>';
    }
  }

  window._duelStart=function(){ renderRound(); };

  window.AEC_MOD=window.AEC_MOD||{};
  window.AEC_MOD[KEY]={init:init, name:'Vocab Duel', version:'1.0'};
})();
