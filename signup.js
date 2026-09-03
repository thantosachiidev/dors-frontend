const API_BASE = window.DORS_API_BASE_URL || (
  window.location.hostname === 'dors-portfoliobuilder.netlify.app'
    ? 'https://dors-backend.onrender.com'
    : 'http://localhost:3001'
);
const form = document.getElementById('signup-form');
const messageBox = document.getElementById('signup-message');
const googleButton = document.getElementById('google-signup');

function saveSession(user, token) {
  localStorage.setItem('dors_session', JSON.stringify({ user, token, createdAt: Date.now() }));
}

function showMessage(type, text) {
  messageBox.className = `form-message ${type}`;
  messageBox.textContent = text;
}

function getAccountType() {
  const selected = document.querySelector('input[name="accountType"]:checked');
  return selected ? selected.value : 'creator';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    accountType: getAccountType(),
  };

  const trimmedName = payload.name.trim();
  const trimmedEmail = payload.email.trim();
  const password = payload.password;

  if (trimmedName.length < 2) {
    showMessage('error', 'Name must be at least 2 characters long.');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    showMessage('error', 'Please enter a valid email address.');
    return;
  }

  if (password.length < 8) {
    showMessage('error', 'Password must be at least 8 characters long.');
    return;
  }

  try {
    showMessage('info', 'Creating your account...');

    const response = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      const message = Array.isArray(result.errors) ? result.errors.join(' ') : 'Signup failed.';
      showMessage('error', message);
      return;
    }

    saveSession(result.user, result.token);
    showMessage('success', 'Account created! Redirecting you to onboarding...');
    window.location.href = 'onboarding.html';
  } catch (error) {
    console.error(error);
    showMessage('error', 'Unable to create account right now. Please try again.');
  }
});

googleButton.addEventListener('click', async () => {
  const googleName = 'Google User';
  const googleEmail = `google.user.${Date.now()}@example.com`;

  try {
    showMessage('info', 'Creating your Google account...');

    const response = await fetch(`${API_BASE}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: googleName,
        email: googleEmail,
        accountType: getAccountType(),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      const message = Array.isArray(result.errors) ? result.errors.join(' ') : 'Google signup failed.';
      showMessage('error', message);
      return;
    }

    saveSession(result.user, result.token);
    showMessage('success', 'Google sign-up successful. Redirecting...');
    window.location.href = 'onboarding.html';
  } catch (error) {
    console.error(error);
    showMessage('error', 'Google sign-up is unavailable right now.');
  }
});
