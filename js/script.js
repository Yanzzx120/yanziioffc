// Subscrbe YouTube Tamzidan Mahdiyin

function hamburg(){
    const navbar = document.querySelector(".dropdown")
    navbar.style.transform  = "translateY(0px)"
}
function cancel(){
    const navbar = document.querySelector(".dropdown")
    navbar.style.transform  = "translateY(-500px)"
}

// Animasi Menulis

const texts = [
    "DEVELOPER",
    "PROGRAMMER",
    "CREATOR"
]

let speed = 100;

const textElements = document.querySelector(".typewriter-text")

let textIndex = 0;
let charcterIndex = 0;

function typeWriter() {
    if(charcterIndex < texts[textIndex].length){
        textElements.innerHTML += texts[textIndex].charAt(charcterIndex);
        charcterIndex++;
        setTimeout(typeWriter, speed); 
    }
    else{
        setTimeout(eraseText, 1000)
    }
}

function eraseText() {
    if(textElements.innerHTML.length > 0){
        textElements.innerHTML = textElements.innerHTML.slice(0,-1)
        setTimeout(eraseText, 50)
    }
    else{
        textIndex = (textIndex + 1) % texts.length;
        charcterIndex = 0;
        setTimeout(typeWriter,500)
    }
  function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  
  // Cek apakah sidebar sedang terbuka
  const isOpen = sidebar.classList.contains('open');
  
  if (isOpen) {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  } else {
    sidebar.classList.add('open');
    // Hanya tampilkan overlay di tampilan mobile
    if (window.innerWidth < 768) {
      overlay.classList.add('active');
    }
  }
}

// Menjaga state sidebar saat layar berubah ukuran (resize)
window.addEventListener('resize', () => {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  
  if (window.innerWidth >= 768) {
    // Jika masuk mode desktop, pastikan sidebar terbuka dan overlay mati
    sidebar.classList.add('open');
    overlay.classList.remove('active');
  } else {
    // Jika masuk mode mobile, pastikan sidebar tertutup agar konten bisa diakses
    // (Kecuali jika memang sedang dibuka oleh user)
    if (!overlay.classList.contains('active')) {
      // Biarkan saja, user yang mengatur
    }
  }
});
}

window.onload = typeWriter;

// Subscrbe YouTube