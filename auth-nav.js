(() => {
  let session = null;

  try {
    session = JSON.parse(localStorage.getItem('dors_session') || 'null');
  } catch {
    session = null;
  }

  if (!session?.user || !session.token) return;

  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;

  const displayName = session.user.name || session.user.email || 'Account';
  navActions.innerHTML = `
    <a href="dashboard.html" class="nav-link">${displayName}</a>
    <button type="button" class="button button-primary" id="standalone-logout">Log out</button>
  `;

  document.getElementById('standalone-logout').addEventListener('click', () => {
    localStorage.removeItem('dors_session');
    window.location.reload();
  });
})();
