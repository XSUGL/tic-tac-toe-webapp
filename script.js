let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = false;
let gameMode = 'bot';
let difficulty = 'easy';
let firstMoveMode = localStorage.getItem('firstMoveMode') || 'player';
let gameCount = 0;

let scores = {
    player1: 0,
    player2: 0,
    draw: 0
};

let currentUser = {
    isLoggedIn: false,
    email: '',
    nickname: '',
    isGuest: true
};

let language = localStorage.getItem('language') || 'en';

const translations = {
    en: {
        guestMode: 'Guest Mode',
        loggedInAs: 'Logged in as',
        chooseModeTitle: 'Choose Game Mode',
        vsBotMode: '🤖 vs Bot',
        twoPlayerMode: '👥 2 Players',
        startGame: '🎮 Start Game',
        restart: '🔄 Restart',
        newGame: '🎯 New Game',
        playerXTurn: 'Player X Turn',
        playerOTurn: 'Player O Turn',
        player1Turn: 'Player 1 Turn',
        player2Turn: 'Player 2 Turn',
        botTurn: 'Bot is thinking...',
        yourTurn: 'Your turn!',
        gameMode: 'Mode',
        difficulty: 'Difficulty',
        botMode: 'vs Bot',
        playerMode: '2 Players',
        youWin: 'You Win! 🎉',
        botWins: 'Bot Wins! 🤖',
        player1Wins: 'Player 1 Wins! 🎉',
        player2Wins: 'Player 2 Wins! 🎉',
        draw: 'Draw! 🤝',
        gameOver: 'Game Over!',
        playAgain: 'Play Again',
        player1: 'Player 1',
        player2: 'Player 2',
        bot: 'Bot',
        draws: 'Draws',
        account: 'Account',
        email: 'Email',
        nickname: 'Nickname',
        password: 'Password',
        loginRegister: 'Login / Register',
        continueGuest: 'Continue as Guest',
        logout: 'Logout',
        settings: 'Settings',
        language: 'Language',
        firstMove: 'Who goes first',
        playerFirst: 'Player Always First',
        alternating: 'Alternating',
        botFirst: 'Bot Always First',
        enterCode: 'Enter Code',
        check: 'Check',
        languageSaved: 'Language saved!',
        enterCodePrompt: 'Please enter a code',
        invalidCode: 'Invalid code',
        specialTheme: 'Special theme unlocked!'
    },
    ru: {
        guestMode: 'Гостевой режим',
        loggedInAs: 'Вошли как',
        chooseModeTitle: 'Выберите режим игры',
        vsBotMode: '🤖 против Бота',
        twoPlayerMode: '👥 На двоих',
        startGame: '🎮 Начать игру',
        restart: '🔄 Перезапуск',
        newGame: '🎯 Новая игра',
        playerXTurn: 'Ход игрока X',
        playerOTurn: 'Ход игрока O',
        player1Turn: 'Ход игрока 1',
        player2Turn: 'Ход игрока 2',
        botTurn: 'Бот думает...',
        yourTurn: 'Ваш ход!',
        gameMode: 'Режим',
        difficulty: 'Сложность',
        botMode: 'против Бота',
        playerMode: 'На двоих',
        youWin: 'Вы выиграли! 🎉',
        botWins: 'Бот выиграл! 🤖',
        player1Wins: 'Игрок 1 выиграл! 🎉',
        player2Wins: 'Игрок 2 выиграл! 🎉',
        draw: 'Ничья! 🤝',
        gameOver: 'Игра окончена!',
        playAgain: 'Играть еще',
        player1: 'Игрок 1',
        player2: 'Игрок 2',
        bot: 'Бот',
        draws: 'Ничьи',
        account: 'Аккаунт',
        email: 'Электронная почта',
        nickname: 'Никнейм',
        password: 'Пароль',
        loginRegister: 'Войти / Регистрация',
        continueGuest: 'Продолжить как гость',
        logout: 'Выйти',
        settings: 'Настройки',
        language: 'Язык',
        firstMove: 'Кто ходит первым',
        playerFirst: 'Игрок всегда первый',
        alternating: 'По очереди',
        botFirst: 'Бот всегда первый',
        enterCode: 'Введите код',
        check: 'Проверить',
        languageSaved: 'Язык сохранен!',
        enterCodePrompt: 'Пожалуйста, введите код',
        invalidCode: 'Неверный код',
        specialTheme: 'Специальная тема разблокирована!'
    },
    it: {
        guestMode: 'Modalità ospite',
        loggedInAs: 'Collegato come',
        chooseModeTitle: 'Scegli modalità di gioco',
        vsBotMode: '🤖 vs Bot',
        twoPlayerMode: '👥 2 Giocatori',
        startGame: '🎮 Inizia gioco',
        restart: '🔄 Ricomincia',
        newGame: '🎯 Nuovo gioco',
        playerXTurn: 'Turno giocatore X',
        playerOTurn: 'Turno giocatore O',
        player1Turn: 'Turno giocatore 1',
        player2Turn: 'Turno giocatore 2',
        botTurn: 'Il bot sta pensando...',
        yourTurn: 'Tocca a te!',
        gameMode: 'Modalità',
        difficulty: 'Difficoltà',
        botMode: 'vs Bot',
        playerMode: '2 Giocatori',
        youWin: 'Hai vinto! 🎉',
        botWins: 'Il bot ha vinto! 🤖',
        player1Wins: 'Giocatore 1 ha vinto! 🎉',
        player2Wins: 'Giocatore 2 ha vinto! 🎉',
        draw: 'Pareggio! 🤝',
        gameOver: 'Fine partita!',
        playAgain: 'Gioca ancora',
        player1: 'Giocatore 1',
        player2: 'Giocatore 2',
        bot: 'Bot',
        draws: 'Pareggi',
        account: 'Account',
        email: 'Email',
        nickname: 'Soprannome',
        password: 'Password',
        loginRegister: 'Accedi / Registrati',
        continueGuest: 'Continua come ospite',
        logout: 'Esci',
        settings: 'Impostazioni',
        language: 'Lingua',
        firstMove: 'Chi va per primo',
        playerFirst: 'Giocatore sempre primo',
        alternating: 'Alternato',
        botFirst: 'Bot sempre primo',
        enterCode: 'Inserisci codice',
        check: 'Verifica',
        languageSaved: 'Lingua salvata!',
        enterCodePrompt: 'Per favore, inserisci un codice',
        invalidCode: 'Codice non valido',
        specialTheme: 'Tema speciale sbloccato!'
    }
};

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

