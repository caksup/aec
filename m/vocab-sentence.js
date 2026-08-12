/* =====================================================
   AEC Modular — vocab-sentence.js v1.0
   Buat Kalimat Spontan pakai vocab
   ===================================================== */
(function(){
  'use strict';
  var KEY='vocab-sentence';

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
  var _current=null;
  var _startTime=0;
  var _total=0;
  var _score=0;

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
      return all.length>5?all:[{en:'eat',id:'makan'},{en:'drink',id:'minum'},{en:'read',id:'baca'},{en:'write',id:'tulis'},{en:'play',id:'main'}];
    }catch(e){return [{en:'eat',id:'makan'},{en:'book',id:'buku'},{en:'cat',id:'kucing'}];}
  }

  function evaluate(sentence, word){
    var s=String(sentence||'').trim();
    if(!s) return {score:0,issues:['Kalimat kosong'],ok:false};
    var issues=[];
    var low=s.toLowerCase();
    var wordLow=word.en.toLowerCase();

    // cek ada kata target?
    var wordRegex=new RegExp('\\b'+wordLow.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i');
    if(!wordRegex.test(low)){
      issues.push('Tidak mengandung kata "'+word.en+'"');
    }

    // cek minimal 3 kata
    var words=s.split(/\s+/).filter(function(w){return w.length>0;});
    if(words.length<3){
      issues.push('Minimal 3 kata (sekarang '+words.length+')');
    }

    // cek huruf pertama kapital
    if(s.charAt(0)!==s.charAt(0).toUpperCase()){
      issues.push('Mulai dengan huruf kapital');
    }

    // cek tanda baca akhir
    if(!/[.!?]$/.test(s)){
      issues.push('Akhiri dengan tanda baca (. ! ?)');
    }

    // cek panjang kalimat (bonus kalau >= 5 kata)
    var lengthBonus=words.length>=5?10:0;

    var baseScore=issues.length===0?70:Math.max(0,70-issues.length*20);
    var final=Math.min(100, baseScore+lengthBonus);
    return {score:final, issues:issues, ok:issues.length===0};
  }

  function renderChallenge(){
    var container=el('sentence-body');
    if(!container) return;
    _startTime=Date.now();
    container.innerHTML=
      '<div class="bn"><h3><span class="material-icons-round" style="vertical-align:middle">construction</span> Buat Kalimat</h3><div class="pills"><span class="pill">Soal '+(_total+1)+'</span><span class="pill">Skor: '+_score+'</span></div></div>' +
      '<div style="background:var(--sf);border:1px solid var(--bd);border-radius:var(--r);padding:1.3rem;text-align:center;margin-bottom:.8rem;box-shadow:var(--sh2)">' +
        '<div style="font-size:.72rem;color:var(--tx2);font-weight:600;margin-bottom:.3rem">Buat kalimat bahasa Inggris menggunakan kata:</div>' +
        '<div style="font-size:2rem;font-weight:800;color:var(--p);margin:.3rem 0">'+esc(_current.en)+'</div>' +
        '<div class="tx-m" style="font-size:.88rem">= '+esc(_current.id)+'</div>' +
        '<button class="btn gh" style="width:auto;margin:.5rem auto 0;padding:.4rem 1rem" onclick="window._sentSpeak()"><span class="material-icons-round" style="font-size:16px">volume_up</span> Dengar Kata</button>' +
      '</div>' +
      '<textarea id="sent-input" rows="3" placeholder="Contoh: I eat rice every morning." style="width:100%;padding:.8rem;border:2px solid var(--bd);border-radius:var(--r-sm);background:var(--sf);font-size:1rem;font-family:inherit;outline:none;resize:vertical"></textarea>' +
      '<div style="display:flex;gap:.5rem;margin-top:.6rem">' +
        '<button class="btn" onclick="window._sentCheck()"><span class="material-icons-round">check</span> Cek Kalimat</button>' +
        '<button class="btn gh" onclick="window._sentSkip()"><span class="material-icons-round">skip_next</span> Lewati</button>' +
      '</div>' +
      '<div id="sent-feedback" style="margin-top:.8rem"></div>';
    el('sent-input').focus();
  }

  function renderFeedback(result, sentence){
    var fb=el('sent-feedback');
    if(!fb) return;
    var emoji=result.ok?'🎉':result.score>=50?'👍':'💪';
    var color=result.ok?'var(--p-light)':result.score>=50?'#fef3c7':'#fee2e2';
    var html=
      '<div style="background:'+color+';padding:1rem;border-radius:var(--r);margin-bottom:.6rem">' +
        '<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.4rem">' +
          '<span style="font-size:1.5rem">'+emoji+'</span>' +
          '<b style="font-size:1.1rem">Skor: '+result.score+'%</b>' +
        '</div>' +
        (result.issues.length?
          '<div style="font-size:.82rem;font-weight:600;margin-bottom:.3rem">Perbaikan:</div>' +
          '<ul style="margin:0;padding-left:1.2rem;font-size:.8rem;line-height:1.6">' +
            result.issues.map(function(i){return '<li>'+esc(i)+'</li>';}).join('') +
          '</ul>'
        :'<div style="font-size:.86rem">Sempurna! Kalimatmu bagus.</div>') +
      '</div>' +
      '<button class="btn" onclick="window._sentNext()"><span class="material-icons-round">arrow_forward</span> Kata Berikutnya</button>';
    fb.innerHTML=html;
  }

  window._sentCheck=function(){
    var inp=el('sent-input');
    if(!inp) return;
    var sentence=inp.value;
    var result=evaluate(sentence, _current);
    var usedMs=Date.now()-_startTime;
    _total++;
    if(result.ok){
      _score+=result.score;
      sfxLocal('ok');
    }else{
      _score+=Math.round(result.score/2);
      sfxLocal('bad');
    }
    sendPractice('vocab-sentence','submit',result.score,Math.round(usedMs/1000),_current.en+'|'+sentence);
    renderFeedback(result, sentence);
    inp.disabled=true;
  };

  window._sentSkip=function(){
    _total++;
    sendPractice('vocab-sentence','skip',0,0,_current.en);
    nextWord();
  };

  window._sentNext=function(){ nextWord(); };
  window._sentSpeak=function(){ speakWord(_current.en); };

  function nextWord(){
    var idx=Math.floor(Math.random()*_words.length);
    _current=_words[idx];
    renderChallenge();
  }

  async function init(container){
    if(!container) return;
    var title=el('modular-title');
    if(title) title.textContent='Buat Kalimat';
    container.innerHTML='<div class="load-state"><span class="material-icons-round">sync</span>Memuat kata...</div>';
    try{
      _words=shuffle(await loadWords());
      _current=_words[0];
      _total=0;_score=0;
      container.innerHTML='<div id="sentence-body"></div>';
      // intro
      el('sentence-body').innerHTML=
        '<div style="text-align:center;padding:2rem;background:var(--sf);border-radius:var(--r);border:1px solid var(--bd)">' +
          '<div style="font-size:3rem">✍️</div>' +
          '<h3 style="margin:.5rem 0">Latihan Membuat Kalimat</h3>' +
          '<p class="tx-m" style="max-width:340px;margin:.3rem auto;font-size:.86rem">Kamu akan mendapat 1 kata. Buat kalimat bahasa Inggris yang mengandung kata itu. Semakin panjang & benar, semakin tinggi skornya!</p>' +
          '<div style="background:var(--sf2);padding:.7rem;border-radius:var(--r-sm);margin-top:.8rem;text-align:left;font-size:.78rem;max-width:340px;margin-left:auto;margin-right:auto">' +
            '<b style="color:var(--p)">Tips skor tinggi:</b>' +
            '<ul style="margin:.3rem 0 0;padding-left:1.2rem;line-height:1.6">' +
              '<li>Mulai dengan huruf kapital</li>' +
              '<li>Akhiri dengan tanda baca (. ! ?)</li>' +
              '<li>Minimal 3 kata (bonus 5+ kata)</li>' +
              '<li>Gunakan kata target dengan benar</li>' +
            '</ul>' +
          '</div>' +
          '<button class="btn" style="max-width:200px;margin:1rem auto 0" onclick="window._sentStart()"><span class="material-icons-round">play_arrow</span> Mulai</button>' +
        '</div>';
    }catch(e){
      container.innerHTML='<div class="err-state">Gagal load: '+esc(e.message)+'</div>';
    }
  }

  window._sentStart=function(){ nextWord(); };

  window.AEC_MOD=window.AEC_MOD||{};
  window.AEC_MOD[KEY]={init:init, name:'Buat Kalimat', version:'1.0'};
})();
