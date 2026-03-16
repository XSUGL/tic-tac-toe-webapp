/* ═══════════════════════════════════════════════════
   ARCADE X – script.js
   Games: Tic-Tac-Toe 3×3 | TTT Ultra 5×5 | Connect 4
   ═══════════════════════════════════════════════════ */

// ── STATE ──────────────────────────────────────────
let lang        = localStorage.getItem('lang') || 'en';
let firstMode   = localStorage.getItem('firstMode') || 'player';
let currentGame = null; // 'ttt' | 'ttt5' | 'c4'
let gameMode    = 'bot'; // 'bot' | 'player'
let difficulty  = 'easy';
let gameActive  = false;
let gameCount   = 0;

let scores = { p1: 0, p2: 0, draw: 0 };

// ── TRANSLATIONS ───────────────────────────────────
const T = {
    en: {
        player: 'PLAYER', bot: 'BOT', player2: 'P2', draw: 'DRAW',
        yourTurn: 'YOUR TURN', botThinking: 'BOT THINKING…',
        p1Turn: 'PLAYER 1', p2Turn: 'PLAYER 2',
        youWin: '🎉 YOU WIN!', botWins: '🤖 BOT WINS!',
        p1Wins: '🎉 P1 WINS!', p2Wins: '🎉 P2 WINS!',
        drawMsg: '🤝 DRAW!',
    },
    ru: {
        player: 'ИГРОК', bot: 'БОТ', player2: 'ИГ2', draw: 'НИЧЬЯ',
        yourTurn: 'ВАШ ХОД', botThinking: 'БОТ ДУМАЕТ…',
        p1Turn: 'ИГРОК 1', p2Turn: 'ИГРОК 2',
        youWin: '🎉 ВЫ ПОБЕДИЛИ!', botWins: '🤖 БОТ ПОБЕДИЛ!',
        p1Wins: '🎉 ИГРОК 1 ПОБЕДИЛ!', p2Wins: '🎉 ИГРОК 2 ПОБЕДИЛ!',
        drawMsg: '🤝 НИЧЬЯ!',
    },
    it: {
        player: 'GIOCATORE', bot: 'BOT', player2: 'G2', draw: 'PARI',
        yourTurn: 'IL TUO TURNO', botThinking: 'BOT STA PENSANDO…',
        p1Turn: 'GIOCATORE 1', p2Turn: 'GIOCATORE 2',
        youWin: '🎉 HAI VINTO!', botWins: '🤖 HA VINTO IL BOT!',
        p1Wins: '🎉 VINCE G1!', p2Wins: '🎉 VINCE G2!',
        drawMsg: '🤝 PAREGGIO!',
    }
};
const t = k => (T[lang] || T.en)[k] || k;

// ── DOM ────────────────────────────────────────────
const hub          = id('hub');
const gameScreen   = id('gameScreen');
const setup        = id('setup');
const diffRow      = id('diffRow');
const turnBar      = id('turnBar');
const turnSymbol   = id('turnSymbol');
const turnLabel    = id('turnLabel');
const ctrlRow      = id('ctrlRow');
const tttBoard     = id('tttBoard');
const ttt5Board    = id('ttt5Board');
const c4Wrap       = id('c4Wrap');
const c4Arrows     = id('c4Arrows');
const c4Grid       = id('c4Grid');
const resultModal  = id('resultModal');
const resultTitle  = id('resultTitle');
const resultEmoji  = id('resultEmoji');

function id(x) { return document.getElementById(x); }
function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }

// ── SCOREBOARD ─────────────────────────────────────
function updateScores() {
    id('sVal1').textContent = scores.p1;
    id('sVal2').textContent = scores.p2;
    id('sValD').textContent = scores.draw;
    id('sName1').textContent = t('player');
    id('sName2').textContent = gameMode === 'bot' ? t('bot') : t('player2');
}

