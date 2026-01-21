const statusEl = document.getElementById('status');
const button = document.getElementById('subscribe');

const setStatus = (message) => {
  statusEl.textContent = message;
};

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const registerAndSubscribe = async () => {
  if (!('serviceWorker' in navigator)) {
    setStatus('Service workers are not supported in this browser.');
    return;
  }

  if (!('PushManager' in window)) {
    setStatus('Push notifications are not supported in this browser.');
    return;
  }

  const registration = await navigator.serviceWorker.register('/sw.js');
  const permission = await Notification.requestPermission();

  if (permission !== 'granted') {
    setStatus('Notification permission denied.');
    return;
  }

  const existing = await registration.pushManager.getSubscription();
  const publicKeyResponse = await fetch('/vapid/public-key');
  const { publicKey } = await publicKeyResponse.json();

  const subscription =
    existing ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    }));

  await fetch('/subscriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  });

  setStatus('Subscribed successfully.');
};

button.addEventListener('click', () => {
  registerAndSubscribe().catch((error) => {
    setStatus(`Subscription error: ${error.message || error}`);
  });
});

window.addEventListener('load', () => {
  registerAndSubscribe().catch((error) => {
    setStatus(`Subscription error: ${error.message || error}`);
  });
});
