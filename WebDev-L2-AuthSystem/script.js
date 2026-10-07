// auth logic

document.addEventListener('DOMContentLoaded', () => {
    // Determine which page we are on
    const isDashboard = window.location.pathname.includes('dashboard.html');

    if (isDashboard) {
        initDashboard();
    } else {
        initAuth();
    }
});

// Helper function to hash password securely
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// index.html code
function initAuth() {
    // Check if user is already logged in
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        window.location.href = 'dashboard.html';
        return;
    }

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');
    
    const loginWrapper = document.getElementById('login-form-wrapper');
    const registerWrapper = document.getElementById('register-form-wrapper');
    
    const loginAlert = document.getElementById('login-alert');
    const registerAlert = document.getElementById('register-alert');

    // Toggle Forms
    showRegisterBtn.addEventListener('click', () => {
        loginWrapper.classList.add('hidden');
        registerWrapper.classList.remove('hidden');
        registerForm.reset();
        hideAlert(registerAlert);
    });

    showLoginBtn.addEventListener('click', () => {
        registerWrapper.classList.add('hidden');
        loginWrapper.classList.remove('hidden');
        loginForm.reset();
        hideAlert(loginAlert);
    });

    // Handle Registration
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim().toLowerCase();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        // Validation: Min 8 chars, at least 1 number
        const passwordRegex = /^(?=.*[0-9]).{8,}$/;
        if (!passwordRegex.test(password)) {
            showAlert(registerAlert, 'Password must be at least 8 characters long and contain at least one number.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showAlert(registerAlert, 'Passwords do not match.', 'error');
            return;
        }

        // Fetch users from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];

        // Duplicate Check
        const userExists = users.some(u => u.email === email);
        if (userExists) {
            showAlert(registerAlert, 'An account with this email already exists.', 'error');
            return;
        }

        // Hash Password and Save
        try {
            const hashedPassword = await hashPassword(password);
            
            const newUser = {
                id: Date.now().toString(),
                name: name,
                email: email,
                password: hashedPassword,
                createdAt: new Date().toLocaleDateString()
            };

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            showAlert(registerAlert, 'Registration successful! You can now login.', 'success');
            registerForm.reset();
            
            // Switch to login after 2 seconds
            setTimeout(() => {
                showLoginBtn.click();
            }, 2000);
        } catch (error) {
            showAlert(registerAlert, 'An error occurred during registration.', 'error');
        }
    });

    // Handle Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value;

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email);

        if (!user) {
            showAlert(loginAlert, 'Invalid email or password.', 'error');
            return;
        }

        try {
            const hashedPassword = await hashPassword(password);
            if (user.password === hashedPassword) {
                // Successful login
                const sessionUser = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt
                };
                localStorage.setItem('currentUser', JSON.stringify(sessionUser));
                window.location.href = 'dashboard.html';
            } else {
                showAlert(loginAlert, 'Invalid email or password.', 'error');
            }
        } catch (error) {
            showAlert(loginAlert, 'An error occurred during login.', 'error');
        }
    });
}

// dashboard code
function initDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Protected Route Check
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Populate Data
    document.getElementById('welcome-message').innerText = `Hello, ${currentUser.name}!`;
    document.getElementById('user-name').innerText = currentUser.name;
    document.getElementById('user-email').innerText = currentUser.email;
    document.getElementById('user-date').innerText = currentUser.createdAt;

    // Handle Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
}

// Helper functions for alerts
function showAlert(element, message, type) {
    element.textContent = message;
    element.className = `alert ${type}`;
    element.classList.remove('hidden');
}

function hideAlert(element) {
    element.classList.add('hidden');
    element.textContent = '';
}
