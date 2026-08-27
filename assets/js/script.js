document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#bookingForm');
  const message = document.querySelector('#formMessage');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    message.textContent = 'Thanks. We will be in touch shortly.';
    form.reset();
  });
});