function checkWin(player) {
    for (let combination of winningCombinations) {
        if (combination.every(index => board[index] === player)) {
            return { won: true, combination };
        }
    }
    return { won: false };
}

function checkDraw() {
    return board.every(cell => cell !== '');
}

function minimax(newBoard, player, depth = 0, maxDepth = 9) {
    console.log(`Minimax called: player=${player}, depth=${depth}, board=${newBoard}`);

    // Ограничение глубины рекурсии
    if (depth >= maxDepth) {
        console.log('Max depth reached, returning draw score');
        return { score: 0 };
    }

    // Проверка выигрыша для X и O
    const xWin = checkWin('X');
    const oWin = checkWin('O');
    if (xWin.won) {
        console.log('X wins detected');
        return { score: -100 + depth }; // Увеличенный штраф для X
    }
    if (oWin.won) {
        console.log('O wins detected');
        return { score: 100 - depth }; // Увеличенная награда для O
    }
    if (checkDraw()) {
        console.log('Draw detected');
        return { score: 0 };
    }

    const scores = [];
    const moves = [];
    const opponent = player === 'O' ? 'X' : 'O';

    // Собираем пустые клетки
    const emptyCells = newBoard.reduce((acc, cell, idx) => {
        if (cell === '') acc.push(idx);
        return acc;
    }, []);

    if (emptyCells.length === 0) {
        console.log('No empty cells, returning draw score');
        return { score: 0 };
    }

    console.log(`Empty cells: ${emptyCells}`);

    // Перебор ходов
    for (let i = 0; i < emptyCells.length; i++) {
        const index = emptyCells[i];
        newBoard[index] = player;
        console.log(`Trying move: index=${index}, player=${player}, board=${newBoard}`);
        const result = minimax(newBoard, opponent, depth + 1, maxDepth);
        scores.push(result.score);
        moves.push(index);
        newBoard[index] = ''; // Откатываем ход
        console.log(`Undo move: index=${index}, board=${newBoard}`);
    }

    if (player === 'O') {
        const maxScoreIndex = scores.indexOf(Math.max(...scores));
        console.log(`Best move for O: index=${moves[maxScoreIndex]}, score=${scores[maxScoreIndex]}`);
        return { score: scores[maxScoreIndex], move: moves[maxScoreIndex] };
    } else {
        const minScoreIndex = scores.indexOf(Math.min(...scores));
        console.log(`Best move for X: index=${moves[minScoreIndex]}, score=${scores[minScoreIndex]}`);
        return { score: scores[minScoreIndex], move: moves[minScoreIndex] };
    }
}

