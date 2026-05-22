const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const COLS = 10, ROWS = 20, SIZE = 14;

const colors = [null, '#00f0f0', '#f0f000', '#a000f0', '#00f000', '#f00000', '#0000f0', '#f0a000'];
const shapes = [
    [], [[1,1,1,1]], [[2,2],[2,2]], [[0,3,0],[3,3,3]],
    [[4,4,0],[0,4,4]], [[0,5,5],[5,5,0]], [[6,0,0],[6,6,6]], [[0,0,7],[7,7,7]]
];

let isRunning = false;
let gameMode = 'vs';
let currentScreen = 'start';
let particles = [];
let shakeTime = 0;
let textEffect = { text: '', x: 0, y: 0, timer: 0 };

function createField(xOffset, isCPU) {
    return {
        board: Array.from({ length: ROWS }, () => Array(COLS).fill(0)),
        score: 0,
        piece: null,
        xOffset: xOffset,
        isCPU: isCPU,
        dropInterval: 800,
        lastTime: 0,
        targetX: 3,
        targetRotation: 0
    };
}

let pField = createField(10, false);
let cField = createField(170, true);

function thinkCPU(f) {
    let bestScore = -999999;
    let bestX = 0;
    let bestRot = 0;
    let currentMatrix = f.piece.matrix;
    for (let r = 0; r < 4; r++) {
        for (let x = -2; x < COLS; x++) {
            let testPiece = { pos: { x: x, y: 0 }, matrix: currentMatrix };
            if (collide(testPiece, f.board)) continue;
            while (!collide(testPiece, f.board)) { testPiece.pos.y++; }
            testPiece.pos.y--;
            let tempBoard = f.board.map(row => [...row]);
            testPiece.matrix.forEach((row, py) => row.forEach((val, px) => {
                if (val && tempBoard[testPiece.pos.y + py]) {
                    tempBoard[testPiece.pos.y + py][testPiece.pos.x + px] = 1;
                }
            }));
            let linesCleared = 0; let holes = 0; let aggregateHeight = 0;
            tempBoard.forEach(row => { if (row.every(v => v !== 0)) linesCleared++; });
            for (let c = 0; c < COLS; c++) {
                let colHeight = 0; let foundBlock = false;
                for (let row = 0; row < ROWS; row++) {
                    if (tempBoard[row][c] !== 0) {
                        if (!foundfoundBlock) { colHeight = ROWS - row; foundBlock = true; }
                    } else if (foundBlock) { holes++; }
                }
                aggregateHeight += colHeight;
            }
            let score = (linesCleared * 1000) - (aggregateHeight * 15) - (holes * 80);
            if (score > bestScore) { bestScore = score; bestX = x; bestRot = r; }
        }
        currentMatrix = rotate(currentMatrix);
    }
    f.targetX = bestX; f.targetRotation = bestRot;
}

function spawnPiece(f) {
    const id = Math.floor(Math.random() * 7) + 1;
    f.piece = { pos: { x: 3, y: 0 }, matrix: shapes[id], id: id };
    if (f.isCPU) thinkCPU(f);
}

function rotate(matrix) {
    return matrix[0].map((_, i) => matrix.map(row => row[row.length - 1 - i]));
}

function collide(p, board) {
    return p.matrix.some((row, y) => row.some((val, x) =>
        val && (board[p.pos.y + y] === undefined || board[p.pos.y + y][p.pos.x + x] === undefined || board[p.pos.y + y][p.pos.x + x] !== 0)
    ));
}

function addParticles(x, y, color) {
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
            alpha: 1, color: color
        });
    }
}

function merge(f) {
    f.piece.matrix.forEach((row, y) => row.forEach((val, x) => {
        if (val) f.board[f.piece.pos.y + y][f.piece.pos.x + x] = f.piece.id;
    }));
    let linesCount = 0;
    f.board = f.board.filter((row, r) => {
        if (row.every(v => v !== 0)) {
            linesCount++;
            for(let c=0; c<COLS; c++) addParticles(f.xOffset + c*SIZE + SIZE/2, r*SIZE + SIZE/2, colors[row[c]]);
            return false;
        }
        return true;
    });
    if (linesCount > 0) {
        f.score += linesCount * linesCount * 100;
        f.dropInterval = Math.max(100, 800 - f.score / 5);
        shakeTime = 10;
        textEffect = { text: linesCount >= 4 ? 'MAX COMBO!!' : 'CYBER HIT!', x: f.xOffset + 70, y: 150, timer: 30 };
    }
    while (f.board.length < ROWS) f.board.unshift(Array(COLS).fill(0));
    spawnPiece(f);
    if (collide(f.piece, f.board)) {
        isRunning = false; currentScreen = 'start';
        textEffect = { text: gameMode === 'vs' ? (f.isCPU ? 'YOU WIN!!' : 'GAME OVER') : 'GAME OVER', x: 160, y: 180, timer: 100 };
    }
}

function updateField(f, time) {
    if (time - f.lastTime > f.dropInterval) {
        if (f.isCPU) {
            if (f.targetRotation > 0) {
                const old = f.piece.matrix; f.piece.matrix = rotate(f.piece.matrix);
                if(collide(f.piece, f.board)) f.piece.matrix = old;
                f.targetRotation--;
            }
            if (f.piece.pos.x < f.targetX) { f.piece.pos.x++; if(collide(f.piece, f.board)) f.piece.pos.x--; }
            else if (f.piece.pos.x > f.targetX) { f.piece.pos.x--; if(collide(f.piece, f.board)) f.piece.pos.x++; }
        }
        f.piece.pos.y++;
        if (collide(f.piece, f.board)) { f.piece.pos.y--; merge(f); }
        f.lastTime = time;
    }
}

