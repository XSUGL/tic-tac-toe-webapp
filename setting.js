// Settings page logic
document.addEventListener('DOMContentLoaded', function() {
    const languageSelect = document.getElementById('languageSelect');
    const codeInput = document.getElementById('codeInput');
    const checkCodeBtn = document.getElementById('checkCodeBtn');
    const codeResult = document.getElementById('codeResult');

    // Load saved language
    const savedLanguage = localStorage.getItem('gameLanguage') || 'en';
    languageSelect.value = savedLanguage;

    // Language change handler
    languageSelect.addEventListener('change', function() {
        const selectedLanguage = languageSelect.value;
        localStorage.setItem('gameLanguage', selectedLanguage);
        
        // Show confirmation
        showCodeResult('Language saved!', 'success');
        
        // Trigger storage event for other pages
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'gameLanguage',
            newValue: selectedLanguage
        }));
    });

    // Code checking logic
    checkCodeBtn.addEventListener('click', function() {
        checkCode();
    });

    codeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkCode();
        }
    });

    function checkCode() {
        const code = codeInput.value.trim().toLowerCase();
        
        if (code === '') {
            showCodeResult('Please enter a code', 'error');
            return;
        }

        switch(code) {
            case '42':
                showCodeResult('Hello World', 'special');
                break;
            case 'love':
                showCodeResult('Y + A = ❤️', 'special');
                break;
            default:
                showCodeResult('Invalid code', 'error');
                break;
        }

        // Clear input
        codeInput.value = '';
    }

    function showCodeResult(message, type) {
        codeResult.textContent = message;
        codeResult.className = `code-result ${type}`;
        
        // Add animation
        codeResult.style.opacity = '0';
        setTimeout(() => {
            codeResult.style.opacity = '1';
        }, 10);
        
        // Auto-hide success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                codeResult.style.opacity = '0';
                setTimeout(() => {
                    codeResult.textContent = '';
                    codeResult.className = 'code-result';
                }, 300);
            }, 3000);
        }
    }
});