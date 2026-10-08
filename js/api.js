// Endpoint real de API Gateway (POST /contact → Lambda vertice-contact).
const API_URL = 'https://l9fwto4cai.execute-api.us-east-1.amazonaws.com/dev/contact';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('trial-form');
  if (!form) {
    console.warn('No se encontró el formulario #trial-form');
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  const status = document.getElementById('form-status');
  const buttonText = button.textContent;

  form.addEventListener('submit', async (event) => {
    // Evitamos la recarga normal del formulario.
    event.preventDefault();

    // Leemos los valores del DOM.
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();

    if (!name || !email) {
      showStatus('error', 'Escribe tu nombre y tu email para pedir la sesión.');
      return;
    }

    // Lo que guardará la Lambda en DynamoDB y publicará en SNS.
    const payload = {
      name,
      email,
      message: 'Solicitud de sesión de prueba - Vértice Rocódromo'
    };
    console.log('Payload:', payload);

    button.disabled = true;
    button.textContent = 'Enviando…';
    showStatus('', '');

    try {
      // Enviamos JSON mediante POST.
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));
      console.log('Respuesta API:', response.status, result);

      if (!response.ok) {
        throw new Error(result.error ?? 'Error al enviar la solicitud');
      }

      form.reset();
      showStatus('ok', `Solicitud enviada. Te escribiremos a ${email} en menos de 24 horas para elegir día y hora.`);
    } catch (error) {
      console.error('Error API:', error);
      showStatus('error', 'No se ha podido enviar la solicitud. Comprueba tu conexión y vuelve a intentarlo.');
    } finally {
      button.disabled = false;
      button.textContent = buttonText;
    }
  });

  // textContent (no innerHTML): lo que escribe el usuario nunca se interpreta como HTML.
  function showStatus(type, text) {
    status.textContent = text;
    status.dataset.type = type;
  }
});
