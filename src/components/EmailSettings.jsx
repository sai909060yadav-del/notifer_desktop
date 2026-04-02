import React, { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';

const EmailSettings = () => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [saved, setSaved] = useState(false);

  const saveSettings = (e) => {
    e.preventDefault();
    fetch('http://localhost:3000/api/settings/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: email, pass: pass, to: email })
    }).then(r => r.json()).then(data => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h3 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Mail size={20} color="var(--accent-primary)" />
        Email Notification Sync
      </h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.875rem' }}>
        Configure your email to receive native mobile notifications anytime your PC handles a webhook, file event, or reminder. Use a Gmail App Password for security.
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
        <button type="submit" className="btn-primary" style={{ width: 'fit-content' }}>
          {saved ? <><CheckCircle size={16}/> Saved!</> : "Save Settings"}
        </button>
      </form>
    </div>
  );
};

export default EmailSettings;
