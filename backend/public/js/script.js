// Signup form submission
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email, phone })
    });

    const data = await res.json();
    if (res.ok) {
        // Show OTP verification section after signup
        document.getElementById('signup-form').style.display = 'none';
        document.getElementById('otp-section').style.display = 'block';
        alert('Signup successful! Please check your email and phone for OTP.');
    } else {
        alert('Signup failed: ' + data.message);
    }
});

// Login form submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('otp-container').style.display = 'block';
        window.localStorage.setItem('userId', data.userId);
    } else {
        alert('Login failed: ' + data.message);
    }
});

// OTP verification
document.getElementById('verify-otp').addEventListener('click', async () => {
    const otp = document.getElementById('otp').value;
    const userId = window.localStorage.getItem('userId');

    const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp })
    });

    const data = await res.json();

    if (res.ok) {
        localStorage.setItem('token', data.token); 
        window.location.href = '/admin'; // Redirect to the admin panel
    } else {
        alert('OTP verification failed: ' + data.message);
    }
});
