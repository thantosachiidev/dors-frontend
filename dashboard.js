const session = (() => {
  try {
    return JSON.parse(localStorage.getItem('dors_session') || 'null');
  } catch {
    return null;
  }
})();

const user = session?.user || {};
const displayName = user.name || user.email || 'Account';
const initials = displayName
  .split(/\s+/)
  .map((part) => part[0])
  .slice(0, 2)
  .join('')
  .toUpperCase();

const avatar = document.getElementById('user-avatar');
const name = document.getElementById('user-name');
const role = document.getElementById('user-role');
const logoutButton = document.getElementById('logout-button');

avatar.textContent = initials || 'U';
name.textContent = displayName;
role.textContent = String(user.accountType || 'buyer').replace(/^./, (letter) => letter.toUpperCase());

logoutButton.addEventListener('click', () => {
  localStorage.removeItem('dors_session');
  window.location.href = 'signin.html';
});
