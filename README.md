# 🔔 Sambandha Notification Server

A lightweight Express.js server that delivers FCM push notifications for the Sambandha dating app using **Firebase Admin SDK**.

## Live URL
**https://notification-server-8xof.onrender.com**

## How it works

1. Flutter app calls `POST /send-notification` with the receiver's UID, title, and body.
2. The server looks up the receiver's `fcmToken` from Firestore (`users/{receiverUid}`).
3. Firebase Admin SDK sends the push notification directly to the device.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Health check — returns `{ status: 'Server is running!' }` |
| `POST` | `/send-notification` | Send a push notification |

### POST `/send-notification`

**Request body:**
```json
{
  "receiverUid": "firebase-user-uid",
  "title": "New Message",
  "body": "You have a new message!",
  "data": {
    "type": "chat",
    "senderId": "sender-uid"
  }
}
```

**Response (200):**
```json
{ "success": true, "messageId": "projects/.../messages/..." }
```

## Deployment on Render

### Environment Variable
In Render dashboard → **Environment**:

| Key | Value |
|-----|-------|
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | *(your base64-encoded service account JSON)* |

**To generate the base64 value:**
```bash
# On Windows PowerShell:
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("path\to\service-account.json"))

# On Mac/Linux:
base64 -i path/to/service-account.json
```

## Local Development

```bash
npm install

# Create a .env file:
echo "FIREBASE_SERVICE_ACCOUNT_BASE64=<your-base64-value>" > .env

# Run:
node index.js
# Server starts on http://localhost:3000
```

## Security Note
- The `FIREBASE_SERVICE_ACCOUNT_BASE64` env var is **never** committed to git (`.gitignore` excludes `.env`).
- In production, set it as a Render environment secret.