// ── TURN INDICATOR ─────────────────────────────────
let currentPlayer = 'X';
function updateTurn(isThinking = false) {
    show(turnBar);
    turnBar.className = 'turn-bar';
    if (isThinking) {
        turnBar.classList.add('thinking');
        turnSymbol.textContent = '○';
        turnLabel.textContent = t('botThinking');
        return;
    }
    const isX = currentPlayer === 'X';
    turnBar.classList.add(isX ? 'x-turn' : 'o-turn');
    turnSymbol.textContent = isX ? '✕' : '○';
    if (gameMode === 'bot') {
        turnLabel.textContent = isX ? t('yourTurn') : t('botThinking');
    } else {
        turnLabel.textContent = isX ? t('p1Turn') : t('p2Turn');
    }
}

// ── WHO GOES FIRST ─────────────────────────────────
function decideFirst() {
    if (firstMode === 'player') return 'X';
    if (firstMode === 'bot')    return 'O';
    return gameCount % 2 === 0  ? 'X' : 'O';
}

// ── HUB NAVIGATION ─────────────────────────────────
document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', () => {
        currentGame = card.dataset.game;
        id('gameName').textContent = {
            ttt: 'TIC-TAC-TOE', ttt5: 'TTT ULTRA 5×5', c4: 'CONNECT 4'
        }[currentGame];
        scores = { p1:0, p2:0, draw:0 };
        updateScores();
        // C4 always shows difficulty; ttt5 shows it too
        show(diffRow);
        hide(hub);
        show(gameScreen);
        hide(turnBar);
        hide(ctrlRow);
        showSetup();
    });
});

id('backBtn').addEventListener('click', () => {
    hide(gameScreen);
    show(hub);
    gameActive = false;
});

// ── SETUP ──────────────────────────────────────────
function showSetup() {
    show(setup);
    hide(turnBar);
    hide(ctrlRow);
    hideBoardAll();
}

document.querySelectorAll('.pill[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.pill[data-mode]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gameMode = btn.dataset.mode;
        updateScores();
    });
});
document.querySelectorAll('.pill[data-diff]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.pill[data-diff]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        difficulty = btn.dataset.diff;
    });
});

id('startBtn').addEventListener('click', startGame);
id('restartBtn').addEventListener('click', restartGame);
id('newGameBtn').addEventListener('click', showSetup);
id('playAgainBtn').addEventListener('click', () => { hide(resultModal); restartGame(); });
id('menuFromResult').addEventListener('click', () => { hide(resultModal); showSetup(); });

// ── START / RESTART ────────────────────────────────
function startGame() {
    gameCount++;
    currentPlayer = decideFirst();
    gameActive = true;
    hide(setup);
    show(ctrlRow);
    updateScores();
    if (currentGame === 'ttt')   startTTT();
    if (currentGame === 'ttt5')  startTTT5();
    if (currentGame === 'c4')    startC4();
    updateTurn();
    if (gameMode === 'bot' && currentPlayer === 'O') scheduleBotMove();
}

function restartGame() {
    gameCount++;
    currentPlayer = decideFirst();
    gameActive = true;
    hide(resultModal);
    hide(setup);
    show(ctrlRow);
    if (currentGame === 'ttt')   startTTT();
    if (currentGame === 'ttt5')  startTTT5();
    if (currentGame === 'c4')    startC4();
    updateTurn();
    if (gameMode === 'bot' && currentPlayer === 'O') scheduleBotMove();
}

function hideBoardAll() {
    hide(tttBoard); hide(ttt5Board); hide(c4Wrap);
}

// ══════════════════════════════════════════════════
// GAME 1: TIC-TAC-TOE 3×3
// ══════════════════════════════════════════════════
let tttState = Array(9).fill('');
const TTT_WINS = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
];

function startTTT() {
    tttState = Array(9).fill('');
    hideBoardAll();
    show(tttBoard);
    tttBoard.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.i = i;
        cell.addEventListener('click', () => onTTTClick(i));
        tttBoard.appendChild(cell);
    }
}

function onTTTClick(i) {
    if (!gameActive || tttState[i] !== '') return;
    if (gameMode === 'bot' && currentPlayer === 'O') return;
    placeTTT(i);
}

function placeTTT(i) {
    tttState[i] = currentPlayer;
    const cell = tttBoard.querySelector(`[data-i="${i}"]`);
    cell.textContent = currentPlayer === 'X' ? '✕' : '○';
    cell.classList.add(currentPlayer.toLowerCase(), 'taken', 'pop');
    const win = checkTTTWin(tttState);
    if (win) return finishTTT(win);
    if (tttState.every(c => c)) return endGame('draw');
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateTurn();
    if (gameMode === 'bot' && currentPlayer === 'O') scheduleBotMove();
}

