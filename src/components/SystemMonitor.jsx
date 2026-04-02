import React, { useState, useEffect } from 'react';
import { HardDrive, Activity, Download, Send, Battery } from 'lucide-react';

const SystemMonitor = () => {
  const [disk, setDisk] = useState(null);
  const [battery, setBattery] = useState({ level: 100, charging: false });
  const [watchPath, setWatchPath] = useState('C:\\Downloads\\test.txt');

  useEffect(() => {
    fetch('http://localhost:3000/api/system/disk')
      .then(r => r.json())
      .then(d => { if (d.success) setDisk(d.data); })
      .catch(e => console.error("Disk API error. Is backend running?", e));

    if ('getBattery' in navigator) {
      navigator.getBattery().then(batt => {
        setBattery({ level: batt.level * 100, charging: batt.charging });
        batt.addEventListener('levelchange', () => {
          setBattery(prev => ({ ...prev, level: batt.level * 100 }));
        });
        batt.addEventListener('chargingchange', () => {
          setBattery(prev => ({ ...prev, charging: batt.charging }));
        });
      });
    }
  }, []);

  const handleWatchFile = (e) => {
    e.preventDefault();
    if (!watchPath) return;
    fetch('http://localhost:3000/api/system/watch-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath: watchPath })
    })
    .then(r => r.json())
    .then(d => alert(d.message))
    .catch(e => alert("Error starting file watcher. Is the local backend running?"));
  };

  const testPythonHook = () => {
    fetch('http://localhost:3000/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "Test: Script finished successfully!" })
    }).then(r => r.json()).then(d => alert("Mock Python webhook sent!"));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ display: 'flex', gap: '24px' }}>
        <div className="glass-panel" style={{ flex: 1, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--accent-secondary)' }}>
            <HardDrive size={24} />
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Storage</h3>
          </div>
          {disk ? (
            <div>
              <p style={{ margin: '0 0 8px', color: 'var(--text-secondary)' }}>
                {disk.mounted} - {Math.round(disk.free / 1024 / 1024 / 1024)} GB Free
              </p>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(disk.used / disk.capacity) * 100 || 50}%`, height: '100%', background: 'var(--danger)' }} />
              </div>
            </div>
          ) : <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading or backend offline...</p>}
        </div>

        <div className="glass-panel" style={{ flex: 1, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--success)' }}>
            <Battery size={24} />
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Battery</h3>
          </div>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
            {Math.round(battery.level)}% {battery.charging ? <span style={{fontSize: '0.875rem', color: 'var(--success)'}}>(Charging)</span> : ''}
          </p>
          {battery.level < 20 && !battery.charging && (
            <p style={{ margin: '8px 0 0', color: 'var(--danger)', fontSize: '0.875rem' }}>⚠️ Battery low!</p>
          )}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Download size={20} color="var(--accent-primary)" />
          File Download Monitor
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.875rem' }}>
          Enter a local file path to watch. When the system detects the file is completed/created, you'll get a notification!
        </p>
        <form onSubmit={handleWatchFile} style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            className="input-field" 
            style={{ flex: 1 }}
            value={watchPath}
            onChange={(e) => setWatchPath(e.target.value)}
            placeholder="C:\Users\Downloads\large_movie.zip"
          />
          <button type="submit" className="btn-primary">Watch File</button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Activity size={20} color="var(--accent-primary)" />
          Developer Webhook (Python/ML)
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.875rem' }}>
          Embed this instantly into your training scripts or data pipelines to trigger notifications.
        </p>
        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', color: '#10b981', fontFamily: 'monospace', fontSize: '0.875rem', marginBottom: '16px' }}>
          import requests<br />
          requests.post('http://localhost:3000/api/notify', json=&#123;'message':'Execution finished!'&#125;)
        </div>
        <button className="btn-primary" onClick={testPythonHook}>
          <Send size={16} /> Test Mock Trigger
        </button>
      </div>

    </div>
  );
}

export default SystemMonitor;
