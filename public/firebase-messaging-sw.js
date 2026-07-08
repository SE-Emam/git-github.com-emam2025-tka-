importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  apiKey: "AIzaSyCTVpwaw1bUeKNR5JjjwT3HKOMWB7e2AMs",
  authDomain: "gen-lang-client-0746753147.firebaseapp.com",
  projectId: "gen-lang-client-0746753147",
  storageBucket: "gen-lang-client-0746753147.firebasestorage.app",
  messagingSenderId: "187786696972",
  appId: "1:187786696972:web:fd8784da958d56bc315129"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo-light.png',
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