function botMove() {
    if (gameMode !== 'bot' || !gameActive) {
        console.log('Bot move skipped: gameMode or gameActive invalid');
        return;
    }

    let move;
    if (difficulty === 'easy') {
        const emptyCells = board.reduce((acc, cell, idx) => {
            if (cell === '') acc.push(idx);
            return acc;
        }, []);
        move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        console.log(`Easy bot move: ${move}`);
    } else if (difficulty === 'medium') {
        // Проверяем выигрышный ход для O
        for (let combo of winningCombinations) {
            const [a, b, c] = combo;
            if (board[a] === 'O' && board[b] === 'O' && board[c] === '') {
                move = c;
                break;
            }
            if (board[a] === 'O' && board[c] === 'O' && board[b] === '') {
                move = b;
                break;
            }
            if (board[b] === 'O' && board[c] === 'O' && board[a] === '') {
                move = a;
                break;
            }
        }
        // Проверяем блокировку X
        if (move === undefined) {
            for (let combo of winningCombinations) {
                const [a, b, c] = combo;
                if (board[a] === 'X' && board[b] === 'X' && board[c] === '') {
                    move = c;
                    break;
                }
                if (board[a] === 'X' && board[c] === 'X' && board[b] === '') {
                    move = b;
                    break;
                }
                if (board[b] === 'X' && board[c] === 'X' && board[a] === '') {
                    move = a;
                    break;
                }
            }
        }
        // Если нет выигрыша или блокировки, ходим случайно
        if (move === undefined) {
            const emptyCells = board.reduce((acc, cell, idx) => {
                if (cell === '') acc.push(idx);
                return acc;
            }, []);
            move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
        console.log(`Medium bot move: ${move}`);
    } else if (difficulty === 'hard') {
        console.log('Starting hard bot move calculation');
        // Проверяем немедленный выигрыш для O
        for (let combo of winningCombinations) {
            const [a, b, c] = combo;
            if (board[a] === 'O' && board[b] === 'O' && board[c] === '') {
                move = c;
                console.log(`Hard bot immediate win: ${move}`);
                break;
            }
            if (board[a] === 'O' && board[c] === 'O' && board[b] === '') {
                move = b;
                console.log(`Hard bot immediate win: ${move}`);
                break;
            }
            if (board[b] === 'O' && board[c] === 'O' && board[a] === '') {
                move = a;
                console.log(`Hard bot immediate win: ${move}`);
                break;
            }
        }
        // Проверяем немедленную блокировку X
        if (move === undefined) {
            for (let combo of winningCombinations) {
                const [a, b, c] = combo;
                if (board[a] === 'X' && board[b] === 'X' && board[c] === '') {
                    move = c;
                    console.log(`Hard bot immediate block: ${move}`);
                    break;
                }
                if (board[a] === 'X' && board[c] === 'X' && board[b] === '') {
                    move = b;
                    console.log(`Hard bot immediate block: ${move}`);
                    break;
                }
                if (board[b] === 'X' && board[c] === 'X' && board[a] === '') {
                    move = a;
                    console.log(`Hard bot immediate block: ${move}`);
                    break;
                }
            }
        }
        // Если нет немедленных ходов, используем minimax
        if (move === undefined) {
            const result = minimax([...board], 'O', 0, 9);
            move = result.move;
            console.log(`Hard bot minimax move: ${move}, score: ${result.score}`);
        }
    }

    if (move !== undefined) {
        board[move] = currentPlayer;
        const cell = document.querySelector(`.cell[data-index="${move}"]`);
        if (!cell) {
            console.error(`Cell with index ${move} not found`);
            return;
        }
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer.toLowerCase(), 'disabled');

        const winCheck = checkWin(currentPlayer);
        if (winCheck.won) {
            winCheck.combination.forEach(index => {
                document.querySelector(`.cell[data-index="${index}"]`).classList.add('winning');
            });
            endGame(currentPlayer === 'X' ? 'youWin' : 'botWins');
        } else if (checkDraw()) {
            endGame('draw');
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            updateTurnIndicator();
            if (gameMode === 'bot' && currentPlayer === 'O') {
                console.log('Scheduling next bot move');
                setTimeout(botMove, 500);
            }
        }
    } else {
        console.error('Bot failed to find a valid move');
    }
}