function drawGrid(xOffset) {
    ctx.strokeStyle = '#111122';
    for (let r = 0; r <= ROWS; r++) {
        ctx.beginPath(); ctx.moveTo(xOffset, r * SIZE); ctx.lineTo(xOffset + COLS * SIZE, r * SIZE); ctx.stroke();
    }
    for (let c = 0; c <= COLS; c++) {
        ctx.beginPath(); ctx.moveTo(xOffset + c * SIZE, 0); ctx.lineTo(xOffset + c * SIZE, ROWS * SIZE); ctx.stroke();
    }
}

function drawField(f) {
    drawGrid(f.xOffset);
    f.board.forEach((row, y) => row.forEach((val, x) => {
        if (val) {
            ctx.fillStyle = colors[val]; ctx.shadowBlur = 10; ctx.shadowColor = colors[val];
            ctx.fillRect(f.xOffset + x * SIZE, y * SIZE, SIZE - 1, SIZE - 1);
        }
    }));
    if (f.piece) {
        ctx.shadowBlur = 15; ctx.shadowColor = colors[f.piece.id];
        f.piece.matrix.forEach((row, y) => row.forEach((val, x) => {
            if (val) {
                ctx.fillStyle = colors[f.piece.id];
                ctx.fillRect(f.xOffset + (f.piece.pos.x + x) * SIZE, (f.piece.pos.y + y) * SIZE, SIZE - 1, SIZE - 1);
            }
        }));
    }
    ctx.shadowBlur = 0;
    ctx.fillStyle = f.isCPU ? '#ff0055' : '#00ffcc'; ctx.font = '10px "Courier New"'; ctx.textAlign = 'left';
    ctx.fillText(`${f.isCPU ? 'CPU' : 'YOU'}_SCORE: ${f.score}`, f.xOffset, ROWS * SIZE + 20);
}

function update(time = 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    if (shakeTime > 0) { ctx.translate((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6); shakeTime--; }

    if (currentScreen === 'game') {
        if (isRunning) { updateField(pField, time); if (gameMode === 'vs') updateField(cField, time); }
        drawField(pField); if (gameMode === 'vs') drawField(cField);
    }

    particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; p.alpha -= 0.03;
        if (p.alpha <= 0) particles.splice(i, 1);
        else {
            ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha; ctx.shadowBlur = 5; ctx.shadowColor = p.color;
            ctx.fillRect(p.x, p.y, 3, 3);
        }
    });
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;

    if (textEffect.timer > 0) {
        ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center';
        ctx.shadowBlur = 10; ctx.shadowColor = '#00ffcc';
        ctx.fillText(textEffect.text, textEffect.x, textEffect.y); textEffect.timer--; ctx.shadowBlur = 0;
    }

    if (currentScreen === 'start') {
        ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ffcc'; ctx.font = 'bold 24px "Courier New"'; ctx.textAlign = 'center';
        ctx.shadowBlur = 15; ctx.shadowColor = '#00ffcc';
        ctx.fillText('CYBER TETRIS', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillStyle = '#fff'; ctx.font = '12px Arial'; ctx.fillText('TAP TO START', canvas.width / 2, canvas.height / 2 + 20);
        ctx.shadowBlur = 0;
    } else if (currentScreen === 'mode') {
        ctx.fillStyle = 'rgba(0,0,0,0.9)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ffcc'; ctx.font = 'bold 18px "Courier New"'; ctx.textAlign = 'center';
        ctx.fillText('SELECT MODE', canvas.width / 2, 80);
        ctx.strokeStyle = '#fff'; ctx.strokeRect(40, 140, 240, 40);
        ctx.fillStyle = '#fff'; ctx.font = '14px Arial'; ctx.fillText('1 PLAYER (SINGLE)', canvas.width / 2, 165);
        ctx.strokeStyle = '#ff0055'; ctx.strokeRect(40, 210, 240, 40);
        ctx.fillStyle = '#ff0055'; ctx.fillText('VS CPU MODE', canvas.width / 2, 235);
    }
    ctx.restore();
    requestAnimationFrame(update);
}

canvas.addEventListener('touchstart', (e) => {
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const touchY = e.touches[0].clientY - rect.top;

    if (currentScreen === 'start') { currentScreen = 'mode'; return; }
    if (currentScreen === 'mode') {
        if (touchX >= 40 && touchX <= 280) {
            if (touchY >= 140 && touchY <= 180) {
                gameMode = 'single'; pField = createField(90, false); spawnPiece(pField); currentScreen = 'game'; isRunning = true;
            } else if (touchY >= 210 && touchY <= 250) {
                gameMode = 'vs'; pField = createField(10, false); cField = createField(170, true); spawnPiece(pField); spawnPiece(cField); currentScreen = 'game'; isRunning = true;
            }
        }
        return;
    }
    if (currentScreen === 'game' && isRunning) {
        if (touchX < canvas.width / 3) { 
            pField.piece.pos.x--; if (collide(pField.piece, pField.board)) pField.piece.pos.x++; 
        } else if (touchX > (canvas.width / 3) * 2) { 
            pField.piece.pos.x++; if (collide(pField.piece, pField.board)) pField.piece.pos.x--; 
        } else { 
            const old = pField.piece.matrix; pField.piece.matrix = rotate(pField.piece.matrix); if (collide(pField.piece, pField.board)) pField.piece.matrix = old; 
        }
    }
});

update();
