# SynqNotify Pro 🚀
### The Ultimate OS-Native Developer Notification Hub

SynqNotify is a powerful, professional-grade PWA that bridges the gap between your local system scripts and your mobile devices. It transforms your PC into an intelligent assistant that watches file changes, handles developer webhooks, and syncs reminders globally.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-2.0.0-6366f1.svg)

---

## ✨ Pro Features

*   **🖥️ Headless OS Integration**: Get Windows system toasts natively via its Node.js backend. Works even if your browser is closed.
*   **📧 Cross-Device Email Sync**: Professional HTML-formatted email alerts for every system event.
*   **⚡ Developer Webhook API**: A one-line integration for any script (Python, JS, C#, Shell).
*   **📂 Automatic Download Monitor**: Native file-system watcher (Chokidar) that notifies you when downloads or builds are ready.
*   **💾 Activity Hub**: A persistent database (JSON-backed) that stores your history across reboots.
*   **🔍 System Health Hub**: Real-time diagnostic bar for notification permissions and backend status.

---

## 🛠️ Quick Start

### 1. Prerequisites
*   Node.js (v18+)
*   Python (for demos)

### 2. Installation
Clone the repository and install dependencies for both the frontend and backend:

```bash
# Install Frontend
npm install

# Install Backend
cd src/backend
npm install
```

### 3. Launching SynqNotify
Run both components simultaneously from the root directory:

```bash
# Terminal 1: Run Frontend (Vite)
npm run dev

# Terminal 2: Run Backend (Node)
cd src/backend
npm start
```

---

## 👨‍💻 Developer Webhook API

Trigger a synchronized desktop + email notification from ANY external script.

**Endpoint**: `POST http://localhost:3000/api/notify`

**Request Body**:
```json
{
  "title": "Build Finished 🏗️",
  "message": "Project v2.1.0 deployed to staging successfully.",
  "type": "SUCCESS"
}
```

### Python Integration Example
```python
import requests

requests.post('http://localhost:3000/api/notify', json={
    'message': 'Task execution completed ✅',
    'title': 'Development Hook'
})
```

---

## ⚙️ Configuration (Email Sync)

To receive cross-device notifications on your phone, you must configure your **Gmail App Password**.

1.  Go to the **Settings** tab in SynqNotify.
2.  Provide your Gmail address and a [Google App Password](https://myaccount.google.com/apppasswords).
3.  Click **Test Connectivity** to verify instantly!

---

## 🛡️ License
Released under the [MIT License](LICENSE).
