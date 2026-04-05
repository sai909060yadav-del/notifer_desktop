import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertTriangle } from 'lucide-react';
import { apiUrl } from '../config/api';

const EmailSettings = () => {
  const [email, setEmail] = useState('');
  const [savedEmail, setSavedEmail] = useState('');
  const [pass, setPass] = useState('');
  const [hasStoredPassword, setHasStoredPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch current settings on load
  useEffect(() => {
    fetch(apiUrl('/api/settings/email'))
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data.user) {
          setEmail(d.data.user);
          setSavedEmail(d.data.user);
          setHasStoredPassword(Boolean(d.data.hasPassword));
          setPass('');
        }
      });
  }, []);

  const saveSettings = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const payload = { user: email, to: email };
    if (pass.trim()) payload.pass = pass;
    fetch(apiUrl('/api/settings/email'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json()).then(data => {
      if (pass.trim()) {
        setHasStoredPassword(true);
        setSavedEmail(email);
      } else if (email !== savedEmail) {
        setHasStoredPassword(false);
        setSavedEmail(email);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  };

  const testConnection = () => {
    if (!email) {
      setError('Please enter your email first.');
      return;
    }

    if (!pass.trim() && !(hasStoredPassword && email === savedEmail)) {
      setError('Enter your Gmail App Password before testing, or save it first.');
        return;
    }
    setTesting(true);
    setError('');
    setSuccess('');
    const payload = { user: email, to: email };
    if (pass.trim()) payload.pass = pass;
    
    fetch(apiUrl('/api/settings/email/test'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(data => {
        setTesting(false);
        if (data.success) {
            setSuccess('Connection Successful! Check your inbox for a test mail. ✅');
        } else {
            setError(data.error || 'Connection Failed. Please check your App Password.');
        }
    })
    .catch(e => {
        setTesting(false);
        setError('Could not connect to backend server. Make sure it is running.');
    });
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h3 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Mail size={20} color="var(--accent-primary)" />
        Email Notification Sync
      </h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.875rem' }}>
        Configure your email to receive native mobile notifications. <b>Note:</b> You MUST use a <u>Gmail App Password</u>, not your regular password.
      </p>
      
      <form onSubmit={saveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
        <input 
          type="email" 
          className="input-field" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your Gmail Address"
        />
        <input 
          type="password" 
          className="input-field" 
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="Gmail App Password"
        />
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '-8px' }}>
          Leave blank to keep the currently saved app password.
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                {saved ? <><CheckCircle size={16}/> Saved!</> : "Save Settings"}
            </button>
            <button 
                type="button" 
                className="btn-secondary" 
                onClick={testConnection}
                disabled={testing}
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
            >
                {testing ? "Testing..." : "Test Connectivity"}
            </button>
        </div>

        {error && (
            <div className="animate-slide-in" style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: 'var(--danger)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} /> {error}
            </div>
        )}

        {success && (
            <div className="animate-slide-in" style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: 'var(--success)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} /> {success}
            </div>
        )}
      </form>
    </div>
  );
};

export default EmailSettings;
