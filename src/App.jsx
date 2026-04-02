import React, { useState, useEffect } from 'react';
import { Bell, Plus, LayoutDashboard, Settings, Activity } from 'lucide-react';
import ReminderList from './components/ReminderList';
import ReminderForm from './components/ReminderForm';
import SystemMonitor from './components/SystemMonitor';
import EmailSettings from './components/EmailSettings';
import './App.css';

function App() {
  const [reminders, setReminders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('reminders');
    if (saved) {
      setReminders(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
  }, [reminders]);

  // Request Notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Check backend for File / Webhook events every 5 seconds
  useEffect(() => {
    const backendPoll = setInterval(() => {
      fetch('http://localhost:3000/api/events')
        .then(r => r.json())
        .then(data => {
          if (data && data.success && data.data.length > 0) {
            data.data.forEach(event => {
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(event.title || 'SynqNotify Alert', {
                  body: event.message,
                  icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827370.png'
                });
              }
            });
          }
        })
        .catch(e => { /* Ignore fetch errors if backend is offline */ });
    }, 5000);
    return () => clearInterval(backendPoll);
  }, []);

  // Check reminders every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      setReminders(prevReminders => {
        let triggerIds = [];
        prevReminders.forEach(reminder => {
          if (reminder.timestamp <= now && !reminder.notified) {
            triggerIds.push(reminder.id);
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('SynqNotify Alert', {
                body: reminder.title,
                icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827370.png'
              });
            }
          }
        });

        if (triggerIds.length > 0) {
          return prevReminders.map(r => triggerIds.includes(r.id) ? { ...r, notified: true } : r);
        }
        return prevReminders;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const addReminder = (reminder) => {
    setReminders([...reminders, { ...reminder, id: Date.now(), notified: false }]);
    setShowForm(false);
  };

  const deleteReminder = (id) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', borderRight: 'var(--glass-border)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px', background: 'var(--bg-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--accent-primary)', padding: '8px', borderRadius: '12px' }}>
            <Bell size={24} color="white" />
          </div>
          <h2 className="gradient-text" style={{ fontSize: '1.25rem' }}>SynqNotify</h2>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            onClick={() => setActiveTab('dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', background: activeTab === 'dashboard' ? 'rgba(255,255,255,0.05)' : 'transparent', color: activeTab === 'dashboard' ? 'var(--text-primary)' : 'var(--text-secondary)', width: '100%', textAlign: 'left' }}>
            <LayoutDashboard size={20} />
            <span style={{ fontWeight: 500 }}>Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('monitor')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', background: activeTab === 'monitor' ? 'rgba(255,255,255,0.05)' : 'transparent', color: activeTab === 'monitor' ? 'var(--text-primary)' : 'var(--text-secondary)', width: '100%', textAlign: 'left' }}>
            <Activity size={20} />
            <span style={{ fontWeight: 500 }}>System Monitor</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', background: activeTab === 'settings' ? 'rgba(255,255,255,0.05)' : 'transparent', color: activeTab === 'settings' ? 'var(--text-primary)' : 'var(--text-secondary)', width: '100%', textAlign: 'left' }}>
            <Settings size={20} />
            <span style={{ fontWeight: 500 }}>Settings</span>
          </button>
        </nav>

        <div style={{ marginTop: 'auto', background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '16px', border: 'var(--glass-border)' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Enable Cloud Sync to get alerts on your phone</p>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.875rem' }} onClick={() => setActiveTab('settings')}>
            Sync Devices
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
              {activeTab === 'dashboard' ? 'Your Reminders' : activeTab === 'monitor' ? 'System Overview' : 'Application Settings'}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {activeTab === 'dashboard' ? 'Manage and sync your notifications across desktop and mobile.' : activeTab === 'monitor' ? 'Deep OS integration and developer webhooks.' : 'Configure cloud sync and email protocols.'}
            </p>
          </div>
          {activeTab === 'dashboard' && (
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={20} />
              New Reminder
            </button>
          )}
        </header>

        {activeTab === 'dashboard' ? (
          <>
            {showForm && (
              <div className="animate-slide-in glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.25rem' }}>Create New Reminder</h3>
                  <button className="btn-icon" onClick={() => setShowForm(false)}>✕</button>
                </div>
                <ReminderForm onSubmit={addReminder} onCancel={() => setShowForm(false)} />
              </div>
            )}
            <ReminderList reminders={reminders} onDelete={deleteReminder} />
          </>
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
