import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getDatabase, ref, set, onValue, push, get, update } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

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

let currentPin = ""; let nomorSoalAktif = 0; let dataSemuaSoal = []; 
let idSoalSedangDiedit = null; let globalPlayersData = {};
let cacheSemuaSoalFirebase = {}; 
let autoNextTimer; // Timer untuk auto pindah soal

// ================= FUNGSI UI GLOBAL =================
window.switchTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if(tabId === 'live-quiz') document.getElementById('tab-live-btn').classList.add('active');
    if(tabId === 'buat-soal') document.getElementById('tab-soal-btn').classList.add('active');
    if(tabId === 'bank-soal') document.getElementById('tab-bank-btn').classList.add('active');
    if(tabId === 'riwayat-kuis') document.getElementById('tab-riwayat-btn').classList.add('active');
    if(tabId === 'riwayat-pemain') document.getElementById('tab-pemain-btn').classList.add('active');
}

window.salinTeks = function(elementId) {
    const teks = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(teks);
    alert("✅ PIN berhasil disalin: " + teks);
}

window.togglePodium = function(pin) {
    const el = document.getElementById('podium-' + pin);
    if(el.style.display === 'none') { el.style.display = 'block'; } else { el.style.display = 'none'; }
}

function formatTanggal(ms) {
    if(!ms) return "-";
    const d = new Date(ms);
    const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][d.getDay()];
    const bln = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][d.getMonth()];
    const jam = d.getHours().toString().padStart(2, '0');
    const mnt = d.getMinutes().toString().padStart(2, '0');
    return `${hari}, ${d.getDate()} ${bln} ${d.getFullYear()} - ${jam}:${mnt} WIB`;
}

function generateRandomPIN() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; let res = '';
    for (let i = 0; i < 6; i++) { res += chars.charAt(Math.floor(Math.random() * chars.length)); }
    return res;
}

// ================= LOGIC MENTOR (KUIS AUTO-PILOT) =================
document.getElementById('create-session-btn').addEventListener('click', async () => {
    currentPin = generateRandomPIN();
    document.getElementById('pin-text').innerText = currentPin;
    document.getElementById('lobby-pin-text').innerText = currentPin;
    document.getElementById('active-pin-text').innerText = currentPin;
    try {
        await set(ref(db, 'sessions/' + currentPin), { status: "waiting", currentQuestion: 0, timestamp: Date.now() });
        document.getElementById('lobby-section').style.display = 'block';
        document.getElementById('setup-section').style.display = 'none';
        listenToPlayers(currentPin);
    } catch (error) { alert("Gagal: " + error.message); }
});

function listenToPlayers(pin) {
    const playersRef = ref(db, 'sessions/' + pin + '/players');
    onValue(playersRef, (snapshot) => {
        const playerListUl = document.getElementById('player-list');
        const leaderboardListUl = document.getElementById('leaderboard-list');
        const playerCountSpan = document.getElementById('player-count');
        const startBtn = document.getElementById('start-quiz-btn');
        
        playerListUl.innerHTML = ""; leaderboardListUl.innerHTML = "";
        if (snapshot.exists()) {
            globalPlayersData = snapshot.val();
            const listSiswa = Object.keys(globalPlayersData).map(nama => ({ nama: nama, skor: globalPlayersData[nama].skor || 0 }));
            playerCountSpan.innerText = listSiswa.length;

            listSiswa.forEach(siswa => { playerListUl.innerHTML += `<li><span>👤 ${siswa.nama}</span> <span class="status-badge">Ready</span></li>`; });
            listSiswa.sort((a, b) => b.skor - a.skor);
            listSiswa.forEach((siswa, index) => { leaderboardListUl.innerHTML += `<li><span>🥇 #${index+1} ${siswa.nama}</span> <span class="score-badge">${siswa.skor} Pts</span></li>`; });

            if (listSiswa.length > 0) startBtn.disabled = false;
        } else { playerCountSpan.innerText = "0"; startBtn.disabled = true; }
    });
}

document.getElementById('start-quiz-btn').addEventListener('click', async () => {
    if (!currentPin) return;
    const soalSnapshot = await get(ref(db, 'questions'));
    if (!soalSnapshot.exists() || Object.keys(soalSnapshot.val()).length === 0) { alert("⚠️ Bank Soal kosong!"); return; }
    dataSemuaSoal = Object.values(soalSnapshot.val());
    nomorSoalAktif = 0;
    try {
        await update(ref(db, 'sessions/' + currentPin), { status: "playing", currentQuestion: 0 });
        document.getElementById('lobby-section').style.display = 'none';
        document.getElementById('control-section').style.display = 'block';
        tampilkanInfoSoalAktif();
    } catch (error) { alert("Gagal: " + error.message); }
});

