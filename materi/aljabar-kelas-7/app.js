// Register Service Worker untuk dukungan Offline PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker terdaftar!', reg.scope))
            .catch(err => console.log('Service Worker gagal:', err));
    });
}

// Sistem Management Progress Belajar Sederhana berbasis LocalStorage
document.addEventListener("DOMContentLoaded", () => {
    // Catat halaman materi yang dibaca otomatis
    const path = window.location.pathname;
    if(path.includes("konsep-1.html")) localStorage.setItem("materi_1", "true");
    if(path.includes("konsep-2.html")) localStorage.setItem("materi_2", "true");
    if(path.includes("latihan.html")) localStorage.setItem("materi_3", "true");
    if(path.includes("simulasi.html")) localStorage.setItem("materi_4", "true");

    // Hitung persentase progress untuk halaman index.html
    const progressFill = document.getElementById("progress-fill");
    const progressText = document.getElementById("progress-text");
    
    if(progressFill && progressText) {
        let itemsRead = 0;
        if(localStorage.getItem("materi_1")) itemsRead++;
        if(localStorage.getItem("materi_2")) itemsRead++;
        if(localStorage.getItem("materi_3")) itemsRead++;
        if(localStorage.getItem("materi_4")) itemsRead++;
        
        let percent = Math.round((itemsRead / 4) * 100);
        progressFill.style.width = percent + "%";
        progressText.innerText = `Progress Belajar: ${percent}%`;
    }
});