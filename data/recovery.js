/* ============ AEC RECOVERY — recovery.js ============
 * External module untuk recovery data siswa dari localStorage ke spreadsheet.
 * Load via jsDelivr: cdn.jsdelivr.net/gh/caksup/aec@main/data/recovery.js
 * 
 * Fitur:
 *  - recoverySync(force): kirim progress/ach/notes/bm/leaderboard ke sheet
 *  - manualSync(): tombol manual di menu ☰
 *  - Auto-inject tombol "Sync Progress" ke ov-menu
 *  - Auto-hook ke login() & checkSession() untuk auto-recovery
 * ============================================================ */
(function(){
  'use strict';
  
  var LOG_R = function(){ console.log.apply(console, ['[RECOVERY]'].concat(Array.prototype.slice.call(arguments))); };
  
  /* ===== 1. RECOVERY SYNC ===== */
  function recoverySync(force){
    if(typeof sess !== 'function' || typeof showToastMsg !== 'function'){
      console.warn('[RECOVERY] Dependencies belum siap, retry 1s...');
      setTimeout(function(){ recoverySync(force); }, 1000);
      return;
    }
    var s = sess();
    if(!s){ LOG_R('skip: belum login'); return; }
    
    var flag = (typeof LSK === 'function' ? LSK('recover_done') : 'recover_done');
    var today = (typeof todayStr === 'function') ? todayStr() : new Date().toISOString().slice(0,10);
    
    if(!force && localStorage.getItem(flag) === today){
      LOG_R('skip: sudah sync hari ini');
      return;
    }
    
    if(!CFG || !CFG.LOG){
      showToastMsg('⚠️ LOG kosong — cek config.js');
      return;
    }
    
    var count = 0;
    try {
      // 1) Progress parts done
      if(typeof getProg === 'function'){
        var pr = getProg();
        Object.keys(pr).forEach(function(key){
          if(pr[key] !== true) return;
          var parts = key.split('-');
          var part = parts.pop();
          var unit = parts.join('-');
          if(typeof sendProgress === 'function') sendProgress(unit, part, activeCat || 'vocabulary');
          count++;
        });
      }
      
      // 2) Achievements
      if(typeof getAch === 'function' && typeof ACH_LIST !== 'undefined'){
        getAch().forEach(function(id){
          var a = ACH_LIST.find(function(x){ return x.id === id; });
          if(typeof sendAch === 'function') sendAch(id, a ? a.name : id);
          count++;
        });
      }
      
      // 3) Notes
      if(typeof getNotesAll === 'function'){
        getNotesAll().forEach(function(n){
          var kp = n.key.split('-');
          var part = kp.pop();
          var unit = kp.join('-');
          if(typeof post === 'function'){
            post({target:'notes', id:s.id, nama:s.name, kelas:s.class, unit:unit, part:part, note:n.text});
          }
          count++;
        });
      }
      
      // 4) Bookmarks
      if(typeof getBM === 'function' && typeof sendBookmark === 'function'){
        getBM().forEach(function(b){
          sendBookmark(b.en, b.id, 'add', b.cat || 'vocabulary', b.unit || '');
          count++;
        });
      }
      
      // 5) Leaderboard
      if(typeof sendLeaderboard === 'function'){ sendLeaderboard(); count++; }
      
      // Flag done hari ini
      localStorage.setItem(flag, today);
      if(typeof flushQ === 'function') flushQ();
      
      showToastMsg('✅ Recovery: ' + count + ' data dikirim');
      LOG_R('sent', count, 'items for', s.id);
    } catch(e){
      console.error('[RECOVERY] error:', e);
      showToastMsg('❌ Recovery gagal: ' + e.message);
    }
  }
  
  function manualSync(){ recoverySync(true); }
  
  // Expose global
  window.recoverySync = recoverySync;
  window.manualSync = manualSync;
  
  /* ===== 2. INJECT TOMBOL SYNC KE MENU ☰ ===== */
  function injectSyncButton(){
    var menu = document.getElementById('ov-menu');
    if(!menu){ LOG_R('ov-menu belum ada, retry...'); setTimeout(injectSyncButton, 500); return; }
    
    // Hindari duplikat
    if(menu.querySelector('[data-recovery-sync]')){ LOG_R('button sudah ada'); return; }
    
    // Cari tombol pertama (Guide) dan sisipkan sebelumnya
    var firstBtn = menu.querySelector('.menu-item');
    if(!firstBtn){ LOG_R('tidak ada .menu-item'); return; }
    
    var btn = document.createElement('button');
    btn.className = 'menu-item';
    btn.setAttribute('data-recovery-sync', '1');
    btn.innerHTML = '<span class="material-icons-round">cloud_upload</span> Sync Progress ke Spreadsheet';
    btn.onclick = function(){
      if(typeof closeOv === 'function') closeOv('ov-menu');
      manualSync();
    };
    menu.insertBefore(btn, firstBtn);
    LOG_R('sync button injected');
  }
  
  /* ===== 3. HOOK KE LOGIN & CHECKSESSION ===== */
  function hookLogin(){
    if(typeof window.login !== 'function') return;
    var origLogin = window.login;
    window.login = async function(){
      var result = await origLogin.apply(this, arguments);
      // Delay sedikit biar session tersimpan
      setTimeout(function(){ recoverySync(false); }, 500);
      return result;
    };
    LOG_R('login() hooked');
  }
  
  function hookCheckSession(){
    if(typeof window.checkSession !== 'function') return;
    var origCheck = window.checkSession;
    window.checkSession = async function(){
      var result = await origCheck.apply(this, arguments);
      // Kalau sudah login, auto recovery
      setTimeout(function(){ recoverySync(false); }, 1500);
      return result;
    };
    LOG_R('checkSession() hooked');
  }
  
  /* ===== 4. INIT: tunggu dependencies siap ===== */
  function init(){
    // Tunggu sampai sess, CFG, dll ready
    var tries = 0;
    var wait = setInterval(function(){
      tries++;
      if(typeof sess === 'function' && typeof CFG !== 'undefined' && typeof showToastMsg === 'function'){
        clearInterval(wait);
        LOG_R('dependencies ready after', tries, 'tries');
        hookLogin();
        hookCheckSession();
        // Inject button saat DOM ready
        if(document.readyState === 'loading'){
          document.addEventListener('DOMContentLoaded', injectSyncButton);
        } else {
          setTimeout(injectSyncButton, 300);
        }
      } else if(tries > 50){
        clearInterval(wait);
        console.error('[RECOVERY] timeout waiting for dependencies');
      }
    }, 100);
  }
  
  // Start
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  LOG_R('module loaded');
})();
/* ============ END recovery.js ============ */
