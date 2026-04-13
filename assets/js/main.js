const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const hiScoreDisplay = document.getElementById('hi-score');
const healthBar = document.getElementById('health-bar');
const levelDisplay = document.getElementById('level-display');
const uiOverlay = document.getElementById('ui-overlay');
const menuMusic = document.getElementById('menuMusic');

canvas.width = 900;
canvas.height = 500;

let isTouch = false, score = 0, health = 100, gameActive = false, currentLevel = 1, currentHero = '';
let obstacles = [], lasers = [], keys = {};
let player = { x: 70, y: 220, w: 85, h: 55, speed: 8 };
let targetY = 220; // Punto hacia donde el héroe se desliza
let mouse = { x: 450, y: 250 }; // Solo para apuntar y el cursor visual
let damageFlash = 0;

const assets = { bg: new Image(), hero: new Image(), obs: new Image(), ptr: new Image() };
const sounds = { superman: new Audio('assets/audio/audio1.mp3'), batman: new Audio('assets/audio/audio2.mp3') };
sounds.superman.loop = sounds.batman.loop = true;

// Hi-Score
let hiScore = localStorage.getItem('dcHiScore') || 0;
hiScoreDisplay.innerText = hiScore;

// Audio del Menú
const startAudio = () => { if(menuMusic.paused && !gameActive) menuMusic.play().catch(()=>{}); };
document.addEventListener('click', startAudio);
document.addEventListener('touchstart', startAudio);

// Manejo de entrada (Mouse y Touch)
function updateInput(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    mouse.x = (clientX - rect.left) * (canvas.width / rect.width);
    mouse.y = (clientY - rect.top) * (canvas.height / rect.height);
    
    // Si es touch o mueves el mouse, actualizamos el destino Y del héroe
    targetY = mouse.y - player.h / 2;
}

window.addEventListener('mousemove', e => { if(!isTouch) updateInput(e); });
window.addEventListener('touchstart', e => { isTouch = true; updateInput(e); }, {passive: false});
window.addEventListener('touchmove', e => { updateInput(e); e.preventDefault(); }, {passive: false});
window.addEventListener('mousedown', () => { if(gameActive && !isTouch) fireLaser(); });

// Teclado
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

function initGame(hero) {
    menuMusic.pause();
    currentHero = hero;
    assets.bg.src = hero === 'superman' ? 'assets/img/bg.jpg' : 'assets/img/bg2.jpg';
    assets.hero.src = hero === 'superman' ? 'assets/img/hero.png' : 'assets/img/hero2.png';
    assets.obs.src = hero === 'superman' ? 'assets/img/asteroid.png' : 'assets/img/villano.png';
    assets.ptr.src = hero === 'superman' ? 'assets/img/puntero.png' : 'assets/img/puntero2.png';
    uiOverlay.classList.add('hide');
    gameActive = true;
    sounds[hero].play();
    spawnObstacles();
    requestAnimationFrame(gameLoop);
}

function fireLaser() {
    // Apunta hacia donde esté el mouse/puntero
    const angle = Math.atan2(mouse.y - (player.y + player.h/2), mouse.x - (player.x + player.w));
    lasers.push({ x: player.x + player.w, y: player.y + player.h/2, angle: angle, speed: 18 });
}

function spawnObstacles() {
    if(!gameActive) return;
    obstacles.push({ x: canvas.width + 100, y: Math.random() * (canvas.height - 80) + 40, size: 50 + Math.random() * 30, speed: 4 + (currentLevel * 1.5) });
    setTimeout(spawnObstacles, Math.max(300, 1600 - (currentLevel * 200)));
}

function gameLoop() {
    if(!gameActive) return;
    ctx.drawImage(assets.bg, 0, 0, canvas.width, canvas.height);

    // MOVIMIENTO HÍBRIDO:
    if(keys['w'] || keys['arrowup']) targetY -= player.speed;
    if(keys['s'] || keys['arrowdown']) targetY += player.speed;

    // El héroe se desliza suavemente hacia el targetY (ya sea por teclas o por mouse)
    player.y += (targetY - player.y) * 0.15;
    player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));

    ctx.drawImage(assets.hero, player.x, player.y, player.w, player.h);

    if(isTouch && Date.now() % 400 < 20) fireLaser();

    // Láseres
    lasers.forEach((l, i) => {
        l.x += Math.cos(l.angle) * l.speed;
        l.y += Math.sin(l.angle) * l.speed;
        ctx.shadowBlur = 10; ctx.shadowColor = currentHero === 'superman' ? '#0df' : '#fb0';
        ctx.fillStyle = "#fff"; ctx.fillRect(l.x, l.y, 25, 4); ctx.shadowBlur = 0;
        if(l.x > canvas.width || l.y < 0 || l.y > canvas.height) lasers.splice(i, 1);
    });

    // Enemigos
    obstacles.forEach((o, i) => {
        o.x -= o.speed;
        ctx.drawImage(assets.obs, o.x, o.y, o.size, o.size);
        lasers.forEach((l, li) => {
            if(l.x > o.x && l.x < o.x + o.size && l.y > o.y && l.y < o.y + o.size) {
                obstacles.splice(i, 1); lasers.splice(li, 1);
                score += 100; if(score % 1000 === 0) currentLevel++;
                updateHUD();
            }
        });
        if(o.x < -o.size) {
            obstacles.splice(i, 1); health -= 20; damageFlash = 0.5; updateHUD();
            if(health <= 0) { if(score > hiScore) localStorage.setItem('dcHiScore', score); location.reload(); }
        }
    });

    if(!isTouch) ctx.drawImage(assets.ptr, mouse.x - 20, mouse.y - 20, 40, 40);
    if(damageFlash > 0) { ctx.fillStyle = `rgba(255,0,0,${damageFlash})`; ctx.fillRect(0,0,canvas.width,canvas.height); damageFlash -= 0.02; }
    requestAnimationFrame(gameLoop);
}

function updateHUD() {
    scoreDisplay.innerText = score.toString().padStart(4, '0');
    healthBar.style.width = health + "%";
    healthBar.className = `progress-bar ${health < 35 ? 'bg-danger' : (currentHero === 'superman' ? 'bg-info' : 'bg-warning')}`;
    levelDisplay.innerText = currentLevel;
}