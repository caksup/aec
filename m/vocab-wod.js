/* =====================================================
   AEC Modular — vocab-wod.js v1.0
   Vocabulary Challenge of the Day
   1 kata acak per hari, dipaksa jawab cepat
   ===================================================== */
(function(){
  'use strict';

  var KEY = 'vocab-wod';
  var _words = null;
  var _currentWord = null;
  var _answered = false;
  var _timer = null;
  var _seconds = 10;
  var _todayKey = '';

  /* ===== Helpers (lokal, tidak ganggu global) ===== */
  function el(id){ return document.getElementById(id); }
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function todayStr(){ var d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
  function speakWord(w){
    try{
      var u=new SpeechSynthesisUtterance(w);
      u.lang='en-US';
      u.rate=0.9;
      speechSynthesis.speak(u);
    }catch(e){}
  }
  function confettiLocal(){
    var cols=['#10b981','#3b82f6','#f59e0b','#8b5cf6','#ef4444','#ec4899'];
    for(var i=0;i<40;i++){
      var c=document.createElement('div');
      c.style.cssText='position:fixed;top:-10px;width:10px;height:14px;border-radius:2px;z-index:99999;pointer-events:none;left:'+Math.random()*100+'vw;background:'+cols[i%cols.length]+';animation:fall '+(1.5+Math.random()*1.5)+'s linear forwards';
      document.body.appendChild(c);
      (function(cc){setTimeout(function(){cc.remove();},3500);})(c);
    }
  }
  function sfxLocal(t){
    try{
      var actx = window._aecModActx || new (window.AudioContext||window.webkitAudioContext)();
      window._aecModActx = actx;
      var o=actx.createOscillator(),g=actx.createGain();
      o.connect(g);g.connect(actx.destination);g.gain.value=.08;
      if(t==='ok'){o.frequency.value=880;o.type='sine';o.start();o.frequency.exponentialRampToValueAtTime(1320,actx.currentTime+.15);o.stop(actx.currentTime+.2);}
      else if(t==='bad'){o.frequency.value=200;o.type='square';o.start();o.stop(actx.currentTime+.15);}
      else if(t==='tick'){o.frequency.value=600;g.gain.value=.03;o.start();o.stop(actx.currentTime+.03);}
    }catch(e){}
  }

  /* ===== Ambil sesi siswa (pakai global dari js.js) ===== */
  function getSess(){
    try{
      var up=new URLSearchParams(location.search);
      var TM=up.get('mode')==='test';
      var key=(TM?'test_':'')+'aecSession';
      return JSON.parse(localStorage.getItem(key)||'null');
    }catch(e){return null;}
  }

  /* ===== Kirim ke PracticeStats ===== */
  function sendPractice(fitur, sub, skor, durasi, detail){
    var s = getSess();
    if(!s) return;
    var CFG = window.AEC_CONFIG || {LOG:''};
    if(!CFG.LOG) return;
    var body = {
      target:'practice',
      id:s.id, nama:s.name, kelas:s.class,
      fitur:fitur, sub:sub,
      skor:skor, durasi:durasi, detail:detail
    };
    fetch(CFG.LOG, {
      method:'POST', mode:'no-cors',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body: JSON.stringify(body)
    }).catch(function(){});
  }

  /* ===== Load vocab.json (cache 5 menit) ===== */
  async function loadWords(){
    if(_words) return _words;
    var CFG = window.AEC_CONFIG || {GH:''};
    try{
      var r = await fetch(CFG.GH+'vocab.json?t='+Date.now(), {cache:'no-store'});
      if(!r.ok) throw new Error('HTTP '+r.status);
      var vj = await r.json();
      var all = [];
      (vj.words||[]).forEach(function(w){
        if(w.en && w.id) all.push({en:w.en, id:w.id});
      });
      Object.values(vj.materials||{}).forEach(function(u){
        Object.values(u.parts||{}).forEach(function(p){
          (p.vocab||[]).forEach(function(w){
            if(w.en && w.id && !all.find(function(x){return x.en===w.en;})){
              all.push({en:w.en, id:w.id});
            }
          });
        });
      });
      if(all.length < 4){
        all = [
          {en:'apple',id:'apel'},{en:'book',id:'buku'},
          {en:'cat',id:'kucing'},{en:'dog',id:'anjing'},
          {en:'eat',id:'makan'},{en:'drink',id:'minum'},
          {en:'house',id:'rumah'},{en:'school',id:'sekolah'}
        ];
      }
      _words = all;
      return _words;
    }catch(e){
      _words = [{en:'apple',id:'apel'},{en:'book',id:'buku'},{en:'cat',id:'kucing'},{en:'dog',id:'anjing'}];
      return _words;
    }
  }

  /* ===== Pilih kata berdasarkan tanggal (konsisten per hari) ===== */
  function pickWordOfDay(words){
    var today = todayStr();
    var hash = 0;
    for(var i=0; i<today.length; i++){
      hash = ((hash<<5) - hash) + today.charCodeAt(i);
      hash |= 0;
    }
    var idx = Math.abs(hash) % words.length;
    return words[idx];
  }

  /* ===== Generate 4 opsi (1 benar + 3 dummy) ===== */
  function generateOptions(correct, words){
    var opts = [correct.id];
    var pool = words.slice();
    for(var i=pool.length-1; i>0; i--){
      var j = Math.floor(Math.random()*(i+1));
      var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    for(var k=0; k<pool.length && opts.length<4; k++){
      var v = pool[k].id;
      if(opts.indexOf(v)<0 && v!==correct.id) opts.push(v);
    }
    // shuffle opts
    for(var m=opts.length-1; m>0; m--){
      var n = Math.floor(Math.random()*(m+1));
      var tmp = opts[m]; opts[m] = opts[n]; opts[n] = tmp;
    }
    return opts;
  }

  /* ===== Render soal ===== */
  function renderQuestion(){
    var body = el('wod-body');
    if(!body) return;
    _answered = false;
    _seconds = 10;

    var opts = generateOptions(_currentWord, _words);

    body.innerHTML =
      '<div class="bn"><h3><span class="material-icons-round" style="vertical-align:middle">today</span> Challenge of the Day</h3><div class="pills"><span class="pill"><span class="material-icons-round" style="font-size:12px">timer</span> <span id="wod-timer">'+_seconds+'</span>s</span></div></div>' +
      '<div style="background:var(--sf);border:1px solid var(--bd);border-radius:var(--r);padding:1.3rem;text-align:center;margin-bottom:.8rem;box-shadow:var(--sh2)">' +
        '<div style="font-size:.72rem;color:var(--tx2);font-weight:600;margin-bottom:.3rem">Arti dari kata:</div>' +
        '<div style="font-size:2rem;font-weight:800;color:var(--p);margin:.3rem 0">'+esc(_currentWord.en)+'</div>' +
        '<button class="btn gh" style="width:auto;margin:0 auto;padding:.4rem 1rem" onclick="window._wodSpeak()"><span class="material-icons-round" style="font-size:16px">volume_up</span> Dengar</button>' +
      '</div>' +
      '<div id="wod-opts">' +
        opts.map(function(o){
          return '<button class="opt-btn" style="width:100%;text-align:left;background:var(--sf2);border:2px solid var(--bd);border-radius:var(--r-sm);padding:.8rem;margin:.35rem 0;font-size:.95rem;font-weight:700;cursor:pointer;transition:all .15s" onclick="window._wodAnswer(this,\''+esc(o).replace(/'/g,"\\'")+'\')">'+esc(o)+'</button>';
        }).join('') +
      '</div>' +
      '<button class="btn gh" style="margin-top:.7rem" onclick="window._wodSkip()"><span class="material-icons-round">refresh</span> Ganti Kata</button>';

    // timer
    if(_timer) clearInterval(_timer);
    _timer = setInterval(function(){
      _seconds--;
      var te = el('wod-timer');
      if(te) te.textContent = _seconds;
      if(_seconds <= 3) sfxLocal('tick');
      if(_seconds <= 0){
        clearInterval(_timer);
        if(!_answered) handleTimeout();
      }
    }, 1000);
  }

  /* ===== Timeout ===== */
  function handleTimeout(){
    _answered = true;
    var body = el('wod-body');
    if(!body) return;
    sendPractice('vocab-wod', 'timeout', 0, 10, _currentWord.en+'='+_currentWord.id);
    sfxLocal('bad');
    body.innerHTML =
      '<div style="text-align:center;padding:1.5rem;background:#fee2e2;border-radius:var(--r);margin-bottom:.8rem">' +
        '<div style="font-size:3rem">⏰</div>' +
        '<h3 style="margin:.5rem 0;color:var(--danger)">Waktu Habis!</h3>' +
        '<p style="font-size:.88rem">Jawaban yang benar:</p>' +
        '<div style="background:var(--p-light);padding:.8rem;border-radius:var(--r-sm);margin-top:.5rem"><b style="font-size:1.2rem;color:var(--p)">'+esc(_currentWord.en)+'</b> = <b>'+esc(_currentWord.id)+'</b></div>' +
      '</div>' +
      '<div style="display:flex;gap:.5rem">' +
        '<button class="btn" onclick="window._wodRetry()"><span class="material-icons-round">refresh</span> Coba Kata Ini</button>' +
        '<button class="btn gh" onclick="window._wodNext()"><span class="material-icons-round">arrow_forward</span> Kata Lain</button>' +
      '</div>';
  }

  /* ===== Handle jawaban ===== */
  function handleAnswer(btn, val){
    if(_answered) return;
    _answered = true;
    if(_timer) clearInterval(_timer);
    var usedTime = 10 - _seconds;
    var correct = (val === _currentWord.id);

    if(correct){
      btn.style.borderColor = 'var(--p)';
      btn.style.background = 'var(--p-light)';
      btn.style.color = 'var(--p3)';
      // tandai opsi lain disabled
      var others = btn.parentElement.querySelectorAll('button');
      for(var i=0;i<others.length;i++){
        if(others[i] !== btn) others[i].style.opacity = '.4';
      }
      var score = Math.max(1, 11 - usedTime); // makin cepat makin tinggi
      sendPractice('vocab-wod', 'correct', score, usedTime, _currentWord.en+'='+_currentWord.id);
      sfxLocal('ok');
      confettiLocal();

      var body = el('wod-body');
      setTimeout(function(){
        body.innerHTML =
          '<div style="text-align:center;padding:1.5rem;background:var(--p-light);border-radius:var(--r);margin-bottom:.8rem">' +
            '<div style="font-size:3rem">🎉</div>' +
            '<h3 style="margin:.5rem 0;color:var(--p)">Benar!</h3>' +
            '<div style="background:#fff;padding:.8rem;border-radius:var(--r-sm);margin-top:.5rem"><b style="font-size:1.2rem;color:var(--p)">'+esc(_currentWord.en)+'</b> = <b>'+esc(_currentWord.id)+'</b></div>' +
            '<div style="margin-top:.7rem;font-size:.82rem;color:var(--tx2)">'+esc(_currentWord.en)+' - '+esc(_currentWord.id)+'</div>' +
          '</div>' +
          '<div style="display:flex;gap:.5rem">' +
            '<button class="btn" onclick="window._wodHear()"><span class="material-icons-round">volume_up</span> Dengar Lagi</button>' +
            '<button class="btn gh" onclick="window._wodNext()"><span class="material-icons-round">arrow_forward</span> Kata Lain</button>' +
          '</div>';
        speakWord(_currentWord.en);
      }, 600);
    } else {
      btn.style.borderColor = 'var(--danger)';
      btn.style.background = 'rgba(239,68,68,.1)';
      sendPractice('vocab-wod', 'wrong', 0, usedTime, _currentWord.en+'='+_currentWord.id+'|jawab:'+val);
      sfxLocal('bad');
      // highlight yang benar
      var others = btn.parentElement.querySelectorAll('button');
      for(var j=0;j<others.length;j++){
        var txt = others[j].textContent;
        if(txt === _currentWord.id){
          others[j].style.borderColor = 'var(--p)';
          others[j].style.background = 'var(--p-light)';
        } else if(others[j] !== btn){
          others[j].style.opacity = '.4';
        }
      }
      var body = el('wod-body');
      setTimeout(function(){
        body.innerHTML =
          '<div style="text-align:center;padding:1.5rem;background:#fee2e2;border-radius:var(--r);margin-bottom:.8rem">' +
            '<div style="font-size:3rem">😕</div>' +
            '<h3 style="margin:.5rem 0;color:var(--danger)">Belum tepat</h3>' +
            '<p style="font-size:.88rem">Jawaban yang benar:</p>' +
            '<div style="background:var(--p-light);padding:.8rem;border-radius:var(--r-sm);margin-top:.5rem"><b style="font-size:1.2rem;color:var(--p)">'+esc(_currentWord.en)+'</b> = <b>'+esc(_currentWord.id)+'</b></div>' +
          '</div>' +
          '<div style="display:flex;gap:.5rem">' +
            '<button class="btn" onclick="window._wodRetry()"><span class="material-icons-round">refresh</span> Coba Lagi</button>' +
            '<button class="btn gh" onclick="window._wodNext()"><span class="material-icons-round">arrow_forward</span> Kata Lain</button>' +
          '</div>';
      }, 1200);
    }
  }

  /* ===== Skip / Next / Retry ===== */
  function handleSkip(){
    if(_timer) clearInterval(_timer);
    // pilih kata acak lain (bukan word of the day)
    var idx = Math.floor(Math.random()*_words.length);
    if(_words[idx].en === _currentWord.en) idx = (idx+1) % _words.length;
    _currentWord = _words[idx];
    renderQuestion();
  }
  function handleNext(){
    var idx = Math.floor(Math.random()*_words.length);
    if(_words[idx].en === _currentWord.en) idx = (idx+1) % _words.length;
    _currentWord = _words[idx];
    renderQuestion();
  }
  function handleRetry(){
    renderQuestion();
  }
  function handleHear(){
    speakWord(_currentWord.en);
  }

  /* ===== Expose global handlers ===== */
  window._wodAnswer = handleAnswer;
  window._wodSkip = handleSkip;
  window._wodNext = handleNext;
  window._wodRetry = handleRetry;
  window._wodHear = handleHear;
  window._wodSpeak = function(){ speakWord(_currentWord.en); };

  /* ===== INIT modul ===== */
  async function init(container){
    if(!container) return;
    container.innerHTML =
      '<div class="load-state"><span class="material-icons-round">sync</span>Memuat Challenge of the Day...</div>';

    // header title
    var title = el('modular-title');
    if(title) title.textContent = 'Challenge of the Day';

    try{
      var words = await loadWords();
      _currentWord = pickWordOfDay(words);
      // siapkan container
      container.innerHTML = '<div id="wod-body"></div>';
      renderQuestion();
    }catch(e){
      container.innerHTML =
        '<div class="err-state"><span class="material-icons-round">error_outline</span>Gagal memuat kata<code>'+esc(e.message)+'</code><button class="btn gh" style="margin-top:.6rem" onclick="location.reload()"><span class="material-icons-round">refresh</span> Coba Lagi</button></div>';
    }
  }

  /* ===== Register modul ===== */
  window.AEC_MOD = window.AEC_MOD || {};
  window.AEC_MOD[KEY] = {
    init: init,
    name: 'Challenge of the Day',
    version: '1.0'
  };

})();
