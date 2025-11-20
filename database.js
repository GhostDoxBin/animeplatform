// База данных пользователей
class UserDatabase {
    constructor() {
        console.log('UserDatabase constructor called');
        this.storageKey = 'animePlatformUsers';
        this.init();
    }

    init() {
        console.log('Initializing database...');
        if (!this.getUsers()) {
            console.log('Creating default users...');
            const defaultUsers = [
                {
                    id: 1,
                    username: 'admin',
                    email: 'admin@anime.ru',
                    password: '123456',
                    displayName: 'Администратор',
                    avatar: 'https://via.placeholder.com/150',
                    bio: 'Люблю аниме больше жизни!',
                    joinDate: new Date().toISOString()
                }
            ];
            this.saveUsers(defaultUsers);
        }
        console.log('Database initialized successfully');
    }

    getUsers() {
        const usersJson = localStorage.getItem(this.storageKey);
        return usersJson ? JSON.parse(usersJson) : null;
    }

    saveUsers(users) {
        localStorage.setItem(this.storageKey, JSON.stringify(users));
    }

    findUserByEmail(email) {
        const users = this.getUsers();
        console.log('Searching user by email:', email, 'in users:', users);
        return users ? users.find(user => user.email === email) : null;
    }

    findUserByUsername(username) {
        const users = this.getUsers();
        console.log('Searching user by username:', username, 'in users:', users);
        return users ? users.find(user => user.username === username) : null;
    }

    createUser(userData) {
        console.log('Creating new user:', userData);
        const users = this.getUsers() || [];
        const newUser = {
            id: Date.now(),
            username: userData.username,
            email: userData.email,
            password: userData.password,
            displayName: userData.displayName || userData.username,
            avatar: userData.avatar || 'https://via.placeholder.com/150',
            bio: userData.bio || '',
            joinDate: new Date().toISOString()
        };

        users.push(newUser);
        this.saveUsers(users);
        console.log('User created successfully:', newUser);
        return newUser;
    }

    updateUser(userId, updates) {
        const users = this.getUsers();
        if (!users) return false;

        const userIndex = users.findIndex(user => user.id === userId);
        if (userIndex === -1) return false;

        Object.assign(users[userIndex], updates);
        this.saveUsers(users);
        return users[userIndex];
    }

    changePassword(userId, newPassword) {
        const users = this.getUsers();
        if (!users) return false;

        const userIndex = users.findIndex(user => user.id === userId);
        if (userIndex === -1) return false;

        users[userIndex].password = newPassword;
        this.saveUsers(users);
        return true;
    }

    verifyPassword(user, password) {
        return user.password === password;
    }
}

// Создаем глобальный экземпляр
console.log('Creating global userDB instance...');
window.userDB = new UserDatabase();
console.log('userDB created:', window.userDB);