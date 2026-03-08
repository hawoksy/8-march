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

// ========== Кнопка «Нажмите для сюрприза» ==========
const btnSurprise = document.getElementById('btn-surprise');
const surpriseMessage = document.getElementById('surprise-message');
const SURPRISE_TEXT = 'Спасибо за любовь, поддержку и всё добро, которое ты даришь нашей семье. Пусть этот день будет полон радости и тепла. ❤️';

if (btnSurprise && surpriseMessage) {
    btnSurprise.addEventListener('click', () => {
        surpriseMessage.textContent = SURPRISE_TEXT;
        surpriseMessage.classList.add('visible');
        createConfetti(15);
    });
}

// ========== Прогресс и переходы между играми ==========
let gameProgress = 0;

function openGameModal(gameId) {
    const modal = document.getElementById('modal-' + gameId);
    if (modal) modal.classList.add('active');
    if (gameId === 'memory') initMemoryGame();
    if (gameId === 'catch') initCatchGame();
    if (gameId === 'quiz') initQuiz();
}

function closeGameModal(gameId) {
    const modal = document.getElementById('modal-' + gameId);
    if (modal) modal.classList.remove('active');
}

// ========== Мини-квест: кнопка «Начать» ==========
document.getElementById('quest-start')?.addEventListener('click', () => {
    openGameModal('memory');
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

// Кнопки «Следующая игра» и «Начать заново»
document.getElementById('memory-next')?.addEventListener('click', () => {
    closeGameModal('memory');
    gameProgress = 1;
    openGameModal('catch');
});

document.getElementById('catch-next')?.addEventListener('click', () => {
    closeGameModal('catch');
    gameProgress = 2;
    openGameModal('quiz');
});

document.getElementById('catch-retry')?.addEventListener('click', () => {
    initCatchGame();
});

document.getElementById('quiz-restart')?.addEventListener('click', () => {
    closeGameModal('quiz');
    gameProgress = 0;
});

document.getElementById('quiz-retry-btn')?.addEventListener('click', () => {
    initQuiz();
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
    const playEl = document.getElementById('memory-play');
    const winEl = document.getElementById('memory-win');
    if (!grid || !scoreEl) return;

    if (playEl) playEl.style.display = '';
    if (winEl) winEl.style.display = 'none';
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
                        createConfetti(10);
                        if (playEl) playEl.style.display = 'none';
                        if (winEl) {
                            winEl.style.display = 'block';
                            const movesEl = document.getElementById('memory-moves');
                            if (movesEl) movesEl.textContent = 'За ' + moves + ' ходов';
                            document.getElementById('memory-progress').textContent = 'Игра 1 из 3';
                        }
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

// ========== Игра «Лови сердечки» (корзинка) ==========
const CATCH_TARGET = 51;
const CATCH_LIVES = 3;

function getLivesText(n) {
    return 'Жизни: ' + '❤️'.repeat(n) + '🖤'.repeat(CATCH_LIVES - n);
}
let catchInterval = null;
let catchRunning = false;
let catchCollisionId = null;

function initCatchGame() {
    stopCatchGame();
    const scoreEl = document.getElementById('catch-score');
    const area = document.getElementById('catch-area');
    const playEl = document.getElementById('catch-play');
    const winEl = document.getElementById('catch-win');
    const btnStart = document.getElementById('catch-start');
    const btnStop = document.getElementById('catch-stop');
    const livesEl = document.getElementById('catch-lives');
    const loseEl = document.getElementById('catch-lose');
    if (scoreEl) scoreEl.textContent = 'Счёт: 0 / ' + CATCH_TARGET;
    if (livesEl) livesEl.textContent = getLivesText(CATCH_LIVES);
    if (playEl) playEl.style.display = '';
    if (winEl) winEl.style.display = 'none';
    if (loseEl) loseEl.style.display = 'none';
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

    scoreEl.textContent = 'Счёт: 0 / ' + CATCH_TARGET;
    const livesEl = document.getElementById('catch-lives');
    let score = 0;
    let lives = CATCH_LIVES;
    const playEl = document.getElementById('catch-play');
    const winEl = document.getElementById('catch-win');
    const loseEl = document.getElementById('catch-lose');

    function updateLives() {
        if (livesEl) livesEl.textContent = getLivesText(lives);
    }

    function checkCatchWin() {
        if (score >= CATCH_TARGET && winEl && playEl) {
            stopCatchGame();
            createConfetti(12);
            playEl.style.display = 'none';
            winEl.style.display = 'block';
            document.getElementById('catch-progress').textContent = 'Игра 2 из 3';
        }
    }

    function checkCatchLose() {
        if (lives <= 0 && loseEl && playEl) {
            stopCatchGame();
            playEl.style.display = 'none';
            loseEl.style.display = 'block';
        }
    }

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
            scoreEl.textContent = 'Счёт: ' + score + ' / ' + CATCH_TARGET;
            setTimeout(() => heart.remove(), 320);
            checkCatchWin();
            return;
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
            if (!catchRunning) return;
            if (heart.parentNode && !heart.classList.contains('caught')) {
                heart.remove();
                lives -= 1;
                updateLives();
                checkCatchLose();
            }
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
function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const QUIZ = [
    { q: 'Что чаще всего дарят маме на 8 марта?', options: ['Цветы', 'Игрушки', 'Одежду', 'Книгу'], correctAnswer: 'Цветы' },
    { q: 'Какой цвет чаще всего ассоциируют с Международным женским днём?', options: ['Розовый', 'Чёрный', 'Синий', 'Зелёный'], correctAnswer: 'Розовый' },
    { q: 'Что чаще всего весной цветёт первым в саду?', options: ['Подснежники', 'Розы', 'Тюльпаны', 'Орхидеи'], correctAnswer: 'Подснежники' },
    { q: 'Что обычно кладут в подарок на 8 марта кроме цветов?', options: ['Шоколад и сладости', 'Песок', 'Книгу по химии', 'Карандаши'], correctAnswer: 'Шоколад и сладости' },
    { q: 'Какие эмоции мы хотим подарить с 8 марта?', options: ['Радость и любовь', 'Грусть', 'Страх', 'Злость'], correctAnswer: 'Радость и любовь' },
    { q: 'Какой цветок называют символом 8 марта?', options: ['Роза', 'Тюльпан', 'Мимоза', 'Ландыш'], correctAnswer: 'Мимоза' },
    { q: 'Какого цвета традиционная мимоза?', options: ['Белая', 'Жёлтая', 'Розовая', 'Красная'], correctAnswer: 'Жёлтая' },
    { q: 'Какой цветок олицетворяет любовь?', options: ['Ромашка', 'Роза', 'Тюльпан', 'Пион'], correctAnswer: 'Роза' },
    { q: 'Какой цветок в Японии считается символом весны и красоты?', options: ['Сакура', 'Роза', 'Тюльпан', 'Лилия'], correctAnswer: 'Сакура' },
    { q: 'Сколько лепестков у цветка сакуры?', options: ['3', '5', '7', '9'], correctAnswer: '5' },
];

const QUIZ_PASS_SCORE = 8;

let quizIndex = 0;
let quizCorrect = 0;

function initQuiz() {
    quizIndex = 0;
    quizCorrect = 0;
    const playEl = document.getElementById('quiz-play');
    const finalEl = document.getElementById('quiz-final');
    const retryEl = document.getElementById('quiz-retry');
    const resultEl = document.getElementById('quiz-result');
    const progressEl = document.getElementById('quiz-progress');
    if (playEl) playEl.style.display = '';
    if (finalEl) finalEl.style.display = 'none';
    if (retryEl) retryEl.style.display = 'none';
    if (resultEl) {
        resultEl.style.display = 'none';
        resultEl.textContent = '';
        resultEl.className = 'quiz-result';
    }
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
        const playEl = document.getElementById('quiz-play');
        const finalEl = document.getElementById('quiz-final');
        const retryEl = document.getElementById('quiz-retry');
        const retryScoreEl = document.getElementById('quiz-retry-score');
        if (playEl) playEl.style.display = 'none';
        if (quizCorrect >= QUIZ_PASS_SCORE && finalEl) {
            finalEl.style.display = 'block';
            const introEl = document.getElementById('quiz-final-intro');
            if (introEl) {
                const n = quizCorrect;
                const word = (n % 10 === 1 && n % 100 !== 11) ? 'вопрос' : ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) ? 'вопроса' : 'вопросов';
                introEl.textContent = '🌷 Вы ответили правильно на ' + n + ' ' + word + '! Пусть ваша жизнь расцветает, как самый красивый весенний сад, и каждый день дарит радость и улыбки.';
            }
            createConfetti(15);
        } else if (retryEl && retryScoreEl) {
            retryEl.style.display = 'block';
            retryScoreEl.textContent = 'Результат: ' + quizCorrect + ' из ' + QUIZ.length;
        }
        return;
    }

    const q = QUIZ[quizIndex];
    const shuffledOptions = shuffleArray(q.options);
    const correctIndex = shuffledOptions.indexOf(q.correctAnswer);

    if (progressEl) progressEl.textContent = 'Вопрос ' + (quizIndex + 1) + ' из ' + QUIZ.length;
    questionEl.textContent = q.q;
    optsEl.innerHTML = '';

    shuffledOptions.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-option';
        btn.textContent = opt;
        btn.addEventListener('click', () => {
            const options = optsEl.querySelectorAll('.quiz-option');
            options.forEach(b => { b.disabled = true; });
            const isCorrect = i === correctIndex;
            if (isCorrect) {
                btn.classList.add('correct');
                quizCorrect++;
            } else {
                btn.classList.add('wrong');
            }
            setTimeout(() => {
                quizIndex++;
                showQuizQuestion();
            }, 1400);
        });
        optsEl.appendChild(btn);
    });
}
