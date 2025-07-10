// Home page
const playBtn = document.getElementById('play-btn');
const instructionBtn = document.getElementById('instruction-btn');
const instructionCloseBtn = document.getElementById('instruction-close');
const instructonPage = document.querySelector('.instruction-container');

document.addEventListener('DOMContentLoaded', function() {
    instructionBtn.addEventListener('click', function() {
        instructonPage.classList.add('active');
        window.scrollTo({ top: 0, behavior: "smooth" })
    });

    instructionCloseBtn.addEventListener('click', function() {
        instructonPage.classList.remove('active');
    });
});

// Leaderboard
const leaderboardContainer = document.querySelector('.leaderboard-container');
const localStorageDataPlayer = JSON.parse(localStorage.getItem('playerData')) || [];
let leaderboardPage = '';

localStorageDataPlayer.forEach(leaderboard => {
    leaderboardPage += `
        <div class="leaderboard-player">
            <div>
                <p class="leaderboard-name">${leaderboard.username}</p>
                <p class="leaderboard-score">Score: ${leaderboard.score}</p>
            </div>
            <button>Detail</button>
        </div>
        <hr/>
    `
});

leaderboardContainer.innerHTML = leaderboardPage;

// Game page
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const background = document.getElementById('background');
const gun1 = document.getElementById('gun1-image');
const gun2 = document.getElementById('gun2-image');
const pointer = document.getElementById('pointer-image');
const boom = document.getElementById('boom-image');
const target1 = document.getElementById('target1-image');
const target2 = document.getElementById('target2-image');
const target3 = document.getElementById('target3-image');
let timeScore;

const gameoverPage = document.querySelector('.gameover');
const saveBtn = document.getElementById('save-score-btn');
const restartBtn = document.getElementById('restart-btn');
const gameoverUsername = document.getElementById('gameover-username');
const gameoverScore = document.getElementById('gameover-score');

const shootAudio = document.getElementById('shoot-audio');
const gameoverAudio = document.getElementById('gameover-audio');

// Gameover
restartBtn.addEventListener('click', function() {
    sessionStorage.removeItem('playerData');
    window.location.reload();
});

saveBtn.addEventListener('click', function() {
    const username = document.querySelector('.username-input').value;
    const data = {
        username,
        score: scoreCount,

    };

    const stored = JSON.parse(localStorage.getItem('playerData'));
    stored.push(data);
    localStorage.setItem('playerData', JSON.stringify(stored));
    window.location.reload();
});

// Pause game
const pausePage = document.querySelector('.pause');
const pauseBtn = document.getElementById('pause-btn');

let isPause = false;
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        isPause = true;
        pausePage.classList.add('active');
    }
});

pauseBtn.addEventListener('click', function() {
    pausePage.classList.remove('active');
    isPause = false;
});

// Player
const usernamePlayer = document.getElementById('player-username');
const score = document.getElementById('player-score');
const time = document.getElementById('player-time');

// Time
function gameTime() {
    const playerData = sessionStorage.getItem('playerData');
    const data = JSON.parse(playerData);

    if (data.level == "hard") {
        timeScore = 16
    } else if (data.level == "medium") {
        timeScore = 21
    } else {
        timeScore = 31
    }

    const gameTimeInterval = setInterval(() => {
        if (isPause == false) {
            timeScore--;
        }
        time.textContent = "Time: " + timeScore;

        if (timeScore <= 0) {
            gameoverAudio.play();
            clearInterval(gameTimeInterval);
            updateTargetPosition = [];
            gameoverPage.classList.add('active');
        }
    }, 1000);
}
// gameTime();

// property
let gunProperty = {
    size: 300
}

let pointerProperty = {
    size: 80,
    x: 0,
    y: 0
}

let boomProperty = {
    size: 90,
}

let targetProperty = {
    size: 120
}

// Mouse Event
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    pointerProperty.x = (e.clientX - rect.left) * scaleX;
    pointerProperty.y = (e.clientY - rect.top) * scaleY;
});

