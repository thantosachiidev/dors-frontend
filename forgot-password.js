const API_BASE = window.DORS_API_BASE_URL || (
  window.location.hostname === 'dors-portfoliobuilder.netlify.app'
    ? 'https://dors-backend.onrender.com'
    : 'http://localhost:3001'
);
const form = document.getElementById('forgot-password-form');
const messageBox = document.getElementById('forgot-message');

function showMessage(type, text) {
  messageBox.className = `form-message ${type}`;
  messageBox.textContent = text;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('forgot-email').value.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showMessage('error', 'Please enter a valid email address.');
    return;
  }

  try {
    showMessage('info', 'Sending reset link...');

    const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      const message = Array.isArray(result.errors) ? result.errors.join(' ') : 'Unable to send reset link.';
      showMessage('error', message);
      return;
    }

    showMessage('success', result.message || 'Password reset email sent.');
  } catch (error) {
    console.error(error);
    showMessage('error', 'Unable to send the reset link right now.');
  }
});
