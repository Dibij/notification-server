const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin with base64 service account
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  const json = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
  serviceAccount = JSON.parse(json);
} else {
  console.error('No Firebase credentials found.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// Endpoint to send notification
app.post('/send-notification', async (req, res) => {
  const { receiverUid, title, body, data } = req.body;

  if (!receiverUid || !title || !body) {
    return res.status(400).json({ error: 'Missing fields: receiverUid, title, body required' });
  }

  try {
    // Fetch receiver's FCM token from Firestore
    const userDoc = await db.collection('users').doc(receiverUid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    const fcmToken = userDoc.data().fcmToken;
    if (!fcmToken) {
      return res.status(404).json({ error: 'FCM token not found for user' });
    }

    const message = {
      token: fcmToken,
      notification: {
        title: title,
        body: body,
      },
      data: data || {},
      android: {
        priority: 'high',
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent:', response);
    res.status(200).json({ success: true, messageId: response });
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