function checkTTTWin(board) {
    for (const combo of TTT_WINS) {
        const [a,b,c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c])
            return { winner: board[a], combo };
    }
    return null;
}

function finishTTT(win) {
    gameActive = false;
    win.combo.forEach(i => tttBoard.querySelector(`[data-i="${i}"]`).classList.add('winning'));
    setTimeout(() => endGame(win.winner === 'X' ? 'p1' : 'p2'), 400);
}

// TTT Bot
function botMoveTTT() {
    if (!gameActive || currentPlayer !== 'O' || gameMode !== 'bot') return;
    updateTurn(true);
    const move = pickMoveTTT();
    setTimeout(() => {
        if (!gameActive) return;
        placeTTT(move);
    }, 350);
}

function pickMoveTTT() {
    if (difficulty === 'easy') return randomEmpty(tttState);
    // medium: win or block, else random
    const win = findImmediate(tttState, 'O');
    if (win !== -1) return win;
    if (difficulty === 'medium') {
        const block = findImmediate(tttState, 'X');
        if (block !== -1) return block;
        return randomEmpty(tttState);
    }
    // hard: minimax
    return minimaxTTT(tttState, 'O').move;
}

function minimaxTTT(board, player) {
    const win = checkTTTWin(board);
    if (win) return { score: win.winner === 'O' ? 10 : -10 };
    const empties = board.map((v,i) => v==='' ? i : -1).filter(i => i >= 0);
    if (!empties.length) return { score: 0 };
    const opp = player === 'O' ? 'X' : 'O';
    const results = empties.map(i => {
        const nb = [...board]; nb[i] = player;
        return { move: i, score: minimaxTTT(nb, opp).score };
    });
    results.sort((a,b) => player === 'O' ? b.score - a.score : a.score - b.score);
    return results[0];
}

// ══════════════════════════════════════════════════
// GAME 2: TTT ULTRA 5×5 (4-in-a-row wins)
// ══════════════════════════════════════════════════
const SIZE5 = 5;
const WIN5  = 4; // need 4 in a row
let ttt5State = Array(25).fill('');

function startTTT5() {
    ttt5State = Array(25).fill('');
    hideBoardAll();
    show(ttt5Board);
    ttt5Board.innerHTML = '';
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.i = i;
        cell.addEventListener('click', () => onTTT5Click(i));
        ttt5Board.appendChild(cell);
    }
}

function onTTT5Click(i) {
    if (!gameActive || ttt5State[i] !== '') return;
    if (gameMode === 'bot' && currentPlayer === 'O') return;
    placeTTT5(i);
}

function placeTTT5(i) {
    ttt5State[i] = currentPlayer;
    const cell = ttt5Board.querySelector(`[data-i="${i}"]`);
    cell.textContent = currentPlayer === 'X' ? '✕' : '○';
    cell.classList.add(currentPlayer.toLowerCase(), 'taken', 'pop');
    const win = checkTTT5Win(ttt5State);
    if (win) return finishTTT5(win);
    if (ttt5State.every(c => c)) return endGame('draw');
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateTurn();
    if (gameMode === 'bot' && currentPlayer === 'O') scheduleBotMove();
}

function checkTTT5Win(board) {
    const dirs = [[0,1],[1,0],[1,1],[1,-1]];
    for (let r = 0; r < SIZE5; r++) {
        for (let c = 0; c < SIZE5; c++) {
            const v = board[r*SIZE5+c];
            if (!v) continue;
            for (const [dr,dc] of dirs) {
                const combo = [];
                for (let k = 0; k < WIN5; k++) {
                    const nr = r+dr*k, nc = c+dc*k;
                    if (nr<0||nr>=SIZE5||nc<0||nc>=SIZE5) break;
                    if (board[nr*SIZE5+nc] !== v) break;
                    combo.push(nr*SIZE5+nc);
                }
                if (combo.length === WIN5) return { winner: v, combo };
            }
        }
    }
    return null;
}

