import React, { useState, useEffect } from 'react';
import { Bell, Plus, LayoutDashboard, Settings, Activity } from 'lucide-react';
import ReminderList from './components/ReminderList';
import ReminderForm from './components/ReminderForm';
import SystemMonitor from './components/SystemMonitor';
import EmailSettings from './components/EmailSettings';
import SystemHealth from './components/SystemHealth';
import ActivityHub from './components/ActivityHub';
import { apiUrl } from './config/api';
import './App.css';

function App() {
  const [reminders, setReminders] = useState([]);
  const [eventHistory, setEventHistory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Load from Backend (Cloud Sync)
  useEffect(() => {
    fetch(apiUrl('/api/reminders'))
      .then(r => r.json())
      .then(d => { if (d.success) setReminders(d.data); });
  }, []);

  // Request Notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Check backend for File / Webhook events every 5 seconds
  useEffect(() => {
    const backendPoll = setInterval(() => {
      fetch(apiUrl('/api/events'))
        .then(r => r.json())
        .then(data => {
          if (data && data.success) {
            if (data.history) setEventHistory(data.history);
            if (data.data.length > 0) {
              data.data.forEach(event => {
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification(event.title || 'SynqNotify Alert', {
                    body: event.message,
                    icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827370.png'
                  });
                }
              });
            }
          }
        })
        .catch(e => { /* Ignore fetch errors if backend is offline */ });
    }, 5000);
    return () => clearInterval(backendPoll);
  }, []);

  // Check reminders and detect Offline Misses
  useEffect(() => {
    const checkReminders = () => {
      const now = Date.now();
      
      setReminders(prevReminders => {
        let triggerIds = [];
        prevReminders.forEach(reminder => {
          if (reminder.timestamp <= now && !reminder.notified) {
            triggerIds.push(reminder.id);
            
            // Check if notification was missed (offline for > 2 minutes)
            const timeDriftMs = now - reminder.timestamp;
            const isMissedOffline = timeDriftMs > 120000;
            
            if ('Notification' in window && Notification.permission === 'granted') {
              if (isMissedOffline) {
                const timeStr = new Date(reminder.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                new Notification('⚠️ Missed System Reminder', {
                  body: `You missed a reminder at ${timeStr}: ${reminder.title}`,
                  icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827370.png'
                });
              } else {
                new Notification('SynqNotify Alert', {
                  body: reminder.title,
                  icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827370.png'
                });
              }

              // SYNC TO BACKEND FOR EMAIL ALERT
              fetch(apiUrl('/api/notify'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  title: 'Reminder Triggered ⏰',
                  message: `Your reminder "${reminder.title}" is due now!`,
                  isReminder: true 
                })
              }).catch(() => {});
            }
          }
        });

        if (triggerIds.length > 0) {
          return prevReminders.map(r => triggerIds.includes(r.id) ? { ...r, notified: true } : r);
        }
        return prevReminders;
      });
    };

    // Run heavily optimized check instantly on browser load, then every 10s
    checkReminders();
    const interval = setInterval(checkReminders, 10000);
    return () => clearInterval(interval);
  }, []);

  const addReminder = (reminder) => {
    const newReminder = { ...reminder, id: Date.now(), notified: false };
    setReminders([...reminders, newReminder]);
    setShowForm(false);

    // SYNC TO BACKEND
    fetch(apiUrl('/api/reminders'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReminder)
    });
  };

  const deleteReminder = (id) => {
    setReminders(reminders.filter(r => r.id !== id));
    
    // SYNC TO BACKEND (DELETE)
    fetch(apiUrl(`/api/reminders/${id}`), {
      method: 'DELETE'
    });
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">
            <Bell size={24} color="white" />
          </div>
          <h2 className="gradient-text" style={{ fontSize: '1.25rem' }}>SynqNotify</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'monitor' ? 'active' : ''}`}
            onClick={() => setActiveTab('monitor')}>
            <Activity size={20} />
            <span>System</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}>
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="sync-card">
          <p>Enable Cloud Sync to get alerts on your phone</p>
          <button className="btn-primary" onClick={() => setActiveTab('settings')}>
            Sync Devices
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <SystemHealth />
        <header className="main-header">
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
              {activeTab === 'dashboard' ? 'Your Reminders' : activeTab === 'monitor' ? 'System Overview' : 'Application Settings'}
            </h1>
            <p className="subtitle">
              {activeTab === 'dashboard' ? 'Manage and sync your notifications across desktop and mobile.' : activeTab === 'monitor' ? 'Deep OS integration and developer webhooks.' : 'Configure cloud sync and email protocols.'}
            </p>
          </div>
          {activeTab === 'dashboard' && (
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={20} />
              <span className="btn-text">New Reminder</span>
            </button>
          )}
        </header>

        {activeTab === 'dashboard' ? (
          <div className="dashboard-grid">
            <div className="dashboard-main">
              {showForm && (
                <div className="animate-slide-in glass-panel create-form">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>Create New Reminder</h3>
                    <button className="btn-icon" onClick={() => setShowForm(false)}>✕</button>
                  </div>
                  <ReminderForm onSubmit={addReminder} onCancel={() => setShowForm(false)} />
                </div>
              )}
              <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <Bell size={16}/> Upcoming Reminders
              </h3>
              <ReminderList reminders={reminders} onDelete={deleteReminder} />
            </div>
            <div className="dashboard-sidebar">
              <ActivityHub history={eventHistory} />
            </div>
          </div>
        ) : activeTab === 'monitor' ? (
          <SystemMonitor />
        ) : (
          <EmailSettings />
        )}

      </main>
    </div>
  );
}

export default App;
