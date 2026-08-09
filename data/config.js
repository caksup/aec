/* =====================================================
   AEC CONFIG — SOURCE OF TRUTH
   Semua halaman (admin, mv2, monitor) membaca file ini.
   ===================================================== */
window.AEC_CONFIG = {
  // Folder data GitHub (WAJIB berakhiran /)
  // Semua JSON: user, speaking, grammar, vocab, speaklive berada di sini
  GH: "https://raw.githubusercontent.com/caksup/aec/main/data/",

  // Apps Script (Spreadsheet) — LOG & RECORDS
  // URL ini didapat dari Apps Script → Deploy → New deployment → Web app
  LOG: "https://script.google.com/macros/s/AKfycbxfchEYkaaBlsdzXE8p7WJKkU3G3XPpYy3U7dhQrMBbwRteBcMEFHS3qcHlwaJO4gRoNQ/exec",

  // WhatsApp untuk laporan bug
  WA: "6285335913758",

  // Halaman embed (Blogspot)
  MINIGAME: "https://aec-id.blogspot.com/p/minigames.html",
  MCQ: "https://aec-id.blogspot.com/p/mcq.html"
};
