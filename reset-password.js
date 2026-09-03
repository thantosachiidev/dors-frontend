const form = document.getElementById('reset-password-form');
const messageBox = document.getElementById('reset-message');
const API_BASE = window.DORS_API_BASE_URL || (
  window.location.hostname === 'dors-portfoliobuilder.netlify.app'
    ? 'https://dors-backend.onrender.com'
    : 'http://localhost:3001'
);

function showMessage(type, text) {
  messageBox.className = `form-message ${type}`;
  messageBox.textContent = text;
}

function getTokenFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('token');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const password = document.getElementById('new-password').value;
  const token = getTokenFromQuery();

  if (!token) {
    showMessage('error', 'Missing reset token. Please request a new link.');
    return;
  }

  if (password.length < 8) {
    showMessage('error', 'Password must be at least 8 characters long.');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      const message = Array.isArray(result.errors) ? result.errors.join(' ') : 'Unable to reset password.';
      showMessage('error', message);
      return;
    }

    showMessage('success', result.message || 'Password reset successfully.');
    setTimeout(() => {
      window.location.href = 'signin.html';
    }, 1200);
  } catch (error) {
    console.error(error);
    showMessage('error', 'Could not reset the password right now.');
  }
});
