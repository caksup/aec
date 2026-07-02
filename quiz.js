import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getDatabase, ref, onValue, set, get } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyA3DQxHV4jtSrvSymQLZ_sNPgM4PwpvpN0",
    authDomain: "quiz-eng-multiplayer.firebaseapp.com",
    databaseURL: "https://quiz-eng-multiplayer-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "quiz-eng-multiplayer",
    storageBucket: "quiz-eng-multiplayer.firebasestorage.app",
    messagingSenderId: "573917472854",
    appId: "1:573917472854:web:e1f9f9371fb0c4295433f7"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// === AUDIO SETTINGS ===
let isSoundOn = false;
const bgMusic = new Audio('https://upload.wikimedia.org/wikipedia/commons/3/39/Monkeys_Spinning_Monkeys_by_Kevin_MacLeod.ogg');
bgMusic.loop = true; bgMusic.volume = 0.4;
const sfxBenar = new Audio('https://www.myinstants.com/media/sounds/correct.mp3'); 
const sfxSalah = new Audio('https://www.myinstants.com/media/sounds/wrong-answer-sound-effect.mp3'); 
const sfxTepukTangan = new Audio('https://www.myinstants.com/media/sounds/crowd-cheer.mp3'); 

window.toggleSound = function() {
    isSoundOn = !isSoundOn;
    const btn = document.getElementById('sound-toggle-btn');
    if(isSoundOn) { 
        btn.innerText = "🔊 SOUND ON"; btn.style.background = "#38a169"; btn.style.animation = "none";
        bgMusic.play().catch(e => console.log("Menunggu interaksi browser...")); 
    } else { 
        btn.innerText = "🔇 SOUND OFF"; btn.style.background = "#e53e3e"; bgMusic.pause(); 
    }
}

// === KUIS LOGIC ===
const urlParams = new URLSearchParams(window.location.search);
const namaSiswa = urlParams.get('nama'); const pinKuis = urlParams.get('pin');
if (!namaSiswa || !pinKuis) { alert("Akses ditolak!"); window.location.href = "index.html"; }

document.getElementById('player-name-display').innerText = namaSiswa;

let totalSkor = 0; let jawabanBenarSekarang = ""; let sudahMenjawab = false;
let dataSemuaSoal = []; let indeksSoalLokal = -1; let globalPlayersData = {};
let timerInterval; let waktuSisa = 20;

const playersRef = ref(db, 'sessions/' + pinKuis + '/players');
onValue(playersRef, (snapshot) => {
    if (snapshot.exists()) {
        globalPlayersData = snapshot.val();
        const listSiswa = Object.keys(globalPlayersData);
        document.getElementById('lobby-player-count').innerText = listSiswa.length;
        document.getElementById('lobby-player-list').innerHTML = listSiswa.map(nama => `<div class="player-chip">👤 ${nama}</div>`).join('');
        const sortedPlayers = listSiswa.map(nama => ({ nama: nama, skor: globalPlayersData[nama].skor || 0 })).sort((a, b) => b.skor - a.skor).slice(0, 5);
        const lbList = document.getElementById('live-leaderboard');
        if(lbList) {
            lbList.innerHTML = sortedPlayers.map((p, idx) => {
                let medali = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "🔹";
                return `<li><span>${medali} #${idx+1} ${p.nama}</span> <span style="color:#3182ce;">${p.skor} Pts</span></li>`;
            }).join('');
        }
    }
});

