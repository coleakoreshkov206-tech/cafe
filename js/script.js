/**
 * script.js — Скрипты для сайта кафе «Уютный уголок»
 *
 * Содержит:
 * 1. Мобильное меню
 * 2. Подсветка активной ссылки навигации
 * 3. Анимация счётчиков (JS-вызов 1)
 * 4. Анимация появления элементов (Intersection Observer) (JS-вызов 2)
 * 5. Typewriter-анимация заголовка (JS-вызов 3 / анимация скриптом)
 * 6. Калькулятор заказа (динамический контент + получение данных)
 * 7. Обработка форм (contacte + rezerv) на стороне клиента
 * 8. Схема зала (динамически генерируемый контент)
 * 9. Отзывы гостей (динамически генерируемый контент)
 */

/* ============================================================
   1. МОБИЛЬНОЕ МЕНЮ
   ============================================================ */

/**
 * Переключает видимость мобильной навигации
 */
function mobileMenu() {
    var nav = document.getElementById('main-nav');
    if (!nav) return;
    nav.classList.toggle('mobile');
}

document.addEventListener('DOMContentLoaded', function () {

    // Закрыть меню при клике на ссылку
    var nav = document.getElementById('main-nav');
    if (nav) {
        nav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                if (window.innerWidth <= 800) nav.classList.remove('mobile');
            });
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 800) nav.classList.remove('mobile');
        });
    }

    /* ── Запуск всех модулей ── */
    highlightActiveLink();
    initCounters();
    initScrollReveal();
    initHeroTypewriter();
    initCalc();
    initTableSchema();
    initReviews();
});

/* ============================================================
   2. ПОДСВЕТКА АКТИВНОЙ ССЫЛКИ НАВИГАЦИИ
   ============================================================ */

/**
 * Добавляет класс 'active' к ссылке текущей страницы
 */
function highlightActiveLink() {
    var page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav#main-nav a').forEach(function (a) {
        if (a.getAttribute('href').split('/').pop() === page) {
            a.classList.add('active');
        }
    });
}

/* ============================================================
   3. АНИМАЦИЯ СЧЁТЧИКОВ (JS-вызов №1)
   ============================================================ */

/**
 * Запускает анимацию числовых счётчиков при появлении в области просмотра.
 * Использует requestAnimationFrame для плавной анимации.
 */
function initCounters() {
    var nums = document.querySelectorAll('.stat-num');
    if (!nums.length) return;

    var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting && !e.target.dataset.done) {
                e.target.dataset.done = '1';
                countUp(e.target);
            }
        });
    }, { threshold: 0.5 });

    nums.forEach(function (n) { obs.observe(n); });
}

/**
 * Анимирует один счётчик от 0 до data-target
 * @param {HTMLElement} el
 */
function countUp(el) {
    var target   = parseInt(el.dataset.target, 10);
    var duration = 1600;
    var start    = null;

    function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        // Функция easeOutCubic
        var ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(ease * target).toLocaleString('ru-RU');
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString('ru-RU');
    }
    requestAnimationFrame(step);
}

/* ============================================================
   4. АНИМАЦИЯ ПОЯВЛЕНИЯ ЭЛЕМЕНТОВ (JS-вызов №2)
   ============================================================ */

/**
 * Добавляет класс 'visible' к .loc и .highlight-card при прокрутке.
 * Создаёт эффект плавного появления блоков.
 */
function initScrollReveal() {
    var els = document.querySelectorAll('.loc, .highlight-card, .info-card, .stat-card');
    if (!els.length) return;

    var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });

    els.forEach(function (el) { obs.observe(el); });
}

/* ============================================================
   5. TYPEWRITER-АНИМАЦИЯ ЗАГОЛОВКА (JS-вызов №3 — анимация скриптом)
   ============================================================ */

/**
 * Создаёт анимацию печатающегося текста для подзаголовка на главной странице.
 * Циклически сменяет несколько строк с эффектом набора и удаления.
 */