function finishTTT5(win) {
    gameActive = false;
    win.combo.forEach(i => ttt5Board.querySelector(`[data-i="${i}"]`).classList.add('winning'));
    setTimeout(() => endGame(win.winner === 'X' ? 'p1' : 'p2'), 400);
}

// TTT5 Bot
function botMoveTTT5() {
    if (!gameActive || currentPlayer !== 'O') return;
    updateTurn(true);
    const move = pickMoveTTT5();
    setTimeout(() => { if (gameActive) placeTTT5(move); }, 400);
}

function pickMoveTTT5() {
    if (difficulty === 'easy') return randomEmpty(ttt5State);
    // medium/hard: score-based heuristic
    const win = findImmediateN(ttt5State, 'O', SIZE5, WIN5);
    if (win !== -1) return win;
    const block = findImmediateN(ttt5State, 'X', SIZE5, WIN5);
    if (block !== -1) return block;
    if (difficulty === 'medium') return randomEmpty(ttt5State);
    // hard: look for fork / best heuristic
    return bestHeuristic5(ttt5State);
}

function bestHeuristic5(board) {
    const empties = board.map((v,i) => v==='' ? i : -1).filter(x=>x>=0);
    let bestScore = -Infinity, bestMove = empties[0];
    for (const i of empties) {
        const nb = [...board]; nb[i] = 'O';
        const s = scoreBoard5(nb, 'O') - scoreBoard5(nb, 'X');
        if (s > bestScore) { bestScore = s; bestMove = i; }
    }
    return bestMove;
}

function scoreBoard5(board, p) {
    const dirs = [[0,1],[1,0],[1,1],[1,-1]];
    let total = 0;
    for (let r = 0; r < SIZE5; r++) {
        for (let c = 0; c < SIZE5; c++) {
            for (const [dr,dc] of dirs) {
                let count = 0, open = 0;
                for (let k = 0; k < WIN5; k++) {
                    const nr=r+dr*k, nc=c+dc*k;
                    if (nr<0||nr>=SIZE5||nc<0||nc>=SIZE5) break;
                    const v = board[nr*SIZE5+nc];
                    if (v === p) count++;
                    else if (v === '') open++;
                    else { count=-1; break; }
                }
                if (count > 0) total += Math.pow(10, count) * (open > 0 ? 1 : 0);
            }
        }
    }
    return total;
}

// ══════════════════════════════════════════════════
// GAME 3: CONNECT 4 (7×6, 4-in-a-row)
// ══════════════════════════════════════════════════
const C4_COLS = 7, C4_ROWS = 6, C4_WIN = 4;
let c4State = []; // c4State[row][col]

function startC4() {
    c4State = Array.from({length: C4_ROWS}, () => Array(C4_COLS).fill(''));
    hideBoardAll();
    show(c4Wrap);
    // Build arrow buttons
    c4Arrows.innerHTML = '';
    for (let c = 0; c < C4_COLS; c++) {
        const btn = document.createElement('button');
        btn.className = 'c4-arrow';
        btn.textContent = '▼';
        btn.dataset.col = c;
        btn.addEventListener('click', () => onC4Drop(c));
        c4Arrows.appendChild(btn);
    }
    // Build grid (top-down display)
    c4Grid.innerHTML = '';
    for (let r = 0; r < C4_ROWS; r++) {
        for (let c = 0; c < C4_COLS; c++) {
            const cell = document.createElement('div');
            cell.className = 'c4-cell';
            cell.dataset.r = r;
            cell.dataset.c = c;
            c4Grid.appendChild(cell);
        }
    }
}

function onC4Drop(col) {
    if (!gameActive) return;
    if (gameMode === 'bot' && currentPlayer === 'O') return;
    dropC4(col);
}

function dropC4(col) {
    const row = lowestEmpty(col);
    if (row === -1) return; // full column
    c4State[row][col] = currentPlayer;
    const cell = c4Grid.querySelector(`[data-r="${row}"][data-c="${col}"]`);
    cell.classList.add(currentPlayer === 'X' ? 'r' : 'y', 'drop');
    // Update arrow visibility
    if (lowestEmpty(col) === -1) {
        c4Arrows.querySelectorAll('.c4-arrow')[col].disabled = true;
    }
    const win = checkC4Win();
    if (win) return finishC4(win);
    if (c4State.every(row => row.every(c => c))) return endGame('draw');
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateTurn();
    if (gameMode === 'bot' && currentPlayer === 'O') scheduleBotMove();
}