function tampilkanInfoSoalAktif() {
    clearTimeout(autoNextTimer); // Reset timer tiap ganti soal

    if(nomorSoalAktif >= dataSemuaSoal.length) {
        document.getElementById('active-question-display').innerText = "🏁 Kuis Selesai! Sedang merekap skor...";
        return;
    }
    
    const soal = dataSemuaSoal[nomorSoalAktif];
    document.getElementById('active-question-display').innerText = `Soal No. ${nomorSoalAktif + 1} [${soal.kategori.toUpperCase()}] \n ${soal.pertanyaan} \n (Jawaban Kunci: ${soal.jawaban_benar.toUpperCase()})`;

    // AUTO NEXT: Ganti soal otomatis setelah 21 detik
    autoNextTimer = setTimeout(() => {
        autoLanjutSoal();
    }, 21000); 
}

async function autoLanjutSoal() {
    if (nomorSoalAktif < dataSemuaSoal.length - 1) {
        nomorSoalAktif++;
        await set(ref(db, `sessions/${currentPin}/currentQuestion`), nomorSoalAktif);
        tampilkanInfoSoalAktif();
    } else {
        // Otomatis akhiri sesi jika soal habis
        await set(ref(db, `sessions/${currentPin}/status`), "finished");
        document.getElementById('control-section').style.display = 'none';
        document.getElementById('final-section').style.display = 'block';
        renderPodiumUtama();
    }
}

document.getElementById('end-quiz-btn').addEventListener('click', async () => {
    if (confirm("Akhiri kuis sekarang?")) {
        clearTimeout(autoNextTimer); // Matikan auto-timer
        await set(ref(db, `sessions/${currentPin}/status`), "finished");
        document.getElementById('control-section').style.display = 'none';
        document.getElementById('final-section').style.display = 'block';
        renderPodiumUtama();
    }
});

function renderPodiumUtama() {
    const listSiswa = Object.keys(globalPlayersData);
    const sortedPlayers = listSiswa.map(nama => ({ nama: nama, skor: globalPlayersData[nama].skor || 0 })).sort((a, b) => b.skor - a.skor);
    document.getElementById('final-leaderboard').innerHTML = sortedPlayers.map((p, idx) => {
        let medali = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "🏅";
        let kelasCSS = idx === 0 ? "juara-1" : idx === 1 ? "juara-2" : idx === 2 ? "juara-3" : "";
        return `<li class="${kelasCSS}"><span>${medali} #${idx+1} ${p.nama}</span> <span>${p.skor} Pts</span></li>`;
    }).join('');
}