// Click Event
let boomEffect = [];
let scoreCount = 0;
canvas.addEventListener('click', () => {
    let hitTarget = false;
    shootAudio.play();
    boomEffect.push({
        x: pointerProperty.x,
        y: pointerProperty.y,
        startTime: Date.now()
    });
    
    updateTargetPosition = updateTargetPosition.filter(t => {
        const hitX = pointerProperty.x >= t.x && pointerProperty.x <= t.x + targetProperty.size;
        const hitY = pointerProperty.y >= t.y && pointerProperty.y <= t.y+ targetProperty.size;

        if (isPause == false) {
            if (hitX && hitY) {
                scoreCount+= 1;
                score.textContent = "Score: " + scoreCount;
                gameoverScore.textContent = "Score: " + scoreCount;
                hitTarget = true;
                return false;
            }
        }

        return true;
    });

    if (isPause == false) {
        if (hitTarget == false) {
            timeScore-= 5;
        }
    }
});

// Position Target
let updateTargetPosition = [];
function updateTarget() {
    const playerData = sessionStorage.getItem('playerData');
    const data = JSON.parse(playerData);
    let selectedTarget;
    
    if (data.target == "target3") {
        selectedTarget = target3;
    } else if (data.target == "target2") {
        selectedTarget = target2;
    } else {
        selectedTarget = target1;
    }

    for (let index = 0; index < 3; index++) {
        const x = Math.random() * (canvas.width - targetProperty.size);
        const y = Math.random() * (canvas.height - targetProperty.size);
        if (isPause == false) {
            updateTargetPosition.push({ x, y, image: selectedTarget });
        }
    }
}
// setInterval(updateTarget, 3000);

// Draw Image
function drawBackground() {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
}

function drawPointer() {
    ctx.drawImage(pointer, pointerProperty.x - pointerProperty.size / 2, pointerProperty.y - pointerProperty.size / 2, pointerProperty.size, pointerProperty.size);
}

function drawBoom() {
    const now = Date.now();
    const duration = 300;

    boomEffect = boomEffect.filter(b => now - b.startTime < duration);
    boomEffect.forEach(b => {
        ctx.drawImage(boom, b.x - boomProperty.size / 2, b.y - boomProperty.size / 2, boomProperty.size, boomProperty.size);
    }); 
}

function drawTarget() {
    updateTargetPosition.forEach(t => {
        ctx.drawImage(t.image, t.x, t.y, targetProperty.size, targetProperty.size);
    });
}

function drawGun() {
    let selectedGun;
    const playerData = sessionStorage.getItem('playerData');
    const data = JSON.parse(playerData);

    if (data?.gun == "gun2") {
        selectedGun = gun2
    } else {
        selectedGun = gun1
    }

    ctx.drawImage(selectedGun, (canvas.width - gunProperty.size) / 2, canvas.height - gunProperty.size, gunProperty.size, gunProperty.size);
}

// Gameloop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    drawGun();
    if (timeScore > 0) {
        drawTarget();
    }
    
    drawBoom();
    drawPointer();
    requestAnimationFrame(gameLoop);
}

gameLoop();

// Countdown Start
const countdownPage = document.querySelector('.countdown-page');
const countdownPageTimer = document.getElementById('countdown-page-time');
const gamePage = document.querySelector('.game-page');
let pageTimer = 3;

function gameCountdown() {
    countdownPage.classList.add('active');
    const countdownPageTimerStart = setInterval(() => {
        pageTimer--;
        countdownPageTimer.textContent = pageTimer;
    
        if (pageTimer <= 0) {            
            clearInterval(countdownPageTimerStart);
            countdownPage.classList.remove('active');
            gamePage.classList.add('active');

            setInterval(updateTarget, 3000);
            gameTime();
        }

    }, 1000);
}

// Play game
playBtn.addEventListener('click', function() {
    const homePage = document.querySelector('.home-page');
    const username = document.querySelector('.username-input').value;
    const level = document.querySelector('.home-select').value;
    const gun = document.querySelector('input[name="gun"]:checked').value;
    const target = document.querySelector('input[name="target"]:checked').value;
    const playerData = localStorage.getItem('playerData');

    const guestData = {
        username: "Thomas Galih",
        score: 30
    }

    if (!playerData) {
        localStorage.setItem('playerData', JSON.stringify([guestData]));
    }

    if (username == "" || level == "") {
        alert("Please Input Your Data!!");
    } else {
        const playerData = {
            username,
            level,
            gun,
            target
        } 

        const elem = document.documentElement; 
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
          elem.msRequestFullscreen();
        }

        sessionStorage.setItem('playerData', JSON.stringify(playerData));
        usernamePlayer.textContent = "Player Name: " + username;
        gameoverUsername.textContent = "Username: " + username;
        homePage.classList.add('remove');
        gameCountdown();
    }
});