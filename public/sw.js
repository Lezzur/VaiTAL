self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json()
        const options = {
            body: data.body,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: '2'
            },
            actions: [
                {
                    action: 'explore',
                    title: 'Mark as Taken',
                    icon: '/checkmark.png'
                },
                {
                    action: 'close',
                    title: 'Close',
                    icon: '/xmark.png'
                }
            ]
        }
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        )
    }
})

self.addEventListener('notificationclick', function (event) {
    console.log('Notification click received.')
    event.notification.close()
    event.waitUntil(
        clients.openWindow('https://vaital.vercel.app/scheduler') // Replace with your production URL later
    )
})