function updateTurnIndicator() {
    const turnIndicator = document.getElementById('turnIndicator');
    const turnText = document.getElementById('turnText');
    if (!turnIndicator || !turnText) {
        console.error('Turn indicator elements not found');
        return;
    }
    turnIndicator.style.display = 'block';
    turnIndicator.className = `turn-indicator player-${currentPlayer.toLowerCase()}`;
    turnText.textContent = gameMode === 'bot' 
        ? (currentPlayer === 'X' ? translations[language].yourTurn : translations[language].botTurn)
        : (currentPlayer === 'X' ? translations[language].playerXTurn : translations[language].playerOTurn);
}

function endGame(result) {
    gameActive = false;
    const gameOverModal = document.getElementById('gameOverModal');
    const gameOverMessage = document.getElementById('gameOverMessage');
    if (!gameOverModal || !gameOverMessage) {
        console.error('Game over modal elements not found');
        return;
    }
    gameOverModal.classList.add('show');

    if (result === 'youWin') {
        scores.player1++;
        gameOverMessage.textContent = translations[language].youWin;
    } else if (result === 'botWins') {
        scores.player2++;
        gameOverMessage.textContent = translations[language].botWins;
    } else if (result === 'player1Wins') {
        scores.player1++;
        gameOverMessage.textContent = translations[language].player1Wins;
    } else if (result === 'player2Wins') {
        scores.player2++;
        gameOverMessage.textContent = translations[language].player2Wins;
    } else {
        scores.draw++;
        gameOverMessage.textContent = translations[language].draw;
    }

    updateScores();
}

function updateScores() {
    const score1Value = document.getElementById('score1Value');
    const score2Value = document.getElementById('score2Value');
    const drawScore = document.getElementById('drawScore');
    if (!score1Value || !score2Value || !drawScore) {
        console.error('Score elements not found');
        return;
    }
    score1Value.textContent = scores.player1;
    score2Value.textContent = scores.player2;
    drawScore.textContent = scores.draw;
}

