// Profile page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Универсальная функция для работы с хранилищем
    function getStorage() {
        if (typeof(Storage) !== "undefined") {
            return localStorage;
        } else {
            return window.fallbackStorage ? {
                getItem: function(key) { return window.fallbackStorage[key] || null; },
                removeItem: function(key) { delete window.fallbackStorage[key]; },
                setItem: function(key, value) { window.fallbackStorage[key] = value; }
            } : { getItem: () => null, removeItem: () => {}, setItem: () => {} };
        }
    }
    
    const storage = getStorage();

    // Получить текущего пользователя
    function getCurrentUser() {
        const userData = storage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    }

    // Сохранить текущего пользователя
    function setCurrentUser(user) {
        storage.setItem('currentUser', JSON.stringify(user));
    }

    // Выход из системы
    function logout() {
        storage.removeItem('currentUser');
        storage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
    }
    
    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (!currentUser && window.location.pathname.includes('profile.html')) {
        window.location.href = 'login.html';
        return;
    }

    // Заполнение данных профиля
    function loadProfileData() {
        if (!currentUser) return;

        // Заполняем форму личной информации
        document.getElementById('profile-username').value = currentUser.username || '';
        document.getElementById('profile-display-name').value = currentUser.displayName || '';
        document.getElementById('profile-email').value = currentUser.email || '';
        document.getElementById('profile-bio').value = currentUser.bio || '';

        // Устанавливаем аватар
        const avatarImage = document.getElementById('avatar-image');
        if (avatarImage && currentUser.avatar) {
            avatarImage.src = currentUser.avatar;
        }

        // Заполняем настройки
        if (currentUser.preferences) {
            document.getElementById('profile-language').value = currentUser.preferences.language || 'ru';
            document.getElementById('profile-theme').value = currentUser.preferences.theme || 'dark';
            
            if (currentUser.preferences.notifications) {
                document.getElementById('profile-notifications-email').checked = currentUser.preferences.notifications.email;
                document.getElementById('profile-notifications-push').checked = currentUser.preferences.notifications.push;
                document.getElementById('profile-notifications-newsletter').checked = currentUser.preferences.notifications.newsletter;
            }
        }
    }

    // Загружаем данные при загрузке страницы
    loadProfileData();
    
    // Profile navigation
    const profileMenuLinks = document.querySelectorAll('.profile-menu-link');
    const profileSections = document.querySelectorAll('.profile-section');
    
    profileMenuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            
            profileMenuLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            profileSections.forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(sectionId).classList.add('active');
        });
    });
    
    // Avatar change
    const changeAvatarBtn = document.getElementById('change-avatar-btn');
    const avatarInput = document.getElementById('avatar-input');
    const avatarImage = document.getElementById('avatar-image');
    
    if (changeAvatarBtn && avatarInput && avatarImage) {
        changeAvatarBtn.addEventListener('click', function() {
            avatarInput.click();
        });
        
        avatarInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    avatarImage.src = e.target.result;
                    // Сохраняем новый аватар
                    const updatedUser = window.userDB.updateUser(currentUser.id, {
                        avatar: e.target.result
                    });
                    if (updatedUser) {
                        setCurrentUser(updatedUser);
                        alert('Аватар обновлен!');
                    }
                }
                
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
    
    // Email validation function
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Profile info form
    const profileInfoForm = document.getElementById('profile-info-form');
    if (profileInfoForm) {
        profileInfoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('profile-email').value;
            const displayName = document.getElementById('profile-display-name').value;
            const bio = document.getElementById('profile-bio').value;
            let isValid = true;
            
            if (!validateEmail(email)) {
                document.getElementById('profile-email-error').style.display = 'block';
                document.getElementById('profile-email').classList.add('error');
                isValid = false;
            } else {
                document.getElementById('profile-email-error').style.display = 'none';
                document.getElementById('profile-email').classList.remove('error');
            }
            
            if (isValid) {
                const updates = {
                    displayName: displayName,
                    email: email,
                    bio: bio
                };

                const updatedUser = window.userDB.updateUser(currentUser.id, updates);
                if (updatedUser) {
                    setCurrentUser(updatedUser);
                    alert('Изменения сохранены!');
                } else {
                    alert('Ошибка при сохранении изменений!');
                }
            }
        });
    }
    
    // Profile security form
    const profileSecurityForm = document.getElementById('profile-security-form');
    if (profileSecurityForm) {
        profileSecurityForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const currentPassword = document.getElementById('profile-current-password').value;
            const newPassword = document.getElementById('profile-new-password').value;
            const confirmPassword = document.getElementById('profile-confirm-password').value;
            let isValid = true;
            
            // Проверяем текущий пароль
            if (!window.userDB.verifyPassword(currentUser, currentPassword)) {
                alert('Текущий пароль неверен!');
                isValid = false;
            }
            
            if (newPassword.length > 0 && newPassword.length < 6) {
                document.getElementById('profile-new-password-error').style.display = 'block';
                document.getElementById('profile-new-password').classList.add('error');
                isValid = false;
            } else {
                document.getElementById('profile-new-password-error').style.display = 'none';
                document.getElementById('profile-new-password').classList.remove('error');
            }
            
            if (newPassword !== confirmPassword) {
                document.getElementById('profile-confirm-password-error').style.display = 'block';
                document.getElementById('profile-confirm-password').classList.add('error');
                isValid = false;
            } else {
                document.getElementById('profile-confirm-password-error').style.display = 'none';
                document.getElementById('profile-confirm-password').classList.remove('error');
            }
            
            if (isValid && newPassword.length >= 6) {
                const success = window.userDB.changePassword(currentUser.id, newPassword);
                if (success) {
                    // Обновляем данные пользователя в сессии
                    const updatedUser = window.userDB.findUserByEmail(currentUser.email);
                    setCurrentUser(updatedUser);
                    alert('Пароль изменен успешно!');
                    document.getElementById('profile-security-form').reset();
                } else {
                    alert('Ошибка при изменении пароля!');
                }
            }
        });
    }
    
    // Profile preferences form
    const profilePreferencesForm = document.getElementById('profile-preferences-form');
    if (profilePreferencesForm) {
        profilePreferencesForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const language = document.getElementById('profile-language').value;
            const theme = document.getElementById('profile-theme').value;
            const emailNotifications = document.getElementById('profile-notifications-email').checked;
            const pushNotifications = document.getElementById('profile-notifications-push').checked;
            const newsletter = document.getElementById('profile-notifications-newsletter').checked;

            const updates = {
                preferences: {
                    language: language,
                    theme: theme,
                    notifications: {
                        email: emailNotifications,
                        push: pushNotifications,
                        newsletter: newsletter
                    }
                }
            };

            const updatedUser = window.userDB.updateUser(currentUser.id, updates);
            if (updatedUser) {
                setCurrentUser(updatedUser);
                alert('Настройки сохранены!');
            } else {
                alert('Ошибка при сохранении настроек!');
            }
        });
    }
    
    // Logout functionality
    const logoutBtn = document.querySelector('.btn-login');
    if (logoutBtn && logoutBtn.textContent === 'Выйти') {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});