// ================= RIWAYAT SESI & GLOBAL PEMAIN =================
onValue(ref(db, 'sessions'), (snapshot) => {
    const listAktif = document.getElementById('riwayat-aktif-list');
    const listSelesai = document.getElementById('riwayat-selesai-list');
    const listGlobal = document.getElementById('global-player-list');
    
    listAktif.innerHTML = ""; listSelesai.innerHTML = ""; listGlobal.innerHTML = "";
    let rekapPemain = {}; 

    if (snapshot.exists()) {
        const sessionsData = snapshot.val();
        const sessionsArray = Object.keys(sessionsData).map(pin => {
            return { pin: pin, ...sessionsData[pin] };
        }).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        sessionsArray.forEach(sesi => {
            const statusText = sesi.status === 'waiting' ? "Di Ruang Tunggu" : sesi.status === 'playing' ? "Sedang Bermain" : "Selesai";
            const colorStatus = sesi.status === 'waiting' ? "#ecc94b" : sesi.status === 'playing' ? "#3182ce" : "#38a169";
            
            if (sesi.status === 'waiting' || sesi.status === 'playing') {
                listAktif.innerHTML += `
                    <li class="riwayat-item">
                        <div><strong>PIN: ${sesi.pin}</strong> <span style="color:${colorStatus}; font-size:12px; margin-left:5px;">(${statusText})</span>
                        <div style="font-size:12px; color:#718096; margin-top:5px;">📅 ${formatTanggal(sesi.timestamp)}</div></div>
                        <button onclick="lanjutkanSesi('${sesi.pin}', '${sesi.status}', ${sesi.currentQuestion || 0})" class="btn-success btn-small">Lanjutkan 🔄</button>
                    </li>`;
            } else if (sesi.status === 'finished') {
                let podiumHTML = "";
                if(sesi.players) {
                    const players = Object.keys(sesi.players).map(n => ({ nama: n, skor: sesi.players[n].skor || 0 })).sort((a,b) => b.skor - a.skor);
                    podiumHTML = `<ul class="podium-list" style="margin-top:10px;">` + players.map((p, idx) => {
                        let medali = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "🏅";
                        let kls = idx === 0 ? "juara-1" : idx === 1 ? "juara-2" : idx === 2 ? "juara-3" : "";
                        return `<li class="${kls}"><span>${medali} ${p.nama}</span> <span>${p.skor} Pts</span></li>`;
                    }).join('') + `</ul>`;
                } else { podiumHTML = "<p style='font-size:12px; color:#718096;'>Tidak ada peserta.</p>"; }

                listSelesai.innerHTML += `
                    <li class="riwayat-item">
                        <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                            <div><strong>PIN: ${sesi.pin}</strong><br><span style="font-size:12px; color:#718096;">📅 ${formatTanggal(sesi.timestamp)}</span></div>
                            <button onclick="togglePodium('${sesi.pin}')" class="btn-primary btn-small">Lihat Podium 🏆</button>
                        </div>
                        <div id="podium-${sesi.pin}" style="display:none; width:100%; border-top:1px solid #e2e8f0; padding-top:10px; margin-top:10px;">${podiumHTML}</div>
                    </li>`;
            }

            if (sesi.players) {
                Object.keys(sesi.players).forEach(namaPemain => {
                    let skorSesi = sesi.players[namaPemain].skor || 0;
                    if(!rekapPemain[namaPemain]) rekapPemain[namaPemain] = { totalSkor: 0, kuisIkut: 0 };
                    rekapPemain[namaPemain].totalSkor += skorSesi;
                    rekapPemain[namaPemain].kuisIkut += 1;
                });
            }
        });

        if(listAktif.innerHTML === "") listAktif.innerHTML = "<p style='font-size:13px; color:#718096;'>Tidak ada kuis aktif.</p>";
        if(listSelesai.innerHTML === "") listSelesai.innerHTML = "<p style='font-size:13px; color:#718096;'>Belum ada riwayat selesai.</p>";

        const sortedGlobal = Object.keys(rekapPemain).map(nama => { return { nama: nama, ...rekapPemain[nama] }; }).sort((a, b) => b.totalSkor - a.totalSkor);
        if(sortedGlobal.length > 0) {
            sortedGlobal.forEach((p, idx) => {
                let medali = idx === 0 ? "👑" : idx === 1 ? "🌟" : idx === 2 ? "⭐" : "👤";
                listGlobal.innerHTML += `
                    <li class="riwayat-item" style="display:flex; justify-content:space-between; align-items:center;">
                        <div><strong style="font-size:16px;">${medali} ${p.nama}</strong><br><span style="font-size:12px; color:#718096;">Ikut ${p.kuisIkut} Sesi</span></div>
                        <div style="text-align:right;"><span style="color:#3182ce; font-weight:bold; font-size:18px;">${p.totalSkor}</span><br><span style="font-size:11px; color:#718096; font-weight:bold;">Total Poin</span></div>
                    </li>`;
            });
        } else { listGlobal.innerHTML = "<p style='font-size:13px; color:#718096;'>Belum ada data pemain.</p>"; }
    }
});

// RESUME SESI 
window.lanjutkanSesi = async function(pin, status, savedQuestion) {
    currentPin = pin; nomorSoalAktif = savedQuestion; window.switchTab('live-quiz');
    document.getElementById('setup-section').style.display = 'none'; document.getElementById('final-section').style.display = 'none';
    if (status === 'waiting') {
        document.getElementById('lobby-section').style.display = 'block'; document.getElementById('lobby-pin-text').innerText = pin; listenToPlayers(pin);
    } else if (status === 'playing') {
        document.getElementById('control-section').style.display = 'block'; document.getElementById('active-pin-text').innerText = pin;
        const soalSnapshot = await get(ref(db, 'questions'));
        if (soalSnapshot.exists()) { dataSemuaSoal = Object.values(soalSnapshot.val()); tampilkanInfoSoalAktif(); }
        listenToPlayers(pin);
    }
};