function updateSettingsUI() {
    const settingsModal = document.getElementById('settingsModal');
    if (!settingsModal) {
        console.error('Settings modal not found');
        return;
    }
    const languageSelect = document.getElementById('languageSelect');
    const firstMoveSelect = document.getElementById('firstMoveSelect');
    const codeResult = document.getElementById('codeResult');

    if (languageSelect && firstMoveSelect && codeResult) {
        document.getElementById('settingsTitle').textContent = translations[language].settings;
        document.getElementById('languageLabel').textContent = translations[language].language;
        document.getElementById('firstMoveLabel').textContent = translations[language].firstMove;
        document.getElementById('codeLabel').textContent = translations[language].enterCode;
        document.getElementById('checkCodeBtn').textContent = translations[language].check;

        languageSelect.value = language;
        firstMoveSelect.innerHTML = `
            <option value="player">${translations[language].playerFirst}</option>
            <option value="alternating">${translations[language].alternating}</option>
            <option value="bot">${translations[language].botFirst}</option>
        `;
        firstMoveSelect.value = firstMoveMode;
    } else {
        console.error('Settings UI elements not found');
    }
}

function updateUI() {
    const elements = {
        modeTitle: document.getElementById('modeTitle'),
        botModeBtn: document.getElementById('botModeBtn'),
        playerModeBtn: document.getElementById('playerModeBtn'),
        startGameBtn: document.getElementById('startGameBtn'),
        restartBtn: document.getElementById('restartBtn'),
        newGameBtn: document.getElementById('newGameBtn'),
        score1Label: document.getElementById('score1Label'),
        score2Label: document.getElementById('score2Label'),
        drawLabel: document.getElementById('drawLabel'),
        accountModalTitle: document.getElementById('accountModalTitle'),
        emailLabel: document.getElementById('emailLabel'),
        nicknameLabel: document.getElementById('nicknameLabel'),
        passwordLabel: document.getElementById('passwordLabel'),
        loginBtn: document.getElementById('loginBtn'),
        guestBtn: document.getElementById('guestBtn'),
        logoutBtn: document.getElementById('logoutBtn'),
        gameOverTitle: document.getElementById('gameOverTitle'),
        playAgainBtn: document.getElementById('playAgainBtn'),
        newGameFromOverBtn: document.getElementById('newGameFromOverBtn')
    };

    for (let key in elements) {
        if (!elements[key]) {
            console.error(`Element ${key} not found`);
            return;
        }
    }

    elements.modeTitle.textContent = translations[language].chooseModeTitle;
    elements.botModeBtn.textContent = translations[language].vsBotMode;
    elements.playerModeBtn.textContent = translations[language].twoPlayerMode;
    elements.startGameBtn.textContent = translations[language].startGame;
    elements.restartBtn.textContent = translations[language].restart;
    elements.newGameBtn.textContent = translations[language].newGame;
    elements.score1Label.textContent = translations[language].player1;
    elements.score2Label.textContent = gameMode === 'bot' ? translations[language].bot : translations[language].player2;
    elements.drawLabel.textContent = translations[language].draws;
    elements.accountModalTitle.textContent = translations[language].account;
    elements.emailLabel.textContent = translations[language].email;
    elements.nicknameLabel.textContent = translations[language].nickname;
    elements.passwordLabel.textContent = translations[language].password;
    elements.loginBtn.textContent = translations[language].loginRegister;
    elements.guestBtn.textContent = translations[language].continueGuest;
    elements.logoutBtn.textContent = translations[language].logout;
    elements.gameOverTitle.textContent = translations[language].gameOver;
    elements.playAgainBtn.textContent = translations[language].playAgain;
    elements.newGameFromOverBtn.textContent = translations[language].newGame;
    updateUserInfo();
    updateSettingsUI();
}

