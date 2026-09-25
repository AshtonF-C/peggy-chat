importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCvx9Oo3xZxkyfGZ-Hm5Xj5os56fVoEX2o",
  authDomain: "peggy-chat-4c0e3.firebaseapp.com",
  projectId: "peggy-chat-4c0e3",
  storageBucket: "peggy-chat-4c0e3.firebasestorage.app",
  messagingSenderId: "126560387796",
  appId: "1:126560387796:web:aafabb5ad5d44efec4b141",
  measurementId: "G-94E71PCH6J"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);

  const notificationTitle =
    payload.notification?.title || "MateChat";

  const notificationOptions = {
    body:
      payload.notification?.body ||
      "You have a new message.",
    icon: "/peggy-chat/icon-192.png"
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});