function lowestEmpty(col) {
    for (let r = C4_ROWS - 1; r >= 0; r--) {
        if (c4State[r][col] === '') return r;
    }
    return -1;
}

function checkC4Win() {
    const dirs = [[0,1],[1,0],[1,1],[1,-1]];
    for (let r = 0; r < C4_ROWS; r++) {
        for (let c = 0; c < C4_COLS; c++) {
            const v = c4State[r][c];
            if (!v) continue;
            for (const [dr,dc] of dirs) {
                const combo = [];
                for (let k = 0; k < C4_WIN; k++) {
                    const nr=r+dr*k, nc=c+dc*k;
                    if (nr<0||nr>=C4_ROWS||nc<0||nc>=C4_COLS) break;
                    if (c4State[nr][nc] !== v) break;
                    combo.push([nr,nc]);
                }
                if (combo.length === C4_WIN) return { winner: v, combo };
            }
        }
    }
    return null;
}

function finishC4(win) {
    gameActive = false;
    win.combo.forEach(([r,c]) => {
        c4Grid.querySelector(`[data-r="${r}"][data-c="${c}"]`).classList.add('winning-c4');
    });
    // Disable all arrows
    c4Arrows.querySelectorAll('.c4-arrow').forEach(btn => btn.disabled = true);
    setTimeout(() => endGame(win.winner === 'X' ? 'p1' : 'p2'), 500);
}

// C4 Bot
function botMoveC4() {
    if (!gameActive || currentPlayer !== 'O') return;
    updateTurn(true);
    const col = pickMoveC4();
    setTimeout(() => { if (gameActive) dropC4(col); }, 450);
}

function pickMoveC4() {
    const cols = availableCols();
    if (difficulty === 'easy') return cols[Math.floor(Math.random()*cols.length)];
    // Win check
    for (const c of cols) {
        if (simulateC4(c, 'O')) return c;
    }
    // Block check
    for (const c of cols) {
        if (simulateC4(c, 'X')) return c;
    }
    if (difficulty === 'medium') {
        // Prefer center
        const center = [3,2,4,1,5,0,6].find(c => cols.includes(c));
        return center !== undefined ? center : cols[0];
    }
    // Hard: alpha-beta minimax depth 5
    return alphaBetaC4(5).col;
}

function availableCols() {
    return Array.from({length:C4_COLS},(_,i)=>i).filter(c => lowestEmpty(c) !== -1);
}

function simulateC4(col, p) {
    const r = lowestEmpty(col); if (r === -1) return false;
    c4State[r][col] = p;
    const win = !!checkC4Win();
    c4State[r][col] = '';
    return win;
}

function alphaBetaC4(depth) {
    function score(d, p, alpha, beta) {
        const cols = availableCols();
        const win = checkC4Win();
        if (win) return win.winner === 'O' ? 1000 + d : -(1000 + d);
        if (!cols.length || d === 0) return heuristicC4();
        const opp = p === 'O' ? 'X' : 'O';
        const ordered = [3,2,4,1,5,0,6].filter(c => cols.includes(c));
        if (p === 'O') {
            let best = -Infinity;
            for (const c of ordered) {
                const r = lowestEmpty(c);
                c4State[r][c] = p;
                best = Math.max(best, score(d-1, opp, alpha, beta));
                c4State[r][c] = '';
                alpha = Math.max(alpha, best);
                if (alpha >= beta) break;
            }
            return best;
        } else {
            let best = Infinity;
            for (const c of ordered) {
                const r = lowestEmpty(c);
                c4State[r][c] = p;
                best = Math.min(best, score(d-1, opp, alpha, beta));
                c4State[r][c] = '';
                beta = Math.min(beta, best);
                if (alpha >= beta) break;
            }
            return best;
        }
    }
    const cols = [3,2,4,1,5,0,6].filter(c => availableCols().includes(c));
    let bestScore = -Infinity, bestCol = cols[0];
    for (const c of cols) {
        const r = lowestEmpty(c);
        c4State[r][c] = 'O';
        const s = score(depth-1, 'X', -Infinity, Infinity);
        c4State[r][c] = '';
        if (s > bestScore) { bestScore = s; bestCol = c; }
    }
    return { col: bestCol };
}

