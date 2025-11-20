// Authentication functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

function initializeAuth() {
    // Check if we're on auth pages
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (loginForm) {
        setupLoginForm();
    }
    
    if (signupForm) {
        setupSignupForm();
    }
    
    // Check auth status on all pages
    checkAuthStatus();
}

function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        let isValid = true;

        // Reset errors
        hideError('login-email-error');
        hideError('login-password-error');
        emailInput.classList.remove('error');
        passwordInput.classList.remove('error');

        // Validation
        if (!validateEmail(email)) {
            showError('login-email-error', 'Пожалуйста, введите корректный email');
            emailInput.classList.add('error');
            isValid = false;
        }

        if (password.length < 1) {
            showError('login-password-error', 'Пожалуйста, введите пароль');
            passwordInput.classList.add('error');
            isValid = false;
        }

        if (isValid) {
            // Simple mock authentication
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                setCurrentUser(user);
                showNotification('Вход выполнен успешно!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                showNotification('Неверный email или пароль!', 'error');
            }
        }
    });
}

function setupSignupForm() {
    const signupForm = document.getElementById('signup-form');
    const usernameInput = document.getElementById('signup-username');
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    const confirmPasswordInput = document.getElementById('signup-confirm-password');
    
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        let isValid = true;

        // Reset errors
        resetSignupErrors();

        // Validation
        if (username.length < 3) {
            showError('signup-username-error', 'Имя пользователя должно содержать минимум 3 символа');
            usernameInput.classList.add('error');
            isValid = false;
        }

        if (!validateEmail(email)) {
            showError('signup-email-error', 'Пожалуйста, введите корректный email');
            emailInput.classList.add('error');
            isValid = false;
        }

        if (password.length < 6) {
            showError('signup-password-error', 'Пароль должен содержать не менее 6 символов');
            passwordInput.classList.add('error');
            isValid = false;
        }

        if (password !== confirmPassword) {
            showError('signup-confirm-password-error', 'Пароли не совпадают');
            confirmPasswordInput.classList.add('error');
            isValid = false;
        }

        // Check if user exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.find(u => u.email === email)) {
            showError('signup-email-error', 'Этот email уже зарегистрирован');
            emailInput.classList.add('error');
            isValid = false;
        }

        if (users.find(u => u.username === username)) {
            showError('signup-username-error', 'Это имя пользователя уже занято');
            usernameInput.classList.add('error');
            isValid = false;
        }

        if (isValid) {
            const newUser = {
                id: Date.now(),
                username: username,
                email: email,
                password: password,
                displayName: username,
                avatar: 'https://via.placeholder.com/150',
                bio: '',
                joinDate: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            setCurrentUser(newUser);
            
            showNotification('Регистрация прошла успешно!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    });
}

function resetSignupErrors() {
    const errors = [
        'signup-username-error',
        'signup-email-error',
        'signup-password-error',
        'signup-confirm-password-error'
    ];
    
    errors.forEach(id => hideError(id));
    
    const inputs = [
        'signup-username',
        'signup-email',
        'signup-password',
        'signup-confirm-password'
    ];
    
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.classList.remove('error');
    });
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function hideError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('isLoggedIn', 'true');
}

function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

function checkAuthStatus() {
    const currentUser = getCurrentUser();
    const authButtons = document.querySelector('.auth-buttons');
    
    if (authButtons) {
        if (currentUser) {
            authButtons.innerHTML = `
                <a href="profile.html" class="btn btn-signup">${currentUser.username}</a>
                <a href="#" class="btn btn-login" id="logout-btn">Выйти</a>
            `;
            
            document.getElementById('logout-btn').addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        } else {
            authButtons.innerHTML = `
                <a href="login.html" class="btn btn-login">Войти</a>
                <a href="signup.html" class="btn btn-signup">Регистрация</a>
            `;
        }
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    showNotification('Вы вышли из системы', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ff6b9c' : type === 'success' ? '#6c8cff' : '#ff6b9c'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}