function initHeroTypewriter() {
    var el = document.getElementById('hero-sub');
    if (!el) return;

    var texts = [
        'Место, где хочется остаться',
        'Свежая выпечка каждое утро',
        'Живая музыка по субботам',
        'Открыто ежедневно с 8:00'
    ];
    var idx = 0, ci = 0, del = false;

    function type() {
        var cur = texts[idx];
        el.textContent = del ? cur.slice(0, --ci) : cur.slice(0, ++ci);

        if (!del && ci === cur.length) {
            setTimeout(function () { del = true; setTimeout(type, 80); }, 2200);
            return;
        }
        if (del && ci === 0) {
            del = false;
            idx = (idx + 1) % texts.length;
        }
        setTimeout(type, del ? 45 : 85);
    }
    setTimeout(type, 1300);
}

/* ============================================================
   6. КАЛЬКУЛЯТОР ЗАКАЗА — динамический контент + обработка данных
   ============================================================ */

/* Данные позиций меню */
var menuItems = [
    { name: 'Авокадо-тост',  price: 89  },
    { name: 'Французский омлет', price: 72 },
    { name: 'Овсяная каша',  price: 55  },
    { name: 'Крем-суп',      price: 65  },
    { name: 'Паста с грибами', price: 115 },
    { name: 'Лосось',        price: 145  },
    { name: 'Чизкейк',       price: 75  },
    { name: 'Круассан',      price: 42  },
    { name: 'Капучино',      price: 45  },
    { name: 'Лимонад',       price: 52  }
];

/**
 * Инициализирует калькулятор заказа, динамически создавая HTML-элементы
 */
function initCalc() {
    var container = document.getElementById('calc-items');
    if (!container) return;

    // Динамически генерируем позиции меню
    menuItems.forEach(function (item, i) {
        var div = document.createElement('div');
        div.className = 'calc-item';
        div.innerHTML =
            '<label for="ci' + i + '">' + item.name + '</label>' +
            '<span class="price-tag">' + item.price + ' MDL</span>' +
            '<input type="number" id="ci' + i + '" min="0" max="10" value="0" ' +
            '       oninput="updateCalc()" data-price="' + item.price + '">';
        container.appendChild(div);
    });
    updateCalc();
}

/**
 * Обновляет итоговую сумму калькулятора на основе данных пользователя
 */
function updateCalc() {
    var inputs = document.querySelectorAll('.calc-item input[type="number"]');
    var total  = 0;
    inputs.forEach(function (inp) {
        var qty = parseInt(inp.value, 10) || 0;
        if (qty < 0) { inp.value = 0; qty = 0; }
        total += qty * parseInt(inp.dataset.price, 10);
    });
    var sumEl = document.getElementById('calc-sum');
    if (sumEl) sumEl.textContent = total.toLocaleString('ru-RU');
}

/**
 * Сбрасывает все поля калькулятора
 */
function resetCalc() {
    document.querySelectorAll('.calc-item input[type="number"]').forEach(function (i) {
        i.value = 0;
    });
    updateCalc();
}

/* ============================================================
   7. ОБРАБОТКА ФОРМ НА СТОРОНЕ КЛИЕНТА
   ============================================================ */

/**
 * Обрабатывает форму обратной связи на странице контактов.
 * Выполняет валидацию и выводит сообщение пользователю.
 */