const sessionRef = ref(db, 'sessions/' + pinKuis);
onValue(sessionRef, async (snapshot) => {
    if (!snapshot.exists()) return;
    const dataSesi = snapshot.val();
    
    if (dataSesi.status === "playing") {
        document.getElementById('waiting-screen').style.display = 'none';
        document.getElementById('final-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';
        
        if (dataSemuaSoal.length === 0) {
            const soalSnapshot = await get(ref(db, 'questions'));
            if (soalSnapshot.exists()) dataSemuaSoal = Object.values(soalSnapshot.val());
        }
        if (indeksSoalLokal !== dataSesi.currentQuestion) {
            indeksSoalLokal = dataSesi.currentQuestion; tampilkanSoal(indeksSoalLokal);
        }
    } 
    else if (dataSesi.status === "finished") {
        clearInterval(timerInterval);
        document.getElementById('waiting-screen').style.display = 'none'; document.getElementById('game-screen').style.display = 'none';
        document.getElementById('final-screen').style.display = 'block';
        if(isSoundOn) { bgMusic.pause(); sfxTepukTangan.play().catch(e=>console.log(e)); }
        tampilkanPodiumAkhir();
    }
});

function tampilkanPodiumAkhir() {
    const listSiswa = Object.keys(globalPlayersData);
    const sortedPlayers = listSiswa.map(nama => ({ nama: nama, skor: globalPlayersData[nama].skor || 0 })).sort((a, b) => b.skor - a.skor);
    document.getElementById('final-leaderboard').innerHTML = sortedPlayers.map((p, idx) => {
        let medali = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "🏅";
        let kelasCSS = idx === 0 ? "juara-1" : idx === 1 ? "juara-2" : idx === 2 ? "juara-3" : "";
        return `<li class="${kelasCSS}"><span>${medali} #${idx+1} ${p.nama}</span> <span>${p.skor} Pts</span></li>`;
    }).join('');
}

function tampilkanSoal(index) {
    if (dataSemuaSoal.length === 0 || index >= dataSemuaSoal.length) return;
    resetPilihanTombol(); sudahMenjawab = false;
    const soal = dataSemuaSoal[index];
    document.getElementById('question-number').innerText = index + 1;
    document.getElementById('question-category').innerText = soal.kategori.toUpperCase(); 
    document.getElementById('question-text').innerText = soal.pertanyaan; 
    document.getElementById('text-a').innerText = soal.choices.a; document.getElementById('text-b').innerText = soal.choices.b; document.getElementById('text-c').innerText = soal.choices.c; document.getElementById('text-d').innerText = soal.choices.d;
    jawabanBenarSekarang = soal.jawaban_benar;

    clearInterval(timerInterval); waktuSisa = 20;
    document.getElementById('timer-angka').innerText = waktuSisa; document.getElementById('timer-bar').style.width = '100%';
    
    timerInterval = setInterval(() => {
        waktuSisa--; document.getElementById('timer-angka').innerText = waktuSisa; document.getElementById('timer-bar').style.width = (waktuSisa / 20 * 100) + '%';
        if(waktuSisa <= 0) {
            clearInterval(timerInterval);
            if(!sudahMenjawab) {
                sudahMenjawab = true; kunciSemuaTombol();
                if(isSoundOn) sfxSalah.play().catch(e=>console.log(e));
                document.getElementById('feedback-text').innerText = "⏰ YAH WAKTU HABIS!"; document.getElementById('feedback-text').style.color = "#e53e3e";
                document.getElementById('btn-' + jawabanBenarSekarang).classList.add('correct');
            }
        }
    }, 1000);
}

window.submitJawaban = async function(pilihan) {
    if (sudahMenjawab) return; 
    sudahMenjawab = true; kunciSemuaTombol(); clearInterval(timerInterval);

    const btnDipilih = document.getElementById('btn-' + pilihan); btnDipilih.classList.add('selected');
    const feedback = document.getElementById('feedback-text');

    if (pilihan === jawabanBenarSekarang) {
        if(isSoundOn) { sfxBenar.currentTime = 0; sfxBenar.play().catch(e=>console.log(e)); }
        btnDipilih.classList.add('correct');
        let poinDidapat = 100 + (waktuSisa * 5); 
        feedback.innerText = `🎉 BENAR! +${poinDidapat} Poin`; feedback.style.color = "#38a169";
        totalSkor += poinDidapat; document.getElementById('score-display').innerText = totalSkor;
        await set(ref(db, `sessions/${pinKuis}/players/${namaSiswa}/skor`), totalSkor);
    } else {
        if(isSoundOn) { sfxSalah.currentTime = 0; sfxSalah.play().catch(e=>console.log(e)); }
        btnDipilih.classList.add('wrong'); document.getElementById('btn-' + jawabanBenarSekarang).classList.add('correct');
        feedback.innerText = "❌ SALAH! Tetap semangat!"; feedback.style.color = "#e53e3e";
    }
}

function kunciSemuaTombol() { ['a', 'b', 'c', 'd'].forEach(ch => { document.getElementById('btn-' + ch).disabled = true; }); }
function resetPilihanTombol() {
    document.getElementById('feedback-text').innerText = "";
    ['a', 'b', 'c', 'd'].forEach(ch => { const btn = document.getElementById('btn-' + ch); btn.className = "choice-btn"; btn.disabled = false; });
}

