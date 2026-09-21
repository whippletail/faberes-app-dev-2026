// Wires up a form so it POSTs its fields as a JSON body to the given API url.
// On success (200 / 201) it saves the user for the homepage and redirects.
// On any error it shows a banner at the top of the card ("Error 400: ...") AND
// a message under each field the server flagged.
function setupAuthForm(formId, url) {
  const form = document.getElementById(formId);
  const banner = document.getElementById('message');
  const submit = form.querySelector('button[type="submit"]');

  function clearErrors() {
    banner.hidden = true;
    banner.textContent = '';
    form.querySelectorAll('input').forEach((input) => {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    });
    form.querySelectorAll('.field-error').forEach((note) => {
      note.hidden = true;
      note.textContent = '';
    });
  }

  function showError(text, status, errors = {}) {
    banner.textContent = status ? `Error ${status}: ${text}` : text;
    banner.hidden = false;

    let focused = false;
    Object.entries(errors).forEach(([name, message]) => {
      const input = form.elements[name];
      const note = document.getElementById(`${name}-error`);
      if (!input || !note) return;
      note.textContent = message;
      note.hidden = false;
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', note.id);
      if (!focused) {
        input.focus();
        focused = true;
      }
    });

    if (!focused) banner.scrollIntoView({ block: 'nearest' });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors();
    submit.disabled = true;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await response.json();

      if (response.status === 200 || response.status === 201) {
        sessionStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = 'home.html';
        return;
      }
      showError(data.message, response.status, data.errors);
    } catch (err) {
      showError('Could not reach the API. Open this page from the Express server (npm start, then http://localhost:3000).');
    }

    submit.disabled = false;
  });
}
