// ========== Экран приветствия ==========
const welcomeScreen = document.getElementById('welcome-screen');
const mainContent = document.getElementById('main-content');
const btnOpen = document.getElementById('btn-open');

if (btnOpen) {
    btnOpen.addEventListener('click', () => {
        welcomeScreen.classList.add('hidden');
        mainContent.classList.add('visible');
        mainContent.setAttribute('aria-hidden', 'false');
    });
}

// ========== Конфетти (общая функция) ==========
const emojis = ['🌸', '🌷', '💕', '✨', '🌺', '💖'];

function createConfetti(count) {
    for (let i = 0; i < count; i++) {
        const c = document.createElement('div');
        c.className = 'confetti';
        c.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        c.style.left = Math.random() * 100 + 'vw';
        c.style.top = '-20px';
        c.style.fontSize = (12 + Math.random() * 16) + 'px';
        c.style.animation = `fall ${2 + Math.random() * 2}s linear forwards`;
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 3000);
    }
}

// Клик по цветам в шапке
const flowers = document.getElementById('flowers');
if (flowers) {
    flowers.querySelectorAll('.flower-emoji').forEach((el) => {
        el.addEventListener('click', () => createConfetti(5));
    });
}

// ========== Галерея и лайтбокс ==========
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const gallery = document.getElementById('gallery');

if (gallery) {
    gallery.addEventListener('click', (e) => {
        const img = e.target.closest('.gallery-img');
        if (!img) return;
        e.preventDefault();
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('active');
    });
}

if (lightboxClose) {
    lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
}

if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) lightbox.classList.remove('active');
    });
}

// ========== Кнопка «Нажмите для сюрприза» ==========
const btnSurprise = document.getElementById('btn-surprise');
const surpriseMessage = document.getElementById('surprise-message');
const SURPRISE_TEXT = 'Ты замечательная! Пусть этот день будет полон радости и цветов! 💐✨';

if (btnSurprise && surpriseMessage) {
    btnSurprise.addEventListener('click', () => {
        surpriseMessage.textContent = SURPRISE_TEXT;
        surpriseMessage.classList.add('visible');
        createConfetti(15);
    });
}

// ========== Карточки мини-игр ==========
document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', () => {
        const game = card.dataset.game;
        document.getElementById(`modal-${game}`).classList.add('active');
        if (game === 'memory') initMemoryGame();
        if (game === 'catch') initCatchGame();
        if (game === 'quiz') initQuiz();
    });
});

// Close modal buttons
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-overlay');
        if (modal) {
            modal.classList.remove('active');
            if (modal.id === 'modal-catch') stopCatchGame();
        }
    });
});

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    if (id === 'modal-catch') stopCatchGame();
}

// ========== Игра «Найди пару» ==========
const MEMORY_ICONS = ['🌸', '🌷', '🌺', '💐', '🌹', '💖', '✨', '🦋'];

function initMemoryGame() {
    const grid = document.getElementById('memory-grid');
    const scoreEl = document.getElementById('memory-score');
    const restartBtn = document.getElementById('memory-restart');
    if (!grid || !scoreEl) return;

    if (restartBtn) restartBtn.style.display = 'none';
    grid.innerHTML = '';
    scoreEl.textContent = 'Ходов: 0';

    const pairs = [...MEMORY_ICONS.slice(0, 6), ...MEMORY_ICONS.slice(0, 6)]
        .sort(() => Math.random() - 0.5);

    let moves = 0;
    let flipped = [];
    let matched = 0;
    let locked = false;
    let gameOver = false;

    function flipBack() {
        locked = true;
        const toFlip = [...flipped];
        toFlip.forEach(f => f.el.classList.add('wrong'));
        flipped = [];
        setTimeout(() => {
            toFlip.forEach(f => {
                f.el.classList.remove('flipped', 'wrong');
                f.el.innerHTML = '<span class="back">?</span>';
            });
            locked = false;
        }, 900);
    }

    pairs.forEach((icon, i) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.dataset.index = i;
        card.dataset.icon = icon;
        card.innerHTML = '<span class="back">?</span>';
        function handleClick(e) {
            if (e) e.preventDefault();
            if (locked || gameOver || card.classList.contains('flipped') || card.classList.contains('matched')) return;
            if (flipped.length >= 2) return;

            card.classList.add('flipped');
            card.innerHTML = '<span class="front">' + icon + '</span>';
            flipped.push({ el: card, icon });

            if (flipped.length === 2) {
                moves++;
                scoreEl.textContent = 'Ходов: ' + moves;
                if (flipped[0].icon === flipped[1].icon) {
                    flipped.forEach(f => {
                        f.el.classList.add('matched');
                        f.el.classList.remove('flipped');
                    });
                    matched += 2;
                    createConfetti(3);
                    flipped = [];
                    if (matched === 12) {
                        gameOver = true;
                        scoreEl.textContent = 'Поздравляю! За ' + moves + ' ходов 🎉';
                        if (restartBtn) restartBtn.style.display = 'inline-block';
                    }
                } else {
                    flipBack();
                }
            }
        }
        card.addEventListener('click', handleClick);
        card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(e); });
        grid.appendChild(card);
    });
}

