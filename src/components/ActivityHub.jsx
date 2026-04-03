import React from 'react';
import { Activity, Download, Send, Clock, FileText, Globe } from 'lucide-react';

const ActivityHub = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Activity size={32} opacity={0.2} style={{ marginBottom: '16px' }} />
        <p>No recent system activity detected.</p>
      </div>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'FILE_READY': return <Download size={18} color="var(--accent-secondary)" />;
      case 'WEBHOOK': return <Globe size={18} color="var(--accent-primary)" />;
      case 'REMINDER': return <Clock size={18} color="var(--success)" />;
      default: return <FileText size={18} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
        <Activity size={16} /> Recent Activity Hub
      </h3>
      
      {history.map((event) => (
        <div key={event.id} className="glass-panel animate-slide-in" style={{ 
            padding: '12px 16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.01)',
            border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px' }}>
              {getIcon(event.type)}
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{event.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{event.message}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityHub;
