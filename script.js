const translations = {
    ru: {
        about: "Обо мне",
        home: "На главную",
        functions: "Полезные функции",
        gamesTitle: "Игры",
        snake: "Змейка",
        guess: "Угадай число",
        math: "Математический тест",
        tictactoe: "Крестики-Нолики",
        gallows: "Виселица",
        pet: "Питомец",
        minesweeper: "Сапёр",
        game2048: "2048",
        chess: "Шахматы",
        checkers: "Шашки"
    },
    en: {
        about: "About me",
        home: "Home",
        functions: "Useful functions",
        gamesTitle: "Games",
        snake: "Snake",
        guess: "Guess the number",
        math: "Math test",
        tictactoe: "Tic-Tac-Toe",
        gallows: "Hangman",
        pet: "Pet",
        minesweeper: "Minesweeper",
        game2048: "2048",
        chess: "Chess",
        checkers: "Checkers"
    },
    de: {
        about: "Über mich",
        home: "Startseite",
        functions: "Nützliche Funktionen",
        gamesTitle: "Spiele",
        snake: "Schlange",
        guess: "Zahlen raten",
        math: "Mathe Test",
        tictactoe: "Tic-Tac-Toe",
        gallows: "Galgenmännchen",
        pet: "Haustier",
        minesweeper: "Minenräumer",
        game2048: "2048",
        chess: "Schach",
        checkers: "Dame"
    }
};

let currentLang = localStorage.getItem('language') || 'ru';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    
    const flags = { ru: '🌐 RU', en: '🌐 EN', de: '🌐 DE' };
    const langBtn = document.getElementById('langBtn');
    if (langBtn) langBtn.innerHTML = flags[lang];
    
    document.querySelectorAll('.nav-links a, .game-card').forEach(el => {
        const key = el.getAttribute('data-key');
        if (key && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    
    const gamesTitle = document.getElementById('gamesTitle');
    if (gamesTitle) gamesTitle.textContent = translations[lang].gamesTitle;
    
    document.documentElement.lang = lang === 'en' ? 'en' : lang;
}

document.querySelectorAll('[data-lang]').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        setLanguage(item.getAttribute('data-lang'));
    });
});

setLanguage(currentLang);