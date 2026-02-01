import React, { useState, useEffect } from 'react';
import '../styles/DebugOverlay.css';

interface LogEntry {
    id: number;
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

let logId = 0;
const logs: LogEntry[] = [];
const listeners: Array<(logs: LogEntry[]) => void> = [];

// Global debug logger
export const debugLog = {
    info: (message: string) => addLog(message, 'info'),
    success: (message: string) => addLog(message, 'success'),
    warning: (message: string) => addLog(message, 'warning'),
    error: (message: string) => addLog(message, 'error'),
};

function addLog(message: string, type: LogEntry['type']) {
    const entry: LogEntry = {
        id: logId++,
        timestamp: new Date().toLocaleTimeString(),
        message,
        type
    };

    logs.push(entry);
    if (logs.length > 20) logs.shift(); // Keep only last 20 logs

    // Notify all listeners
    listeners.forEach(listener => listener([...logs]));

    // Also log to console
    console.log(`[${type.toUpperCase()}] ${message}`);
}

export const DebugOverlay: React.FC = () => {
    const [visible, setVisible] = useState(true);
    const [logEntries, setLogEntries] = useState<LogEntry[]>([]);

    useEffect(() => {
        const listener = (newLogs: LogEntry[]) => {
            setLogEntries(newLogs);
        };

        listeners.push(listener);
        setLogEntries([...logs]);

        return () => {
            const index = listeners.indexOf(listener);
            if (index > -1) listeners.splice(index, 1);
        };
    }, []);

    const downloadLogs = () => {
        const logText = logEntries.map(log =>
            `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}`
        ).join('\n');

        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ar-game-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        debugLog.success('Logs downloaded!');
    };

    if (!visible) {
        return (
            <button className="debug-toggle" onClick={() => setVisible(true)}>
                📊 Show Logs
            </button>
        );
    }

    return (
        <div className="debug-overlay">
            <div className="debug-header">
                <span className="debug-title">🔍 Debug Logs</span>
                <div className="debug-actions">
                    <button className="debug-download" onClick={downloadLogs} title="Download logs">
                        💾
                    </button>
                    <button className="debug-close" onClick={() => setVisible(false)}>✕</button>
                </div>
            </div>
            <div className="debug-logs">
                {logEntries.length === 0 ? (
                    <div className="debug-empty">No logs yet...</div>
                ) : (
                    logEntries.map(log => (
                        <div key={log.id} className={`debug-log debug-log-${log.type}`}>
                            <span className="debug-time">{log.timestamp}</span>
                            <span className="debug-message">{log.message}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