function submitForm() {
    var name    = document.getElementById('fname');
    var email   = document.getElementById('femail');
    var msg     = document.getElementById('fmessage');
    var fb      = document.getElementById('form-msg');
    if (!name || !email || !msg || !fb) return;

    if (!name.value.trim()) {
        showFb(fb, 'Пожалуйста, введите ваше имя.', false);
        name.focus(); return;
    }
    if (!validEmail(email.value)) {
        showFb(fb, 'Введите корректный email-адрес.', false);
        email.focus(); return;
    }
    if (msg.value.trim().length < 10) {
        showFb(fb, 'Сообщение должно содержать не менее 10 символов.', false);
        msg.focus(); return;
    }

    var btn = document.querySelector('.btn-submit');
    if (btn) { btn.disabled = true; btn.textContent = 'Отправка…'; }

    // Имитация отправки на сервер (обработка на стороне клиента)
    setTimeout(function () {
        showFb(fb, '✅ Спасибо, ' + name.value.trim() + '! Ваше сообщение отправлено. Мы ответим на ' + email.value.trim(), true);
        name.value = ''; email.value = ''; msg.value = '';
        var phone = document.getElementById('fphone');
        if (phone) phone.value = '';
        if (btn) { btn.disabled = false; btn.textContent = 'Отправить'; }
    }, 900);
}

/**
 * Обрабатывает форму бронирования стола
 */
function submitRezerv() {
    var rname   = document.getElementById('rname');
    var rphone  = document.getElementById('rphone');
    var rdate   = document.getElementById('rdate');
    var rtime   = document.getElementById('rtime');
    var rguests = document.getElementById('rguests');
    var fb      = document.getElementById('rezerv-msg');
    if (!rname || !fb) return;

    if (!rname.value.trim()) {
        showFb(fb, 'Укажите ваше имя.', false); rname.focus(); return;
    }
    if (!rphone || !rphone.value.trim()) {
        showFb(fb, 'Укажите номер телефона.', false); if(rphone) rphone.focus(); return;
    }
    if (!rdate || !rdate.value) {
        showFb(fb, 'Выберите дату.', false); if(rdate) rdate.focus(); return;
    }
    if (!rtime || !rtime.value) {
        showFb(fb, 'Выберите время.', false); if(rtime) rtime.focus(); return;
    }
    if (!rguests || !rguests.value) {
        showFb(fb, 'Укажите количество гостей.', false); if(rguests) rguests.focus(); return;
    }

    var btn = document.querySelector('.btn-submit');
    if (btn) { btn.disabled = true; btn.textContent = 'Оформляем…'; }

    setTimeout(function () {
        showFb(fb,
            '✅ Бронирование подтверждено! ' + rname.value.trim() +
            ', ждём вас ' + rdate.value + ' в ' + rtime.value +
            ' (' + rguests.value + ' чел.). Мы позвоним на ' + rphone.value.trim(), true);
        if (btn) { btn.disabled = false; btn.textContent = 'Подтвердить бронирование'; }
    }, 900);
}

/**
 * Показывает сообщение в блоке обратной связи формы
 * @param {HTMLElement} el — контейнер сообщения
 * @param {string} text    — текст
 * @param {boolean} ok     — успех или ошибка
 */
function showFb(el, text, ok) {
    el.textContent = text;
    el.className = 'form-feedback ' + (ok ? 'success' : 'error');
}

/**
 * Проверяет корректность email-адреса
 * @param {string} v
 * @returns {boolean}
 */
function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/* ============================================================
   8. СХЕМА ЗАЛА (динамически генерируемый контент)
   ============================================================ */

/* Данные о столах */
var tablesData = [
    { id: 1,  seats: 2, busy: false, zone: 'У окна' },
    { id: 2,  seats: 2, busy: true,  zone: 'У окна' },
    { id: 3,  seats: 4, busy: false, zone: 'Центр' },
    { id: 4,  seats: 4, busy: true,  zone: 'Центр' },
    { id: 5,  seats: 2, busy: false, zone: 'Диван' },
    { id: 6,  seats: 6, busy: false, zone: 'Центр' },
    { id: 7,  seats: 2, busy: false, zone: 'Терраса' },
    { id: 8,  seats: 4, busy: true,  zone: 'Терраса' },
    { id: 9,  seats: 2, busy: false, zone: 'Диван' },
    { id: 10, seats: 4, busy: false, zone: 'У окна' }
];