function updateUserInfo() {
    const userInfo = document.getElementById('userInfo');
    const userInfoText = document.getElementById('userInfoText');
    if (!userInfo || !userInfoText) {
        console.error('User info elements not found');
        return;
    }
    if (currentUser.isGuest) {
        userInfo.className = 'user-info guest';
        userInfoText.textContent = translations[language].guestMode;
    } else {
        userInfo.className = 'user-info logged-in';
        userInfoText.textContent = `${translations[language].loggedInAs} ${currentUser.nickname}`;
    }
}

function applySpecialTheme() {
    if (localStorage.getItem('specialTheme') === 'true') {
        document.body.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)';
    } else {
        document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
}

document.getElementById('settingsBtn').addEventListener('click', () => {
    const settingsModal = document.getElementById('settingsModal');
    if (settingsModal) {
        settingsModal.classList.add('show');
        updateSettingsUI();
    } else {
        console.error('Settings modal not found');
    }
});

document.getElementById('closeSettingsBtn').addEventListener('click', () => {
    const settingsModal = document.getElementById('settingsModal');
    if (settingsModal) {
        settingsModal.classList.remove('show');
    } else {
        console.error('Settings modal not found');
    }
});

document.getElementById('languageSelect').addEventListener('change', (e) => {
    language = e.target.value;
    localStorage.setItem('language', language);
    updateUI();
    const codeResult = document.getElementById('codeResult');
    if (codeResult) {
        codeResult.textContent = translations[language].languageSaved;
        codeResult.className = 'code-result success';
        setTimeout(() => {
            codeResult.className = 'code-result hidden';
        }, 2000);
    }
});

document.getElementById('firstMoveSelect').addEventListener('change', (e) => {
    firstMoveMode = e.target.value;
    localStorage.setItem('firstMoveMode', firstMoveMode);
});

document.getElementById('checkCodeBtn').addEventListener('click', () => {
    const code = document.getElementById('codeInput').value;
    const codeResult = document.getElementById('codeResult');
    if (!codeResult) {
        console.error('Code result element not found');
        return;
    }
    if (!code) {
        codeResult.textContent = translations[language].enterCodePrompt;
        codeResult.className = 'code-result error';
    } else if (code === 'GROK2025') {
        codeResult.textContent = translations[language].specialTheme;
        codeResult.className = 'code-result special';
        localStorage.setItem('specialTheme', 'true');
        applySpecialTheme();
    } else {
        codeResult.textContent = translations[language].invalidCode;
        codeResult.className = 'code-result error';
    }
    setTimeout(() => {
        codeResult.className = 'code-result hidden';
    }, 2000);
});

document.getElementById('accountBtn').addEventListener('click', () => {
    const accountModal = document.getElementById('accountModal');
    if (!accountModal) {
        console.error('Account modal not found');
        return;
    }
    accountModal.classList.add('show');
    if (currentUser.isLoggedIn) {
        document.getElementById('authForm').style.display = 'none';
        document.getElementById('accountInfo').style.display = 'block';
        document.getElementById('userEmail').textContent = currentUser.email;
        document.getElementById('userNickname').textContent = currentUser.nickname;
    } else {
        document.getElementById('authForm').style.display = 'block';
        document.getElementById('accountInfo').style.display = 'none';
    }
});

document.getElementById('closeAccountBtn').addEventListener('click', () => {
    const accountModal = document.getElementById('accountModal');
    if (accountModal) {
        accountModal.classList.remove('show');
    } else {
        console.error('Account modal not found');
    }
});

document.getElementById('loginBtn').addEventListener('click', () => {
    const email = document.getElementById('emailInput').value;
    const nickname = document.getElementById('nicknameInput').value;
    const password = document.getElementById('passwordInput').value;
    if (email && nickname && password) {
        currentUser = { isLoggedIn: true, email, nickname, isGuest: false };
        updateUserInfo();
        document.getElementById('accountModal').classList.remove('show');
    }
});

