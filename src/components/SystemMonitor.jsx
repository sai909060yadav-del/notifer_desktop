import React, { useState, useEffect } from 'react';
import { HardDrive, Activity, Download, Send, Battery, Copy, CheckCircle } from 'lucide-react';

const SystemMonitor = () => {
  const [disk, setDisk] = useState(null);
  const [battery, setBattery] = useState({ level: 100, charging: false });
  const [watchPath, setWatchPath] = useState('C:\\Users\\saiya\\Downloads');

  const [watchStatus, setWatchStatus] = useState('');
  const [testStatus, setTestStatus] = useState('');
  const [copied, setCopied] = useState(false);

  const snippets = {
    python: `import requests\n\nrequests.post(\n  'http://localhost:3000/api/notify', \n  json={'message': 'Execution finished!'}\n)`,
    javascript: `fetch('http://localhost:3000/api/notify', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ message: 'Execution finished!' })\n});`,
    html: `<!-- Paste this inside your HTML <body> -->\n<script>\n  fetch('http://localhost:3000/api/notify', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ message: 'Execution finished!' })\n  });\n</script>`,
    'c#': `using System.Net.Http;\nusing System.Text;\n\nvar client = new HttpClient();\nvar content = new StringContent(\"{\\"message\\": \\"Execution finished!\\"}\", Encoding.UTF8, \"application/json\");\nawait client.PostAsync(\"http://localhost:3000/api/notify\", content);`,
    curl: `curl -X POST http://localhost:3000/api/notify \\\n  -H "Content-Type: application/json" \\\n  -d '{"message":"Execution finished!"}'`
  };

  const [langTab, setLangTab] = useState('python');
  const [customCode, setCustomCode] = useState(snippets.python);

  const handleTabChange = (lang) => {
    setLangTab(lang);
    setCustomCode(snippets[lang]);
  };

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
    setWatchStatus('Connecting...');
    fetch('http://localhost:3000/api/system/watch-dir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dirPath: watchPath })
    })
    .then(r => r.json())
    .then(d => {
      if (d.success) {
        setWatchStatus('👀 ' + d.message);
      } else {
        setWatchStatus(`❌ Backend Error: ${d.error}`);
        setTimeout(() => setWatchStatus(''), 7000);
      }
    })
    .catch(e => {
        setWatchStatus("❌ Error starting watcher. Is the backend running?");
        setTimeout(() => setWatchStatus(''), 7000);
    });
  };

  const testPythonHook = () => {
    setTestStatus('Sending...');
    fetch('http://localhost:3000/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "Test: Endpoint reached successfully!" })
    }).then(r => r.json()).then(d => {
        setTestStatus('✅ Ping sent successfully!');
        setTimeout(() => setTestStatus(''), 3000);
    }).catch(e => {
        setTestStatus('❌ Failed to connect to server');
        setTimeout(() => setTestStatus(''), 3000);
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className="metrics-row">
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
          Automatic Download Monitor
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.875rem' }}>
          Enter an <b>entire folder path</b> to watch natively. Whenever ANY new file finishes downloading into this folder, you will be notified instantly!
        </p>
        <form onSubmit={handleWatchFile} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              className="input-field" 
              style={{ flex: 1 }}
              value={watchPath}
              onChange={(e) => setWatchPath(e.target.value)}
              placeholder="C:\Users\saiya\Downloads"
            />
            <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>Watch Folder</button>
          </div>
          {watchStatus && (
            <div style={{ fontSize: '0.875rem', color: watchStatus.includes('❌') ? 'var(--danger)' : 'var(--success)' }}>
              {watchStatus}
            </div>
          )}
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Activity size={20} color="var(--accent-primary)" />
          Developer Webhook API
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.875rem' }}>
          Embed this instantly into your external scripts, frontend pipelines, or servers to trigger notifications natively.
        </p>
        
        <div style={{ position: 'relative', marginBottom: '16px' }}>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {Object.keys(snippets).map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => handleTabChange(lang)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: langTab === lang ? 'var(--accent-primary)' : 'var(--bg-primary)',
                  color: langTab === lang ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  transition: '0.2s ease',
                  border: langTab === lang ? 'none' : '1px solid var(--border-color)',
                  cursor: 'pointer'
                }}
              >
                {lang}
              </button>
            ))}
          </div>
          
          <textarea 
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            spellCheck="false"
            style={{ 
              width: '100%', 
              background: 'var(--bg-primary)', 
              padding: '16px', 
              paddingRight: '48px', 
              borderRadius: '8px', 
              color: '#10b981', 
              fontFamily: 'monospace', 
              fontSize: '0.875rem', 
              border: '1px solid var(--border-color)',
              minHeight: '140px',
              resize: 'vertical',
              outline: 'none'
            }}
          />

          <button 
            type="button"
            onClick={handleCopy}
            className="btn-icon" 
            style={{ position: 'absolute', right: '8px', bottom: '16px', background: 'rgba(255,255,255,0.1)' }}
            title="Copy to clipboard"
          >
            {copied ? <CheckCircle size={16} color="var(--success)" /> : <Copy size={16} />}
          </button>
        </div>

        <button 
          className="btn-primary" 
          onClick={testPythonHook}
          style={{ background: testStatus.includes('✅') ? 'var(--success)' : '' }}
        >
          <Send size={16} /> 
          {testStatus || "Ping Local Backend"}
        </button>
      </div>

    </div>
  );
}

export default SystemMonitor;
