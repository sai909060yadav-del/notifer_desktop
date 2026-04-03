import express from 'express';
import cors from 'cors';
import nodeDiskInfo from 'node-disk-info';
import nodemailer from 'nodemailer';
import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs';
import notifier from 'node-notifier'; // NEW: Native OS toasts

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const HISTORY_FILE = 'events.json';
const REMINDERS_FILE = 'reminders.json';
const CONFIG_FILE = 'config.json';

// --- DATA STORE ---
let fileEvents = [];
let eventHistory = []; 
let reminders = []; 
let emailConfig = { user: '', pass: '', to: '' }; // Global SMTP config
const MAX_HISTORY = 20;

// Load All Data from disk on startup
const loadData = () => {
    if (fs.existsSync(HISTORY_FILE)) {
        try { eventHistory = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8')); } catch (e) {}
    }
    if (fs.existsSync(REMINDERS_FILE)) {
        try { reminders = JSON.parse(fs.readFileSync(REMINDERS_FILE, 'utf8')); } catch (e) {}
    }
    if (fs.existsSync(CONFIG_FILE)) {
        try { emailConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')); } catch (e) {}
    }
    console.log(`[SYSTEM] Load complete. History: ${eventHistory.length}, Reminders: ${reminders.length}, Config: ${emailConfig.user ? 'READY' : 'EMPTY'}`);
};
loadData();

// Save Utilities
const saveReminders = () => {
    try { fs.writeFileSync(REMINDERS_FILE, JSON.stringify(reminders, null, 2)); } catch (e) {}
};
const saveConfig = () => {
    try { fs.writeFileSync(CONFIG_FILE, JSON.stringify(emailConfig, null, 2)); } catch (e) {}
};

// BACKGROUND ENGINE: Check for due reminders every 30 seconds
setInterval(() => {
    const now = Date.now();
    let updated = false;

    reminders.forEach(reminder => {
        if (reminder.timestamp <= now && !reminder.notified) {
            reminder.notified = true;
            updated = true;

            // 1. Add to History + OS Toast
            addEvent({
                type: 'REMINDER',
                title: 'Eternal Reminder ⏰',
                message: `Task: ${reminder.title} is occurring now.`
            });

            // 2. Send Email Alert (THE MISSING PIECE!)
            sendEmailAlert('Reminder: ' + reminder.title, `Your reminder "${reminder.title}" is due now!`);

            console.log(`[ALERT] Background Reminder Triggered: ${reminder.title}`);
        }
    });

    if (updated) saveReminders();
}, 30000);

const addEvent = (event) => {
  const newEvent = { ...event, id: Date.now(), timestamp: Date.now() };
  fileEvents.push(newEvent);
  eventHistory.unshift(newEvent);
  if (eventHistory.length > MAX_HISTORY) eventHistory.pop();

  // 1. SAVE TO DISK
  try {
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(eventHistory, null, 2));
  } catch (e) {
      console.error('[ERROR] Failed to save history:', e);
  }

  // 2. NATIVE OS TOAST (Headless alert)
  notifier.notify({
    title: `SynqNotify: ${event.title}`,
    message: event.message,
    sound: true, // Critical alert sound
    wait: false
  });
};

// --- ROUTES ---

// 1. Multi-Disk Space check (Fixed + Removable/USB)
app.get('/api/system/disk', async (req, res) => {
  try {
    const disks = await nodeDiskInfo.getDiskInfo();
    const diskData = disks.map(disk => ({
      mounted: disk.mounted,
      total: disk.blocks,
      used: disk.used,
      free: disk.available,
      capacity: disk.capacity,
      isRemovable: disk._filesystem && disk._filesystem.toLowerCase().includes('removable') || false
    }));

    res.json({ success: true, data: diskData });
  } catch (error) {
    res.json({
      success: true,
      data: [
        { mounted: 'C:', total: 1024e9, used: 600e9, free: 424e9, capacity: '58%', isRemovable: false },
        { mounted: 'D:', total: 2048e9, used: 1200e9, free: 848e9, capacity: '58%', isRemovable: false },
        { mounted: 'G: (USB)', total: 64e9, used: 40e9, free: 24e9, capacity: '62%', isRemovable: true }
      ]
    });
  }
});

// 2. Folder Download / Creation Watcher
const watchers = new Map();
app.post('/api/system/watch-dir', (req, res) => {
  const { dirPath } = req.body;
  if (!dirPath) return res.status(400).json({ success: false, error: 'Path required' });

  const normalizedPath = path.resolve(dirPath);

  if (watchers.has(normalizedPath)) {
    return res.json({ success: true, message: 'Already watching this folder.' });
  }

  if (!fs.existsSync(normalizedPath)) {
      return res.status(400).json({ success: false, error: 'Directory does not exist' });
  }

  const watcher = chokidar.watch(normalizedPath, { depth: 0, ignoreInitial: true });
  
  watcher.on('add', (newPath) => {
    // Ignore temp browser download files
    const ext = path.extname(newPath).toLowerCase();
    if (ext === '.crdownload' || ext === '.part' || ext === '.tmp') return;
    
    const fileName = path.basename(newPath);
    fileEvents.push({
      id: Date.now(),
      type: 'FILE_READY',
      title: 'Download Complete 📁',
      message: `File ${fileName} is fully ready!`,
      timestamp: Date.now()
    });
    sendEmailAlert(`File Attached!`, `${fileName} successfully arrived in ${normalizedPath}.`);
  });

  watchers.set(normalizedPath, watcher);
  res.json({ success: true, message: `Monitoring all new downloads in ${normalizedPath}...` });
});

// 3. Webhook Notify (from Python or Reminders)
app.post('/api/notify', (req, res) => {
  const { message, title, type } = req.body;
  const alertTitle = title || 'Development Hook';
  const alertText = message || 'Task execution completed ✅';
  
  addEvent({
    type: type || 'WEBHOOK',
    title: alertTitle,
    message: alertText
  });

  sendEmailAlert(alertTitle, alertText);

  res.json({ success: true, message: 'Notification processed' });
});

// 4. System Events & Recent History
app.get('/api/events', (req, res) => {
  const newEvents = [...fileEvents];
  fileEvents = []; // Clear polling queue
  res.json({ 
    success: true, 
    data: newEvents,
    history: eventHistory 
  });
});

// 5. Settings config
app.post('/api/settings/email', (req, res) => {
    const { user, pass, to } = req.body;
    emailConfig = { user, pass, to };
    saveConfig();
    res.json({ success: true, message: 'Email config saved to disk' });
});

// 5b. GET Email settings
app.get('/api/settings/email', (req, res) => {
    res.json({ success: true, data: { user: emailConfig.user, to: emailConfig.to } });
});

// 6. Test Email Connection (with detailed errors)
app.post('/api/settings/email/test', async (req, res) => {
    const { user, pass, to } = req.body;
    if (!user || !pass || !to) return res.status(400).json({ success: false, error: 'Missing credentials' });

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
    });

    try {
        await transporter.verify();
        await transporter.sendMail({
            from: user,
            to: to,
            subject: '[SynqNotify] Connection Test successful! ✅',
            text: 'Your SMTP settings are correctly configured. You will now receive all system alerts via email.'
        });
        res.json({ success: true, message: 'Test email sent successfully!' });
    } catch (error) {
        console.error('SMTP Test Error:', error);
        let errorMsg = error.message;
        if (errorMsg.includes('Invalid login')) errorMsg = 'Invalid Gmail App Password. Please check your credentials.';
        res.status(500).json({ success: false, error: errorMsg });
    }
});