document.getElementById('guestBtn').addEventListener('click', () => {
    currentUser = { isLoggedIn: false, email: '', nickname: '', isGuest: true };
    updateUserInfo();
    document.getElementById('accountModal').classList.remove('show');
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    currentUser = { isLoggedIn: false, email: '', nickname: '', isGuest: true };
    updateUserInfo();
    document.getElementById('accountModal').classList.remove('show');
});

document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', () => {
        if (!gameActive || cell.classList.contains('disabled')) return;

        const index = cell.dataset.index;
        if (board[index] === '') {
            board[index] = currentPlayer;
            cell.textContent = currentPlayer;
            cell.classList.add(currentPlayer.toLowerCase(), 'disabled');

            const winCheck = checkWin(currentPlayer);
            if (winCheck.won) {
                winCheck.combination.forEach(index => {
                    document.querySelector(`.cell[data-index="${index}"]`).classList.add('winning');
                });
                endGame(gameMode === 'bot' ? (currentPlayer === 'X' ? 'youWin' : 'botWins') : (currentPlayer === 'X' ? 'player1Wins' : 'player2Wins'));
            } else if (checkDraw()) {
                endGame('draw');
            } else {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                updateTurnIndicator();
                if (gameMode === 'bot' && currentPlayer === 'O') {
                    console.log('Scheduling bot move after player');
                    setTimeout(botMove, 500);
                }
            }
        }
    });
});

document.getElementById('startGameBtn').addEventListener('click', () => {
    gameActive = true;
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = firstMoveMode === 'player' ? 'X' : (firstMoveMode === 'bot' ? 'O' : (gameCount % 2 === 0 ? 'X' : 'O'));
    gameCount++;
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'disabled', 'winning');
    });
    document.getElementById('gameModeSelection').style.display = 'none';
    document.getElementById('difficultySection').style.display = 'none';
    document.getElementById('startGameSection').style.display = 'none';
    document.getElementById('controlButtons').style.display = 'flex';
    document.getElementById('turnIndicator').style.display = 'block';
    updateTurnIndicator();
    if (gameMode === 'bot' && currentPlayer === 'O') {
        console.log('Starting game with bot first move');
        setTimeout(botMove, 500);
    }
});

document.getElementById('restartBtn').addEventListener('click', () => {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = firstMoveMode === 'player' ? 'X' : (firstMoveMode === 'bot' ? 'O' : (gameCount % 2 === 0 ? 'X' : 'O'));
    gameActive = true;
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'disabled', 'winning');
    });
    document.getElementById('gameOverModal').classList.remove('show');
    updateTurnIndicator();
    if (gameMode === 'bot' && currentPlayer === 'O') {
        console.log('Restarting game with bot first move');
        setTimeout(botMove, 500);
    }
});

document.getElementById('newGameBtn').addEventListener('click', () => {
    gameActive = false;
    board = ['', '', '', '', '', '', '', '', ''];
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'disabled', 'winning');
    });
    document.getElementById('gameModeSelection').style.display = 'block';
    document.getElementById('difficultySection').style.display = gameMode === 'bot' ? 'block' : 'none';
    document.getElementById('startGameSection').style.display = 'block';
    document.getElementById('controlButtons').style.display = 'none';
    document.getElementById('turnIndicator').style.display = 'none';
});

document.getElementById('playAgainBtn').addEventListener('click', () => {
    document.getElementById('restartBtn').click();
});

document.getElementById('newGameFromOverBtn').addEventListener('click', () => {
    document.getElementById('newGameBtn').click();
    document.getElementById('gameOverModal').classList.remove('show');
});

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gameMode = btn.dataset.mode;
        document.getElementById('difficultySection').style.display = gameMode === 'bot' ? 'block' : 'none';
        document.getElementById('score2Label').textContent = gameMode === 'bot' ? translations[language].bot : translations[language].player2;
    });
});

document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        difficulty = btn.dataset.difficulty;
    });
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing UI');
    updateUI();
    applySpecialTheme();
});