import React, { useState, useEffect } from 'react';
import { Shield, Zap, Globe, Bell, CheckCircle, AlertTriangle } from 'lucide-react';
import { apiUrl } from '../config/api';

const SystemHealth = () => {
    const [stats, setStats] = useState({
        notifications: 'Unknown',
        backend: 'Checking...',
        localTime: new Date().toLocaleTimeString(),
        lastSync: 'None'
    });

    useEffect(() => {
        const checkStatus = async () => {
            // Check Notification Permission
            const perm = 'Notification' in window ? Notification.permission : 'Not Supported';
            
            // Check Backend
            let backendStatus = 'Offline';
            try {
                const res = await fetch(apiUrl('/api/system/disk'));
                if (res.ok) backendStatus = 'Online';
            } catch (e) {
                backendStatus = 'Offline';
            }

            setStats({
                notifications: perm.charAt(0).toUpperCase() + perm.slice(1),
                backend: backendStatus,
                localTime: new Date().toLocaleTimeString(),
                lastSync: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
        };

        checkStatus();
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const sendTestNotification = () => {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('🚀 SynqNotify Live!', {
                        body: 'This is a test notification. If you see this, browser alerts are working!',
                        icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827370.png'
                    });
                } else {
                    alert("Notification permission is " + permission + ". Please enable it in browser settings.");
                }
            });
        }
    };

    const getStatusColor = (status, type) => {
        if (type === 'notifications' && status !== 'Granted') return 'var(--danger)';
        if (type === 'backend' && status !== 'Online') return 'var(--danger)';
        return 'var(--success)';
    };

    return (
        <div className="glass-panel" style={{ 
            padding: '12px 24px', 
            marginBottom: '32px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderLeft: `4px solid ${stats.backend === 'Online' ? 'var(--success)' : 'var(--danger)'}`
        }}>
            <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bell size={16} color={getStatusColor(stats.notifications, 'notifications')} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        Alerts: <span style={{ color: getStatusColor(stats.notifications, 'notifications') }}>{stats.notifications}</span>
                    </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={16} color={getStatusColor(stats.backend, 'backend')} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        Backend: <span style={{ color: getStatusColor(stats.backend, 'backend') }}>{stats.backend}</span>
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={16} color="var(--accent-primary)" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                        Last Sync: {stats.lastSync}
                    </span>
                </div>
            </div>

            <button 
                onClick={sendTestNotification}
                className="btn-primary" 
                style={{ 
                    padding: '6px 12px', 
                    fontSize: '0.75rem', 
                    background: stats.notifications !== 'Granted' ? 'var(--danger)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-color)',
                    color: stats.notifications !== 'Granted' ? 'white' : 'var(--text-primary)'
                }}
            >
                {stats.notifications !== 'Granted' ? "⚠️ Fix Permissions" : "Test Notification"}
            </button>
        </div>
    );
};

export default SystemHealth;