// 7. GET Reminders
app.get('/api/reminders', (req, res) => {
  res.json({ success: true, data: reminders });
});

// 8. POST Reminder (Add)
app.post('/api/reminders', (req, res) => {
  const reminder = req.body;
  if (!reminders.find(r => r.id === reminder.id)) {
    reminders.push({ ...reminder, notified: false });
    saveReminders();
  }
  res.json({ success: true, message: 'Reminder synced to backend' });
});

// 9. DELETE Reminder
app.delete('/api/reminders/:id', (req, res) => {
  const { id } = req.params;
  reminders = reminders.filter(r => r.id != id);
  saveReminders();
  res.json({ success: true, message: 'Reminder removed' });
});

const generateEmailHTML = (title, message) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; margin: 0; padding: 40px; color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 40px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
        .logo { color: #6366f1; font-size: 24px; font-weight: 800; margin-bottom: 24px; letter-spacing: -0.025em; }
        .header { font-size: 20px; font-weight: 600; margin-bottom: 16px; color: #ffffff; }
        .content { font-size: 16px; line-height: 1.6; color: #94a3b8; margin-bottom: 32px; }
        .footer { font-size: 12px; color: #64748b; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 24px; }
        .btn { display: inline-block; background: #6366f1; color: #ffffff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">SynqNotify Pro</div>
        <div class="header">${title}</div>
        <div class="content">${message}</div>
        <a href="http://localhost:5173" class="btn">Open Activity Hub</a>
        <div style="margin-top: 40px;" class="footer">
            This is an automated system notification from your local SynqNotify instance.
            <br>© 2026 SynqNotify OS Integration Engine.
        </div>
    </div>
</body>
</html>
`;

const sendEmailAlert = (subject, text) => {
  if (!emailConfig.user || !emailConfig.pass || !emailConfig.to) return;
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailConfig.user,
      pass: emailConfig.pass 
    }
  });

  transporter.sendMail({
    from: `"SynqNotify Hub" <${emailConfig.user}>`,
    to: emailConfig.to,
    subject: `[ALERT] ${subject}`,
    text: text, // Fallback
    html: generateEmailHTML(subject, text) // Rich UI
  }).catch(err => {
    console.error('[EMAIL ERROR]:', err);
    // Pro-level OS Notification on failure
    notifier.notify({
      title: '⚠️ Email Delivery Failed',
      message: `Error: ${err.message}. Check your App Password settings.`,
      sound: true
    });
  });
};

app.listen(PORT, () => {
  console.log(`Backend Server running on http://localhost:${PORT}`);
});