/**
 * Динамически генерирует схему зала с кнопками столов
 */
function initTableSchema() {
    var schema = document.getElementById('table-schema');
    if (!schema) return;

    tablesData.forEach(function (t) {
        var btn = document.createElement('button');
        btn.className = 'table-btn ' + (t.busy ? 'busy' : 'free');
        btn.innerHTML = '🪑<span>Стол ' + t.id + '</span>';
        btn.title     = t.busy ? 'Занято' : 'Свободно — ' + t.zone;

        if (!t.busy) {
            btn.addEventListener('click', function () { showTableInfo(t); });
        }
        schema.appendChild(btn);
    });
}

/**
 * Показывает информацию о выбранном столе
 * @param {Object} t — объект стола
 */
function showTableInfo(t) {
    var box = document.getElementById('table-info');
    if (!box) return;
    box.style.display = 'block';
    box.innerHTML =
        '<strong>Стол №' + t.id + '</strong><br>' +
        '📍 Зона: ' + t.zone + '<br>' +
        '👥 Мест: ' + t.seats + '<br>' +
        '✅ Статус: Свободен<br><br>' +
        '<em>Чтобы забронировать, заполните форму выше.</em>';

    // Анимация появления блока
    box.style.animation = 'none';
    box.offsetHeight; // reflow
    box.style.animation = 'fadeIn 0.3s ease';
}

/* ============================================================
   9. ОТЗЫВЫ ГОСТЕЙ (динамически генерируемый контент)
   ============================================================ */

/* База отзывов */
var allReviews = [
    { name: 'Анна М.',    stars: 5, text: 'Лучший чизкейк в городе! Приходим каждую неделю. Атмосфера невероятная — тепло, уютно.' },
    { name: 'Дмитрий К.', stars: 5, text: 'Отличный кофе, быстрое обслуживание. Работаю здесь с ноутбуком каждый день — Wi-Fi стабильный.' },
    { name: 'Мария С.',   stars: 4, text: 'Очень вкусный авокадо-тост! Немного долго ждали стол в субботу, но оно того стоило.' },
    { name: 'Иван П.',    stars: 5, text: 'Были на живой музыке в субботу — незабываемо! Джаз + хороший кофе = идеальный вечер.' },
    { name: 'Елена Р.',   stars: 5, text: 'Заказывали торт на день рождения. Всё очень профессионально, вкусно и красиво оформлено.' },
    { name: 'Олег В.',    stars: 4, text: 'Паста с грибами — просто огонь. Порция большая, цена адекватная. Приду ещё.' }
];

var reviewsShown = 0;

/**
 * Инициализирует блок отзывов и показывает первые 2
 */
function initReviews() {
    if (!document.getElementById('reviews-container')) return;
    loadMoreReviews();
}

/**
 * Динамически добавляет карточки отзывов
 */
function loadMoreReviews() {
    var container = document.getElementById('reviews-container');
    var btn       = document.getElementById('load-more-btn');
    if (!container) return;

    var toShow = Math.min(reviewsShown + 2, allReviews.length);

    for (var i = reviewsShown; i < toShow; i++) {
        var r   = allReviews[i];
        var div = document.createElement('div');
        div.className = 'review-card';

        // Динамически строим звёзды
        var stars = '';
        for (var s = 0; s < r.stars; s++) stars += '★';
        for (var s2 = r.stars; s2 < 5; s2++) stars += '☆';

        div.innerHTML =
            '<div class="stars">' + stars + '</div>' +
            '<p class="review-text">"' + r.text + '"</p>' +
            '<span class="reviewer">— ' + r.name + '</span>';

        container.appendChild(div);
    }

    reviewsShown = toShow;

    // Скрыть кнопку, если все отзывы показаны
    if (btn && reviewsShown >= allReviews.length) btn.style.display = 'none';
}
