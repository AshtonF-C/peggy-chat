const admin = require("firebase-admin");

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const messaging = admin.messaging();

module.exports = async (req, res) => {
  // Allow requests from the GitHub Pages website
  res.setHeader("Access-Control-Allow-Origin", "https://ashtonf-c.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const {
      room,
      senderName,
      senderUid,
      text
    } = req.body;

    if (!room || !senderName || !senderUid || !text) {
      return res.status(400).json({
        error: "Missing required information"
      });
    }

    const snapshot = await db
      .collection("notificationTokens")
      .where("room", "==", room)
      .get();

    const tokens = [];

    snapshot.forEach((doc) => {
      const data = doc.data();

      // Don't notify the person who sent the message
      if (
        data.token &&
        doc.id !== senderUid
      ) {
        tokens.push(data.token);
      }
    });

    if (tokens.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No other notification devices found",
        sent: 0
      });
    }

    const response = await messaging.sendEachForMulticast({
      tokens: tokens,

      notification: {
        title: `${senderName} sent a message`,
        body: text
      },

      webpush: {
        notification: {
          title: `${senderName} sent a message`,
          body: text,
          icon: "/peggy-chat/icon-192.png"
        }
      }
    });

    return res.status(200).json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount
    });

  } catch (error) {

    console.error("Notification error:", error);

    return res.status(500).json({
      error: "Notification failed"
    });
  }
};
