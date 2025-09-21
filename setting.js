const translations = {
    en: {
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

let language = localStorage.getItem('language') || 'en';
let firstMoveMode = localStorage.getItem('firstMoveMode') || 'player';

function updateSettingsUI() {
    const languageSelect = document.getElementById('languageSelect');
    const firstMoveSelect = document.getElementById('firstMoveSelect');
    const codeResult = document.getElementById('codeResult');

    if (!languageSelect || !firstMoveSelect || !codeResult) {
        console.error('Settings UI elements not found');
        return;
    }

    document.getElementById('languageLabel').textContent = translations[language].language;
    document.getElementById('firstMoveLabel').textContent = translations[language].firstMove;
    document.getElementById('codeLabel').textContent = translations[language].enterCode;
    document.getElementById('checkCodeBtn').textContent = translations[language].check;
    document.querySelector('h1').textContent = translations[language].settings;

    languageSelect.value = language;
    firstMoveSelect.innerHTML = `
        <option value="player">${translations[language].playerFirst}</option>
        <option value="alternating">${translations[language].alternating}</option>
        <option value="bot">${translations[language].botFirst}</option>
    `;
    firstMoveSelect.value = firstMoveMode;
}

function applySpecialTheme() {
    if (localStorage.getItem('specialTheme') === 'true') {
        document.body.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)';
    } else {
        document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
}

document.getElementById('languageSelect').addEventListener('change', (e) => {
    language = e.target.value;
    localStorage.setItem('language', language);
    updateSettingsUI();
    const codeResult = document.getElementById('codeResult');
    codeResult.textContent = translations[language].languageSaved;
    codeResult.className = 'code-result success';
    setTimeout(() => {
        codeResult.className = 'code-result hidden';
    }, 2000);
});

document.getElementById('firstMoveSelect').addEventListener('change', (e) => {
    firstMoveMode = e.target.value;
    localStorage.setItem('firstMoveMode', firstMoveMode);
});

document.getElementById('checkCodeBtn').addEventListener('click', () => {
    const code = document.getElementById('codeInput').value;
    const codeResult = document.getElementById('codeResult');
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

document.addEventListener('DOMContentLoaded', () => {
    console.log('Settings page loaded');
    updateSettingsUI();
    applySpecialTheme();
});