function heuristicC4() {
    const dirs = [[0,1],[1,0],[1,1],[1,-1]];
    let total = 0;
    for (let r = 0; r < C4_ROWS; r++) {
        for (let c = 0; c < C4_COLS; c++) {
            for (const [dr,dc] of dirs) {
                let o=0, x=0;
                for (let k=0; k<C4_WIN; k++) {
                    const nr=r+dr*k, nc=c+dc*k;
                    if (nr<0||nr>=C4_ROWS||nc<0||nc>=C4_COLS) break;
                    const v = c4State[nr][nc];
                    if (v==='O') o++;
                    else if (v==='X') x++;
                }
                if (x===0 && o>0) total += Math.pow(3,o);
                if (o===0 && x>0) total -= Math.pow(3,x);
            }
        }
    }
    return total;
}

// ══════════════════════════════════════════════════
// SHARED UTILITIES
// ══════════════════════════════════════════════════
function randomEmpty(board) {
    const e = board.map((v,i)=>v===''?i:-1).filter(i=>i>=0);
    return e[Math.floor(Math.random()*e.length)];
}

function findImmediate(board, p) {
    for (const [a,b,c] of TTT_WINS) {
        const cells = [board[a],board[b],board[c]];
        if (cells.filter(v=>v===p).length===2 && cells.includes('')) {
            return [a,b,c][cells.indexOf('')];
        }
    }
    return -1;
}

function findImmediateN(board, p, size, win) {
    const dirs = [[0,1],[1,0],[1,1],[1,-1]];
    for (let r=0; r<size; r++) {
        for (let c=0; c<size; c++) {
            for (const [dr,dc] of dirs) {
                const idx=[], vals=[];
                for (let k=0; k<win; k++) {
                    const nr=r+dr*k, nc=c+dc*k;
                    if (nr<0||nr>=size||nc<0||nc>=size) break;
                    idx.push(nr*size+nc);
                    vals.push(board[nr*size+nc]);
                }
                if (idx.length===win && vals.filter(v=>v===p).length===win-1 && vals.includes('')) {
                    return idx[vals.indexOf('')];
                }
            }
        }
    }
    return -1;
}

function scheduleBotMove() {
    updateTurn(true);
    setTimeout(() => {
        if (!gameActive) return;
        if (currentGame === 'ttt')  botMoveTTT();
        if (currentGame === 'ttt5') botMoveTTT5();
        if (currentGame === 'c4')   botMoveC4();
    }, 200);
}

// ── END GAME ───────────────────────────────────────
function endGame(result) {
    gameActive = false;
    if (result === 'p1') {
        scores.p1++;
        resultEmoji.textContent = '🎉';
        resultTitle.textContent = gameMode === 'bot' ? t('youWin') : t('p1Wins');
    } else if (result === 'p2') {
        scores.p2++;
        resultEmoji.textContent = gameMode === 'bot' ? '🤖' : '🎉';
        resultTitle.textContent = gameMode === 'bot' ? t('botWins') : t('p2Wins');
    } else {
        scores.draw++;
        resultEmoji.textContent = '🤝';
        resultTitle.textContent = t('drawMsg');
    }
    updateScores();
    hide(turnBar);
    setTimeout(() => show(resultModal), 300);
}

// ── SETTINGS ───────────────────────────────────────
function openSettings() {
    id('langSelect').value  = lang;
    id('firstSelect').value = firstMode;
    show(id('settingsModal'));
}

[id('settingsBtn'), id('settingsBtnGame')].forEach(b => b.addEventListener('click', openSettings));
id('closeSettings').addEventListener('click', () => hide(id('settingsModal')));

id('langSelect').addEventListener('change', e => {
    lang = e.target.value;
    localStorage.setItem('lang', lang);
    updateScores();
    if (gameActive) updateTurn();
});
id('firstSelect').addEventListener('change', e => {
    firstMode = e.target.value;
    localStorage.setItem('firstMode', firstMode);
});

// Close overlay on backdrop click
[id('settingsModal'), id('resultModal')].forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) hide(m); });
});
