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
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { room, senderName, text } = req.body;

    if (!room || !senderName || !text) {
      return res.status(400).json({
        error: "Missing room, senderName or text"
      });
    }

    // Find notification tokens belonging to this chat room
    const snapshot = await db
      .collection("notificationTokens")
      .where("room", "==", room)
      .get();

    const tokens = [];

    snapshot.forEach((doc) => {
      const data = doc.data();

      if (data.token) {
        tokens.push(data.token);
      }
    });

    if (tokens.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No notification tokens found"
      });
    }

    const response = await messaging.sendEachForMulticast({
      tokens,
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
    console.error(error);

    return res.status(500).json({
      error: "Notification failed"
    });
  }
};
