// Универсальная функция для работы с хранилищем
function getStorage() {
    if (typeof(Storage) !== "undefined") {
        return localStorage;
    } else {
        if (!window.fallbackStorage) {
            window.fallbackStorage = {};
        }
        return {
            setItem: function(key, value) {
                window.fallbackStorage[key] = value;
            },
            getItem: function(key) {
                return window.fallbackStorage[key] || null;
            },
            removeItem: function(key) {
                delete window.fallbackStorage[key];
            }
        };
    }
}

// Получить текущего пользователя
function getCurrentUser() {
    const userData = getStorage().getItem('currentUser');
    const loginTime = getStorage().getItem('loginTime');
    
    // Проверяем, не истекла ли сессия (24 часа)
    if (loginTime && (new Date().getTime() - parseInt(loginTime)) > 24 * 60 * 60 * 1000) {
        logout();
        return null;
    }
    
    return userData ? JSON.parse(userData) : null;
}

// Проверка авторизации и обновление интерфейса
function checkAuth() {
    const currentUser = getCurrentUser();
    const authButtons = document.querySelector('.auth-buttons');
    
    if (currentUser && authButtons) {
        authButtons.innerHTML = `
            <a href="profile.html" class="btn btn-signup">Мой профиль</a>
            <a href="#" class="btn btn-login" id="logout-btn">Выйти</a>
        `;
        
        document.getElementById('logout-btn').addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
        
        return true;
    } else if (authButtons) {
        authButtons.innerHTML = `
            <a href="login.html" class="btn btn-login">Войти</a>
            <a href="signup.html" class="btn btn-signup">Регистрация</a>
        `;
        
        return false;
    }
    return false;
}

// Выход из системы
function logout() {
    getStorage().removeItem('currentUser');
    getStorage().removeItem('isLoggedIn');
    getStorage().removeItem('loginTime');
    window.location.href = 'index.html';
}

// Установка текущего пользователя (для использования в auth.js)
function setCurrentUser(user) {
    const storage = getStorage();
    if (storage) {
        storage.setItem('currentUser', JSON.stringify(user));
        storage.setItem('isLoggedIn', 'true');
        storage.setItem('loginTime', new Date().getTime().toString());
    }
}

// Проверка доступа к странице (для страниц, требующих авторизации)
function requireAuth() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Main page functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Main.js loaded - checking authentication');
    
    // Проверяем авторизацию на всех страницах
    checkAuth();
    
    // Настройка авто-обновления сессии
    setupSessionAutoRefresh();
    
    // Загружаем популярные аниме только на главной
    if (document.getElementById('popular-anime')) {
        loadPopularAnime();
    }
    
    // Настройка навигации для главной страницы
    setupNavigation();
});

function setupSessionAutoRefresh() {
    // Обновляем время сессии при активности пользователя
    const refreshSession = () => {
        if (getCurrentUser()) {
            getStorage().setItem('loginTime', new Date().getTime().toString());
        }
    };
    
    document.addEventListener('click', refreshSession);
    document.addEventListener('keypress', refreshSession);
    document.addEventListener('scroll', refreshSession);
    
    // Также обновляем каждые 10 минут на всякий случай
    setInterval(refreshSession, 10 * 60 * 1000);
}

function setupNavigation() {
    // Настройка активных ссылок в навигации
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('data-page');
        if ((currentPage === 'index.html' && linkPage === 'home') ||
            (currentPage.includes(linkPage) && linkPage !== 'home')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
        
        // Обработка кликов для навигации
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
                const page = this.getAttribute('data-page');
                if (page) {
                    // Для SPA-навигации (если нужно)
                    navigateToPage(page);
                }
            }
        });
    });
}

function navigateToPage(page) {
    // Простая навигация между страницами
    switch(page) {
        case 'home':
            window.location.href = 'index.html';
            break;
        case 'catalog':
            window.location.href = 'catalog.html';
            break;
        case 'player':
            window.location.href = 'player.html';
            break;
        case 'ratings':
            window.location.href = 'ratings.html';
            break;
    }
}

function loadPopularAnime() {
    const popularGrid = document.getElementById('popular-anime');
    if (!popularGrid) return;

    console.log('Loading popular anime...');
    
    // Ждем загрузки данных аниме
    if (typeof window.animeData === 'undefined') {
        setTimeout(loadPopularAnime, 100);
        return;
    }

    const popularAnime = window.animeData.animeList.slice(0, 6);
    
    popularGrid.innerHTML = '';
    
    popularAnime.forEach(anime => {
        const card = document.createElement('div');
        card.className = 'anime-card';
        card.innerHTML = `
            <div class="anime-image">
                <img src="${anime.poster}" alt="${anime.title}" 
                     onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\"display: flex; align-items: center; justify-content: center; height: 100%; color: #8a99b3; background: #2a3a52; border-radius: 8px;\">Нет изображения</div>'">
            </div>
            <div class="anime-info">
                <h3 class="anime-title">${anime.title}</h3>
                <div class="anime-rating">
                    <div class="rating-stars">${generateStars(anime.rating)}</div>
                    <div class="rating-value">${anime.rating}/10</div>
                </div>
                <p class="anime-description">${anime.description.substring(0, 100)}...</p>
                <button class="btn btn-watch">Смотреть сейчас</button>
            </div>
        `;

        card.addEventListener('click', () => {
            if (window.animeModal) {
                window.animeModal.open(anime);
            } else {
                console.warn('Anime modal not initialized');
                // Fallback: перенаправляем на страницу аниме
                localStorage.setItem('currentAnime', JSON.stringify(anime));
                window.location.href = 'player.html';
            }
        });

        popularGrid.appendChild(card);
    });
    
    console.log('Popular anime loaded:', popularAnime.length, 'items');
}

function generateStars(rating) {
    const fullStars = Math.floor(rating / 2);
    const halfStar = rating % 2 >= 1;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
}

// Глобальные функции для использования в других файлах
window.getCurrentUser = getCurrentUser;
window.checkAuth = checkAuth;
window.logout = logout;
window.setCurrentUser = setCurrentUser;
window.requireAuth = requireAuth;