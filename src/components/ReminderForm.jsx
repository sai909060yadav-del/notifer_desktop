import React, { useState } from 'react';
import { Calendar, Clock, Type } from 'lucide-react';

const ReminderForm = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !date || !time) return;
    
    onSubmit({
      title,
      timestamp: new Date(`${date}T${time}`).getTime(),
      date,
      time
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Reminder Title</label>
        <div style={{ position: 'relative' }}>
          <Type size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="input-field" 
            style={{ paddingLeft: '44px' }}
            placeholder="E.g., Team Meeting"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Date</label>
          <div style={{ position: 'relative' }}>
            <Calendar size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="date" 
              className="input-field" 
              style={{ paddingLeft: '44px' }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Time</label>
          <div style={{ position: 'relative' }}>
            <Clock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="time" 
              className="input-field" 
              style={{ paddingLeft: '44px' }}
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
        <button type="button" onClick={onCancel} style={{ padding: '10px 20px', color: 'var(--text-secondary)' }}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Save Reminder
        </button>
      </div>
    </form>
  );
};

export default ReminderForm;