// ================= LOGIC BANK SOAL & FILTER =================
document.getElementById('soal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('save-soal-btn'); saveBtn.innerText = "MENYIMPAN..."; saveBtn.disabled = true;
    const dataSoal = {
        kategori: document.getElementById('soal-kategori').value, pertanyaan: document.getElementById('soal-teks').value,
        choices: { a: document.getElementById('soal-a').value, b: document.getElementById('soal-b').value, c: document.getElementById('soal-c').value, d: document.getElementById('soal-d').value },
        jawaban_benar: document.getElementById('soal-benar').value
    };
    try {
        if (idSoalSedangDiedit) { await set(ref(db, 'questions/' + idSoalSedangDiedit), dataSoal); alert("🎉 Soal berhasil diperbarui!"); idSoalSedangDiedit = null; document.getElementById('form-title').innerText = "Tambah Soal Baru"; window.switchTab('bank-soal'); } 
        else { await push(ref(db, 'questions'), dataSoal); alert("🎉 Soal berhasil disimpan!"); }
        document.getElementById('soal-form').reset();
    } catch (error) { alert("Gagal: " + error.message); } finally { if(!idSoalSedangDiedit) saveBtn.innerText = "SIMPAN KE BANK SOAL"; saveBtn.disabled = false; }
});

onValue(ref(db, 'questions'), (snapshot) => {
    if (snapshot.exists()) { cacheSemuaSoalFirebase = snapshot.val(); } 
    else { cacheSemuaSoalFirebase = {}; }
    tampilkanListBankSoal(); 
});

document.getElementById('filter-kategori').addEventListener('change', () => { tampilkanListBankSoal(); });

function tampilkanListBankSoal() {
    const listUl = document.getElementById('bank-soal-list'); listUl.innerHTML = "";
    const filterTerpilih = document.getElementById('filter-kategori').value;
    const kunciSoal = Object.keys(cacheSemuaSoalFirebase);
    let ditemukanSoal = false;

    kunciSoal.forEach((id) => {
        const soal = cacheSemuaSoalFirebase[id];
        if (filterTerpilih !== "semua" && soal.kategori !== filterTerpilih) return; 

        ditemukanSoal = true;
        listUl.innerHTML += `<li class="soal-item"><strong>[${soal.kategori.toUpperCase()}]</strong> ${soal.pertanyaan}
            <div style="font-size:13px; color:#718096; margin:6px 0;">A: ${soal.choices.a} | B: ${soal.choices.b}<br>C: ${soal.choices.c} | D: ${soal.choices.d}<br><span style="color:#38a169; font-weight:bold;">Kunci: ${soal.jawaban_benar.toUpperCase()}</span></div>
            <div class="flex-actions"><button class="btn-small btn-warning" onclick="aksiEditSoal('${id}')">✏️ Edit</button><button class="btn-small btn-danger" onclick="aksiHapusSoal('${id}')">🗑️ Hapus</button></div></li>`;
    });
    if (!ditemukanSoal) listUl.innerHTML = `<p style='text-align:center; color:#718096; font-size:14px; padding:20px 0;'>Tidak ada soal dalam kategori ini.</p>`;
}

window.aksiEditSoal = async function(id) {
    idSoalSedangDiedit = id;
    try {
        const snapshot = await get(ref(db, 'questions/' + id));
        if (snapshot.exists()) {
            const soal = snapshot.val();
            document.getElementById('soal-kategori').value = soal.kategori; document.getElementById('soal-teks').value = soal.pertanyaan;
            document.getElementById('soal-a').value = soal.choices.a; document.getElementById('soal-b').value = soal.choices.b; document.getElementById('soal-c').value = soal.choices.c; document.getElementById('soal-d').value = soal.choices.d; document.getElementById('soal-benar').value = soal.jawaban_benar;
            document.getElementById('form-title').innerText = "Edit Soal"; document.getElementById('save-soal-btn').innerText = "UPDATE SOAL"; window.switchTab('buat-soal');
        }
    } catch (error) { alert(error.message); }
};

window.aksiHapusSoal = async function(id) {
    if (confirm("Apakah Anda yakin ingin menghapus soal ini dari Bank Soal?")) { try { await set(ref(db, 'questions/' + id), null); } catch (error) { alert(error.message); } }
};