document.getElementById('memory-restart')?.addEventListener('click', () => initMemoryGame());

// ========== Игра «Лови сердечки» (корзинка) ==========
let catchInterval = null;
let catchRunning = false;
let catchCollisionId = null;

function initCatchGame() {
    stopCatchGame();
    const scoreEl = document.getElementById('catch-score');
    const area = document.getElementById('catch-area');
    const btnStart = document.getElementById('catch-start');
    const btnStop = document.getElementById('catch-stop');
    if (scoreEl) scoreEl.textContent = 'Счёт: 0';
    if (area) {
        area.innerHTML = '';
        const ph = document.createElement('div');
        ph.className = 'catch-placeholder';
        ph.id = 'catch-placeholder';
        ph.textContent = 'Нажмите «Начать»';
        area.appendChild(ph);
    }
    if (btnStart) btnStart.disabled = false;
    if (btnStop) btnStop.disabled = true;
}

function rectsOverlap(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

function startCatchGame() {
    const area = document.getElementById('catch-area');
    const scoreEl = document.getElementById('catch-score');
    const btnStart = document.getElementById('catch-start');
    const btnStop = document.getElementById('catch-stop');
    if (!area || !scoreEl || catchRunning) return;

    catchRunning = true;
    if (btnStart) btnStart.disabled = true;
    if (btnStop) btnStop.disabled = false;
    const placeholder = area.querySelector('.catch-placeholder');
    if (placeholder) placeholder.remove();
    area.classList.add('catch-area-active');

    const basket = document.createElement('div');
    basket.className = 'catch-basket';
    basket.setAttribute('aria-hidden', 'true');
    basket.innerHTML = '🧺';
    area.appendChild(basket);

    const basketWidth = 80;
    const basketHeight = 44;
    let basketLeft = 50;
    const areaRect = () => area.getBoundingClientRect();

    function setBasketPosition(clientX) {
        const rect = areaRect();
        const x = clientX - rect.left;
        const pct = (x / rect.width) * 100;
        basketLeft = Math.max(5, Math.min(95, pct));
        basket.style.left = basketLeft + '%';
    }

    function onMove(e) {
        if (e.touches) {
            e.preventDefault();
            setBasketPosition(e.touches[0].clientX);
        } else {
            setBasketPosition(e.clientX);
        }
    }

    area.addEventListener('mousemove', onMove);
    area.addEventListener('touchmove', onMove, { passive: false });

    scoreEl.textContent = 'Счёт: 0';
    let score = 0;

    function checkCollisions() {
        if (!catchRunning || !basket.parentNode) return;
        const basketRect = basket.getBoundingClientRect();
        const hearts = area.querySelectorAll('.heart-fall:not(.caught)');
        hearts.forEach((heart) => {
            if (heart.classList.contains('caught')) return;
            const heartRect = heart.getBoundingClientRect();
            if (rectsOverlap(basketRect, heartRect)) {
                heart.classList.add('caught');
                score += 1;
                scoreEl.textContent = 'Счёт: ' + score;
                setTimeout(() => heart.remove(), 320);
            }
        });
        catchCollisionId = requestAnimationFrame(checkCollisions);
    }
    catchCollisionId = requestAnimationFrame(checkCollisions);

    catchInterval = setInterval(() => {
        const heart = document.createElement('div');
        heart.className = 'heart-fall';
        heart.textContent = ['💕', '❤️', '💗', '💖', '💘'][Math.floor(Math.random() * 5)];
        const duration = 2.5 + Math.random() * 1.5;
        heart.style.left = (8 + Math.random() * 84) + '%';
        heart.style.animation = `heartFall ${duration}s linear forwards`;
        area.appendChild(heart);
        setTimeout(() => {
            if (heart.parentNode && !heart.classList.contains('caught')) heart.remove();
        }, duration * 1000 + 200);
    }, 800);

    window._catchCleanup = function() {
        area.classList.remove('catch-area-active');
        area.removeEventListener('mousemove', onMove);
        area.removeEventListener('touchmove', onMove);
        if (catchCollisionId) cancelAnimationFrame(catchCollisionId);
        catchCollisionId = null;
        basket.remove();
    };
}

function stopCatchGame() {
    catchRunning = false;
    if (typeof window._catchCleanup === 'function') {
        window._catchCleanup();
        window._catchCleanup = null;
    }
    if (catchInterval) {
        clearInterval(catchInterval);
        catchInterval = null;
    }
    const btnStart = document.getElementById('catch-start');
    const btnStop = document.getElementById('catch-stop');
    if (btnStart) btnStart.disabled = false;
    if (btnStop) btnStop.disabled = true;
}

const catchStartBtn = document.getElementById('catch-start');
const catchStopBtn = document.getElementById('catch-stop');
if (catchStartBtn) catchStartBtn.addEventListener('click', startCatchGame);
if (catchStopBtn) catchStopBtn.addEventListener('click', stopCatchGame);

// ========== Викторина ==========
const QUIZ = [
    { q: 'Какой цветок называют символом 8 марта?', options: ['Роза', 'Тюльпан', 'Мимоза', 'Ландыш'], correct: 2 },
    { q: 'Какого цвета традиционная мимоза?', options: ['Белая', 'Жёлтая', 'Розовая', 'Красная'], correct: 1 },
    { q: 'Какой цветок олицетворяет любовь?', options: ['Ромашка', 'Роза', 'Тюльпан', 'Пион'], correct: 1 },
    { q: 'Сколько лепестков у цветка сакуры?', options: ['3', '5', '7', '9'], correct: 1 },
];

let quizIndex = 0;
let quizCorrect = 0;

function initQuiz() {
    quizIndex = 0;
    quizCorrect = 0;
    const resultEl = document.getElementById('quiz-result');
    const contentEl = document.getElementById('quiz-content');
    const progressEl = document.getElementById('quiz-progress');
    if (resultEl) {
        resultEl.style.display = 'none';
        resultEl.textContent = '';
        resultEl.className = 'quiz-result';
    }
    if (contentEl) contentEl.style.display = 'block';
    if (progressEl) progressEl.textContent = '';
    showQuizQuestion();
}

function showQuizQuestion() {
    const questionEl = document.getElementById('quiz-question');
    const optsEl = document.getElementById('quiz-options');
    const resultEl = document.getElementById('quiz-result');
    const contentEl = document.getElementById('quiz-content');
    const progressEl = document.getElementById('quiz-progress');
    if (!questionEl || !optsEl) return;

    if (quizIndex >= QUIZ.length) {
        if (contentEl) contentEl.style.display = 'none';
        if (resultEl) {
            resultEl.style.display = 'block';
            const pct = Math.round((quizCorrect / QUIZ.length) * 100);
            resultEl.innerHTML = '<span class="quiz-result-title">Готово!</span><span class="quiz-result-score">' + quizCorrect + ' из ' + QUIZ.length + '</span><span class="quiz-result-msg">' + (quizCorrect === QUIZ.length ? 'Все верно! 🎉' : 'Спасибо за игру 💐') + '</span>';
            if (pct === 100) resultEl.classList.add('quiz-result-perfect');
        }
        if (quizCorrect === QUIZ.length) createConfetti(5);
        return;
    }

    const q = QUIZ[quizIndex];
    if (progressEl) progressEl.textContent = 'Вопрос ' + (quizIndex + 1) + ' из ' + QUIZ.length;
    questionEl.textContent = q.q;
    optsEl.innerHTML = '';

    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-option';
        btn.textContent = opt;
        btn.addEventListener('click', () => {
            const options = optsEl.querySelectorAll('.quiz-option');
            options.forEach(b => { b.disabled = true; });
            const isCorrect = i === q.correct;
            if (isCorrect) {
                btn.classList.add('correct');
                quizCorrect++;
            } else {
                btn.classList.add('wrong');
                options[q.correct].classList.add('correct');
            }
            setTimeout(() => {
                quizIndex++;
                showQuizQuestion();
            }, 1400);
        });
        optsEl.appendChild(btn);
    });
}
