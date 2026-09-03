const API_BASE = window.DORS_API_BASE_URL || (
  window.location.hostname === 'dors-portfoliobuilder.netlify.app'
    ? 'https://dors-backend.onrender.com'
    : 'http://localhost:3001'
);
const form = document.getElementById('signin-form');
const messageBox = document.getElementById('signin-message');
const googleButton = document.getElementById('google-signin');

function showMessage(type, text) {
  messageBox.className = `form-message ${type}`;
  messageBox.textContent = text;
}

function saveSession(user, token) {
  localStorage.setItem('dors_session', JSON.stringify({ user, token, createdAt: Date.now() }));
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
  };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
    showMessage('error', 'Please enter a valid email address.');
    return;
  }

  if (payload.password.length < 8) {
    showMessage('error', 'Password must be at least 8 characters long.');
    return;
  }

  try {
    showMessage('info', 'Signing you in...');

    const response = await fetch(`${API_BASE}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      const message = Array.isArray(result.errors) ? result.errors.join(' ') : 'Sign-in failed.';
      showMessage('error', message);
      return;
    }

    saveSession(result.user, result.token);
    showMessage('success', 'Signed in successfully. Redirecting...');
    window.location.href = 'dashboard.html';
  } catch (error) {
    console.error(error);
    showMessage('error', 'Unable to sign in right now. Please try again.');
  }
});

googleButton.addEventListener('click', async () => {
  try {
    showMessage('info', 'Connecting with Google...');

    const response = await fetch(`${API_BASE}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Google User',
        email: `google.user.${Date.now()}@example.com`,
        accountType: 'both',
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      const message = Array.isArray(result.errors) ? result.errors.join(' ') : 'Google sign-in failed.';
      showMessage('error', message);
      return;
    }

    saveSession(result.user, `google-token-${Date.now()}`);
    showMessage('success', 'Google sign-in successful. Redirecting...');
    window.location.href = 'dashboard.html';
  } catch (error) {
    console.error(error);
    showMessage('error', 'Google sign-in is unavailable right now.');
  }
});
