self.addEventListener('push', (event) => {
  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch (error) {
      payload = { body: event.data.text() };
    }
  }

  const title = payload.title || 'Notification';
  const options = {
    body: payload.body,
    icon: payload.icon,
    data: payload,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(handleNotificationEvent('CLICK', event));
});

self.addEventListener('notificationclose', (event) => {
  event.waitUntil(handleNotificationEvent('CLOSE', event));
});

async function handleNotificationEvent(type, event) {
  const data = event.notification ? event.notification.data || {} : {};
  const subscription = await self.registration.pushManager.getSubscription();
  const payload = {
    type,
    notificationData: data,
    timestamp: Date.now(),
    subscriptionEndpoint: subscription ? subscription.endpoint : undefined,
    campaignId: data.campaignId,
  };

  try {
    await fetch('/client-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    // Ignore network errors in service worker.
  }

  if (type === 'CLICK' && data.url) {
    await clients.openWindow(data.url);
  }
}
