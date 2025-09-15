// Game state
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let difficulty = 'easy';
let scores = {
    player: 0,
    bot: 0,
    draw: 0
};

// Language translations
const translations = {
    en: {
        restart: 'Restart',
        player: 'Player',
        bot: 'Bot',
        draw: 'Draw',
        yourTurn: 'Your turn!',
        botTurn: 'Bot is thinking...',
        youWin: 'You win!',
        botWins: 'Bot wins!',
        gameDraw: "It's a draw!",
        gameOver: 'Game Over'
    },
    ru: {
        restart: 'Перезапуск',
        player: 'Игрок',
        bot: 'Бот',
        draw: 'Ничья',
        yourTurn: 'Ваш ход!',
        botTurn: 'Бот думает...',
        youWin: 'Вы выиграли!',
        botWins: 'Бот выиграл!',
        gameDraw: 'Ничья!',
        gameOver: 'Игра окончена'
    },
    it: {
        restart: 'Ricomincia',
        player: 'Giocatore',
        bot: 'Bot',
        draw: 'Pareggio',
        yourTurn: 'Il tuo turno!',
        botTurn: 'Il bot sta pensando...',
        youWin: 'Hai vinto!',
        botWins: 'Il bot ha vinto!',
        gameDraw: 'È un pareggio!',
        gameOver: 'Game Over'
    }
};

// Winning combinations
const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// DOM elements
const cells = document.querySelectorAll('.cell');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const restartBtn = document.getElementById('restartBtn');
const gameStatus = document.getElementById('gameStatus');
const playerScoreEl = document.getElementById('playerScore');
const botScoreEl = document.getElementById('botScore');
const drawScoreEl = document.getElementById('drawScore');
const playerLabelEl = document.getElementById('playerLabel');
const botLabelEl = document.getElementById('botLabel');
const drawLabelEl = document.getElementById('drawLabel');

// Initialize game
document.addEventListener('DOMContentLoaded', function() {
    loadScores();
    loadLanguage();
    initializeGame();
});

function initializeGame() {
    // Add event listeners
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });

    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', handleDifficultyChange);
    });

    restartBtn.addEventListener('click', restartGame);

    // Set initial status
    updateGameStatus();
    updateScoreDisplay();
}

function handleCellClick(event) {
    const index = event.target.dataset.index;
    
    if (board[index] !== '' || !gameActive || currentPlayer !== 'X') {
        return;
    }

    makeMove(index, 'X');
    
    if (gameActive) {
        currentPlayer = 'O';
        updateGameStatus();
        setTimeout(makeBotMove, 500);
    }
}

function makeMove(index, player) {
    board[index] = player;
    const cell = cells[index];
    cell.textContent = player;
    cell.classList.add(player.toLowerCase());

    if (checkWinner()) {
        gameActive = false;
        highlightWinningCells();
        updateScore(player === 'X' ? 'player' : 'bot');
    } else if (board.every(cell => cell !== '')) {
        gameActive = false;
        updateScore('draw');
    }
    
    updateGameStatus();
}

function makeBotMove() {
    if (!gameActive) return;

    let moveIndex;
    
    switch(difficulty) {
        case 'easy':
            moveIndex = getRandomMove();
            break;
        case 'medium':
            moveIndex = getMediumMove();
            break;
        case 'hard':
            moveIndex = getHardMove();
            break;
    }

    if (moveIndex !== -1) {
        makeMove(moveIndex, 'O');
        currentPlayer = 'X';
    }
}

function getRandomMove() {
    const availableMoves = board
        .map((cell, index) => cell === '' ? index : null)
        .filter(val => val !== null);
    
    return availableMoves.length > 0 
        ? availableMoves[Math.floor(Math.random() * availableMoves.length)]
        : -1;
}

function getMediumMove() {
    // First, try to win
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            if (checkWinner() === 'O') {
                board[i] = '';
                return i;
            }
            board[i] = '';
        }
    }

    // Then, try to block player's win
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'X';
            if (checkWinner() === 'X') {
                board[i] = '';
                return i;
            }
            board[i] = '';
        }
    }

    // Otherwise, make random move
    return getRandomMove();
}

function getHardMove() {
    // Placeholder for advanced AI (could implement Minimax algorithm)
    // For now, use medium strategy
    return getMediumMove();
}

function checkWinner() {
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

function highlightWinningCells() {
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            cells[a].classList.add('winning');
            cells[b].classList.add('winning');
            cells[c].classList.add('winning');
            break;
        }
    }
}

function handleDifficultyChange(event) {
    difficultyButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    difficulty = event.target.dataset.difficulty;
}

function restartGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winning');
    });
    
    updateGameStatus();
}

function updateScore(winner) {
    scores[winner]++;
    saveScores();
    updateScoreDisplay();
}

function updateScoreDisplay() {
    playerScoreEl.textContent = scores.player;
    botScoreEl.textContent = scores.bot;
    drawScoreEl.textContent = scores.draw;
}

function updateGameStatus() {
    const lang = localStorage.getItem('gameLanguage') || 'en';
    const t = translations[lang];
    
    if (!gameActive) {
        const winner = checkWinner();
        if (winner === 'X') {
            gameStatus.textContent = t.youWin;
        } else if (winner === 'O') {
            gameStatus.textContent = t.botWins;
        } else {
            gameStatus.textContent = t.gameDraw;
        }
    } else {
        if (currentPlayer === 'X') {
            gameStatus.textContent = t.yourTurn;
        } else {
            gameStatus.textContent = t.botTurn;
        }
    }
}

function loadLanguage() {
    const lang = localStorage.getItem('gameLanguage') || 'en';
    const t = translations[lang];
    
    restartBtn.textContent = t.restart;
    playerLabelEl.textContent = t.player;
    botLabelEl.textContent = t.bot;
    drawLabelEl.textContent = t.draw;
    
    updateGameStatus();
}

function saveScores() {
    localStorage.setItem('ticTacToeScores', JSON.stringify(scores));
}

function loadScores() {
    const savedScores = localStorage.getItem('ticTacToeScores');
    if (savedScores) {
        scores = JSON.parse(savedScores);
    }
}

// Listen for language changes
window.addEventListener('storage', function(e) {
    if (e.key === 'gameLanguage') {
        loadLanguage();
    }
});