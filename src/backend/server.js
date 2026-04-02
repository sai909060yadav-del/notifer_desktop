import express from 'express';
import cors from 'cors';
import nodeDiskInfo from 'node-disk-info';
import nodemailer from 'nodemailer';
import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// Email config
let emailConfig = {
  user: '',
  pass: '',
  to: ''
};

// --- ROUTES ---

// 1. Disk Space check
app.get('/api/system/disk', async (req, res) => {
  try {
    const disks = await nodeDiskInfo.getDiskInfo();
    const mainDisk = disks.find(d => d.mounted === 'C:' || d.mounted === '/') || disks[0];
    res.json({
      success: true,
      data: {
        total: mainDisk.blocks,
        used: mainDisk.used,
        free: mainDisk.available,
        capacity: mainDisk.capacity,
        mounted: mainDisk.mounted
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. File Download / Creation Watcher
const watchers = new Map();
app.post('/api/system/watch-file', (req, res) => {
  const { filePath } = req.body;
  if (!filePath) return res.status(400).json({ success: false, error: 'Path required' });

  const normalizedPath = path.resolve(filePath);

  if (watchers.has(normalizedPath)) {
    return res.json({ success: true, message: 'Already watching' });
  }

  const parentDir = path.dirname(normalizedPath);
  const fileName = path.basename(normalizedPath);

  if (!fs.existsSync(parentDir)) {
      return res.status(400).json({ success: false, error: 'Directory does not exist' });
  }

  const watcher = chokidar.watch(parentDir, { depth: 0, ignoreInitial: true });
  
  const trigger = () => {
    fileEvents.push({
      id: Date.now(),
      type: 'FILE_READY',
      title: 'Download Complete 📁',
      message: `File ${fileName} is ready at ${normalizedPath}.`,
      timestamp: Date.now()
    });
    sendEmailAlert(`File Download Complete!`, `File ${fileName} is ready at ${normalizedPath}.`);
    
    watcher.close();
    watchers.delete(normalizedPath);
  };

  watcher.on('add', (newPath) => {
    if (path.basename(newPath) === fileName) trigger();
  });
  watcher.on('change', (newPath) => {
    if (path.basename(newPath) === fileName) trigger();
  });

  watchers.set(normalizedPath, watcher);
  res.json({ success: true, message: `Watching ${normalizedPath} for changes...` });
});

// 3. Python script completion Webhook
app.post('/api/notify', (req, res) => {
  const { message } = req.body;
  const alertText = message || 'Python script execution completed ✅';
  fileEvents.push({
    id: Date.now(),
    type: 'WEBHOOK',
    title: 'Development Hook',
    message: alertText,
    timestamp: Date.now()
  });

  sendEmailAlert(`Task Finished!`, alertText);

  res.json({ success: true, message: 'Notification received' });
});

// Event Polling queue
let fileEvents = [];
app.get('/api/events', (req, res) => {
  const eventsToSend = [...fileEvents];
  fileEvents = []; // clear after sending
  res.json({ success: true, data: eventsToSend });
});

// Settings config
app.post('/api/settings/email', (req, res) => {
    const { user, pass, to } = req.body;
    emailConfig = { user, pass, to };
    res.json({ success: true, message: 'Email config updated' });
});

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
    from: emailConfig.user,
    to: emailConfig.to,
    subject: `[SynqNotify] ${subject}`,
    text: text
  }).catch(err => console.error('Email error:', err));
};

app.listen(PORT, () => {
  console.log(`Backend Server running on http://localhost:${PORT}`);
});
