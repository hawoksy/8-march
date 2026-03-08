// Flower click confetti
const flowers = document.getElementById('flowers');
const emojis = ['🌸', '🌷', '💕', '✨', '🌺', '💖'];

flowers.querySelectorAll('.flower-emoji').forEach((el) => {
    el.addEventListener('click', () => {
        createConfetti(5);
    });
});

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

// Game cards click
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

// Memory Game
const MEMORY_ICONS = ['🌸', '🌷', '🌺', '💐', '🌹', '💖', '✨', '🦋'];

function initMemoryGame() {
    const grid = document.getElementById('memory-grid');
    const scoreEl = document.getElementById('memory-score');
    grid.innerHTML = '';

    const pairs = [...MEMORY_ICONS.slice(0, 6), ...MEMORY_ICONS.slice(0, 6)]
        .sort(() => Math.random() - 0.5);

    let moves = 0;
    let flipped = [];
    let matched = 0;

    pairs.forEach((icon, i) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = i;
        card.dataset.icon = icon;
        card.innerHTML = `<span class="back">❓</span>`;
        card.addEventListener('click', () => {
            if (flipped.length === 2 || card.classList.contains('flipped') || card.classList.contains('matched')) return;

            card.classList.add('flipped');
            card.innerHTML = icon;
            flipped.push({ el: card, icon });
            moves++;
            scoreEl.textContent = `Ходов: ${moves}`;

            if (flipped.length === 2) {
                if (flipped[0].icon === flipped[1].icon) {
                    flipped.forEach(f => {
                        f.el.classList.add('matched');
                        f.el.classList.remove('flipped');
                    });
                    matched += 2;
                    createConfetti(3);
                    if (matched === 12) {
                        setTimeout(() => {
                            scoreEl.textContent = `Поздравляю! Игра окончена за ${moves} ходов! 🎉`;
                        }, 300);
                    }
                } else {
                    setTimeout(() => {
                        flipped.forEach(f => {
                            f.el.classList.remove('flipped');
                            f.el.innerHTML = `<span class="back">❓</span>`;
                        });
                    }, 600);
                }
                flipped = [];
            }
        });
        grid.appendChild(card);
    });
}

// Catch Hearts Game
let catchInterval;
let catchRunning = false;

function initCatchGame() {
    document.getElementById('catch-score').textContent = 'Счёт: 0';
    document.getElementById('catch-area').innerHTML = '';
    document.getElementById('catch-start').disabled = false;
    document.getElementById('catch-stop').disabled = true;
}

document.getElementById('catch-start').addEventListener('click', () => {
    if (catchRunning) return;
    catchRunning = true;
    document.getElementById('catch-start').disabled = true;
    document.getElementById('catch-stop').disabled = false;
    document.getElementById('catch-area').innerHTML = '';
    document.getElementById('catch-score').textContent = 'Счёт: 0';

    catchInterval = setInterval(() => {
        const heart = document.createElement('div');
        heart.className = 'heart-fall';
        heart.textContent = ['💕', '❤️', '💗', '💖', '💘'][Math.floor(Math.random() * 5)];
        heart.style.left = Math.random() * (100 - 10) + '%';
        heart.style.animationDuration = (2 + Math.random() * 2) + 's';

        heart.addEventListener('click', (e) => {
            e.stopPropagation();
            heart.classList.add('caught');
            const catchScoreEl = document.getElementById('catch-score');
            const current = parseInt(catchScoreEl.textContent.replace(/\D/g, ''), 10) || 0;
            catchScoreEl.textContent = `Счёт: ${current + 1}`;
            setTimeout(() => heart.remove(), 300);
        });

        document.getElementById('catch-area').appendChild(heart);
        setTimeout(() => {
            if (heart.parentNode && !heart.classList.contains('caught')) heart.remove();
        }, 4000);
    }, 600);
});

document.getElementById('catch-stop').addEventListener('click', stopCatchGame);

function stopCatchGame() {
    catchRunning = false;
    clearInterval(catchInterval);
    document.getElementById('catch-start').disabled = false;
    document.getElementById('catch-stop').disabled = true;
}

// Quiz
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
    document.getElementById('quiz-result').style.display = 'none';
    document.getElementById('quiz-content').style.display = 'block';
    showQuizQuestion();
}

function showQuizQuestion() {
    if (quizIndex >= QUIZ.length) {
        document.getElementById('quiz-content').style.display = 'none';
        const result = document.getElementById('quiz-result');
        result.style.display = 'block';
        result.textContent = `Результат: ${quizCorrect}/${QUIZ.length} 🎉`;
        if (quizCorrect === QUIZ.length) createConfetti(5);
        return;
    }
    const q = QUIZ[quizIndex];
    document.getElementById('quiz-question').textContent = q.q;
    const opts = document.getElementById('quiz-options');
    opts.innerHTML = '';
    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.textContent = opt;
        btn.addEventListener('click', () => {
            opts.querySelectorAll('.quiz-option').forEach(b => b.disabled = true);
            if (i === q.correct) {
                btn.classList.add('correct');
                quizCorrect++;
            } else btn.classList.add('wrong');
            setTimeout(() => {
                quizIndex++;
                showQuizQuestion();
            }, 800);
        });
        opts.appendChild(btn);
    });
}
