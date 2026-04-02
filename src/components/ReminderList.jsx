import React from 'react';
import { Bell, Clock, Calendar, Trash2 } from 'lucide-react';

const ReminderList = ({ reminders, onDelete }) => {
  if (!reminders || reminders.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '50%' }}>
            <Bell size={32} opacity={0.5} />
          </div>
        </div>
        <h3>No active reminders</h3>
        <p style={{ marginTop: '8px' }}>Click "New Reminder" to create one.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {reminders.sort((a,b) => a.timestamp - b.timestamp).map((reminder) => (
        <div key={reminder.id} className="glass-panel animate-slide-in" id={`reminder-${reminder.id}`} style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--accent-primary)' }}>
              <Bell size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.125rem', marginBottom: '4px' }}>{reminder.title}</h4>
              <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} />
                  {reminder.date}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} />
                  {reminder.time}
                </span>
              </div>
            </div>
          </div>
          
          <button 
            className="btn-icon" 
            style={{ color: 'var(--danger)', background: 'transparent' }} 
            onClick={() => onDelete(reminder.id)}
            title="Delete Reminder"
          >
            <Trash2 size={20} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ReminderList;
