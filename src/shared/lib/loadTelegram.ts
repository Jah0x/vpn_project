export async function loadTelegramSdk() {
  if (document.getElementById('tg-sdk')) return;
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.id = 'tg-sdk';
    s.src = 'https://telegram.org/js/telegram-web-app.js';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('TG SDK failed'));
    document.head.appendChild(s);
  });
}
