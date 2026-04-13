const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const healthBar = document.getElementById('health-bar');
const healthText = document.getElementById('health-text');
const levelDisplay = document.getElementById('level-display');
const uiOverlay = document.getElementById('ui-overlay');
const menuMusic = document.getElementById('menuMusic');

canvas.width = 900;
canvas.height = 500;

// --- AUDIO CONFIG ---
menuMusic.volume = 0.4;
const sounds = {
    superman: new Audio('assets/audio/audio1.mp3'),
    batman: new Audio('assets/audio/audio2.mp3')
};
sounds.superman.loop = sounds.batman.loop = true;
let currentMusic = null;

// Desbloquear audio del navegador al primer click
const handleAudioUnlock = () => {
    if (menuMusic.paused && !gameActive) {
        menuMusic.play().catch(() => {});
    }
};
document.addEventListener('click', handleAudioUnlock, { once: false });

// --- GAME STATE ---
let score = 0, health = 100, gameActive = false;
let currentHero = 'superman', currentLevel = 1;
let highScore = localStorage.getItem('supScore') || 0;
let obstacles = [], lasers = [], particles = [], keys = {};
let mouse = { x: 0, y: 0 }, damageFlash = 0;
let showMilImage = false, milTimer = 0;

highScoreDisplay.innerText = highScore;

const assets = {
    bgSup: new Image(), bgBat: new Image(),
    heroSup: new Image(), heroBat: new Image(),
    asteroid: new Image(), villain: new Image(),
    pointerSup: new Image(), pointerBat: new Image(),
    milImg: new Image()
};

assets.bgSup.src = 'assets/img/bg.jpg';
assets.bgBat.src = 'assets/img/bg2.jpg';
assets.heroSup.src = 'assets/img/hero.png';
assets.heroBat.src = 'assets/img/hero2.png';
assets.asteroid.src = 'assets/img/asteroid.png';
assets.villain.src = 'assets/img/villano.png';
assets.pointerSup.src = 'assets/img/puntero.png';
assets.pointerBat.src = 'assets/img/puntero2.png';
assets.milImg.src = 'assets/img/mil.png';

const player = { x: 50, y: 220, w: 80, h: 50, speed: 10 };

window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});
canvas.addEventListener('mousedown', () => { if(gameActive) fireLaser(); });

function initGame(heroType) {
    menuMusic.pause();
    currentHero = heroType;
    uiOverlay.classList.add('hide');
    gameActive = true;
    
    currentMusic = currentHero === 'batman' ? sounds.batman : sounds.superman;
    currentMusic.currentTime = 0;
    currentMusic.play().catch(() => {});

    score = 0; health = 100; currentLevel = 1;
    obstacles = []; lasers = []; particles = [];
    updateHUD();
    spawnObstacles();
    requestAnimationFrame(gameLoop);
}

function fireLaser() {
    const angle = Math.atan2(mouse.y - (player.y + 25), mouse.x - (player.x + 80));
    lasers.push({ x: player.x + 80, y: player.y + 25, angle: angle });
}

// --- MOTOR DE DIFICULTAD ---
function spawnObstacles() {
    if (!gameActive) return;

    // Velocidad escala con el nivel exponencialmente
    const speed = 4 + (currentLevel * 1.8) + (Math.random() * 2);
    const size = 40 + Math.random() * 35 + (currentLevel * 3);

    obstacles.push({ 
        x: canvas.width + 100, 
        y: Math.random() * (canvas.height - 80) + 40, 
        size: size, 
        speed: speed 
    });

    // Frecuencia aumenta: menos tiempo entre spawn al subir nivel
    let nextSpawn = Math.max(250, 1600 - (currentLevel * 250));
    setTimeout(spawnObstacles, nextSpawn);
}

function updateHUD() {
    scoreDisplay.innerText = score.toString().padStart(4, '0');
    healthBar.style.width = health + "%";
    
    if (health <= 30) {
        healthBar.className = "progress-bar bg-danger";
        healthText.innerText = "SISTEMA CRÍTICO - DAÑO SEVERO";
    } else {
        healthBar.className = currentHero === 'superman' ? "progress-bar bg-success" : "progress-bar bg-success";
        healthText.innerText = currentHero === 'superman' ? "ESTADO KRIPTONIANO: ÓPTIMO" : "ARMADURA WAYNE-TECH: ONLINE";
    }
    levelDisplay.innerText = currentLevel;
}

function createExplosion(x, y, color) {
    for (let i = 0; i < 15; i++) {
        particles.push({ 
            x: x, y: y, 
            vx: (Math.random() - 0.5) * 14, 
            vy: (Math.random() - 0.5) * 14, 
            life: 1.0, 
            color: color 
        });
    }
}

function gameLoop() {
    if (!gameActive) return;
    const bg = currentHero === 'superman' ? assets.bgSup : assets.bgBat;
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // Movimiento
    if (keys['w'] && player.y > 0) player.y -= player.speed;
    if (keys['s'] && player.y < canvas.height - player.h) player.y += player.speed;
    ctx.drawImage(currentHero === 'superman' ? assets.heroSup : assets.heroBat, player.x, player.y, player.w, player.h);

    // Partículas (Explosiones)
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx; p.y += p.vy; p.life -= 0.03;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Láseres
    for (let i = lasers.length - 1; i >= 0; i--) {
        let l = lasers[i];
        l.x += Math.cos(l.angle) * 22; l.y += Math.sin(l.angle) * 22;
        ctx.shadowBlur = 12; ctx.shadowColor = currentHero === 'superman' ? "red" : "gold";
        ctx.fillStyle = "#fff"; ctx.fillRect(l.x, l.y, 18, 4); ctx.shadowBlur = 0;
        if (l.x > canvas.width || l.x < 0 || l.y < 0 || l.y > canvas.height) lasers.splice(i, 1);
    }

    // Obstáculos y Colisiones
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let o = obstacles[i]; o.x -= o.speed;
        const oImg = currentHero === 'superman' ? assets.asteroid : assets.villain;
        ctx.drawImage(oImg, o.x, o.y, o.size, o.size);

        lasers.forEach((l, li) => {
            if (l.x > o.x && l.x < o.x + o.size && l.y > o.y && l.y < o.y + o.size) {
                createExplosion(o.x + o.size/2, o.y + o.size/2, currentHero === 'superman' ? '#0af' : '#fb0');
                obstacles.splice(i, 1); lasers.splice(li, 1);
                score += 100;
                if (score % 1000 === 0) { 
                    currentLevel++; 
                    showMilImage = true; 
                    milTimer = 100; 
                }
                updateHUD();
            }
        });

        if (o.x + o.size < 0) {
            obstacles.splice(i, 1); 
            health -= 20; 
            damageFlash = 0.6;
            canvas.classList.add('shake'); 
            setTimeout(() => canvas.classList.remove('shake'), 200);
            updateHUD();
            if (health <= 0) {
                if (score > highScore) localStorage.setItem('supScore', score);
                location.reload();
            }
        }
    }

    if (showMilImage && milTimer > 0) {
        ctx.drawImage(assets.milImg, canvas.width/2 - 150, canvas.height/2 - 75, 300, 150);
        milTimer--;
    }

    if (damageFlash > 0) { 
        ctx.fillStyle = `rgba(255, 0, 0, ${damageFlash})`; 
        ctx.fillRect(0, 0, canvas.width, canvas.height); 
        damageFlash -= 0.02; 
    }

    ctx.drawImage(currentHero === 'superman' ? assets.pointerSup : assets.pointerBat, mouse.x - 20, mouse.y - 20, 40, 40);
    requestAnimationFrame(gameLoop);
}