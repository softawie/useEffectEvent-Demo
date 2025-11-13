import React, { useEffect, useRef } from 'react';

interface PerformanceMonitorProps {
  logs: string[];
  withoutRecreations: number;
  withRecreations: number;
  onForceRerender?: () => void;
}

export const PerformanceMonitor = React.memo(function PerformanceMonitor({ logs, withoutRecreations, withRecreations, onForceRerender }: PerformanceMonitorProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logsEndRef.current && logsContainerRef.current) {
      const container = logsContainerRef.current;
      const isScrolledToBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
      
      // Only auto-scroll if user was already at the bottom
      if (isScrolledToBottom) {
        logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [logs]);
  
  const uniqueLogs = logs.filter((log, index, arr) => 
    arr.findIndex(l => l === log) === index
  ).slice(-15); // Show more logs

  return (
    <div className="performance-monitor">
      <h3 className="monitor-title">📊 Performance Monitor</h3>
      
      {/* Key Metrics */}
      <div className="metrics-container">
        <div className="metric-card without-metric">
          <div className="metric-icon">❌</div>
          <div className="metric-content">
            <div className="metric-label">WITHOUT useEffectEvent</div>
            <div className="metric-value">{withoutRecreations}</div>
            <div className="metric-description">Timer Recreations</div>
          </div>
        </div>
        
        <div className="metric-card with-metric">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <div className="metric-label">WITH useEffectEvent</div>
            <div className="metric-value">{withRecreations}</div>
            <div className="metric-description">Timer Recreations</div>
          </div>
        </div>
        
        <div className="metric-card improvement-metric">
          <div className="metric-icon">🚀</div>
          <div className="metric-content">
            <div className="metric-label">Performance Improvement</div>
            <div className="metric-value">
              {withoutRecreations > 0 
                ? Math.max(0, Math.round(((withoutRecreations - withRecreations) / withoutRecreations) * 100))
                : withoutRecreations === 0 && withRecreations === 0 
                  ? '—' 
                  : '0'
              }%
            </div>
            <div className="metric-description">
              {withoutRecreations > withRecreations 
                ? 'Fewer Recreations' 
                : withoutRecreations === withRecreations && withoutRecreations > 0
                  ? 'Same (Both Optimized)'
                  : 'No Data Yet'
              }
            </div>
          </div>
        </div>
      </div>
      
      {/* Activity Logs */}
      <div className="logs-section">
        <h4 className="logs-title">Recent Activity</h4>
        <div className="logs-container" ref={logsContainerRef} style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {uniqueLogs.length === 0 ? (
            <p className="no-logs">No activity yet. Click "Force Parent Rerender" or interact with components to see the difference!</p>
          ) : (
            <div className="logs">
              {uniqueLogs.map((log, index) => {
                // Extract timestamp from log if present, otherwise use current time
                const logMatch = log.match(/\[([^\]]+)\]/);
                const logTime = logMatch ? logMatch[1] : new Date().toLocaleTimeString();
                const logMessage = log.replace(/\[[^\]]+\]\s*/, ''); // Remove timestamp from message
                
                const isWithout = logMessage.includes('🔴 WITHOUT') || log.includes('🔴 WITHOUT');
                const isWith = logMessage.includes('🟢 WITH') || log.includes('🟢 WITH');
                const isCreation = logMessage.includes('created') || log.includes('created');
                const isDestruction = logMessage.includes('destroyed') || log.includes('destroyed');
                
                return (
                  <div key={`${log}-${index}`} className={`log-entry ${
                    isWithout ? 'log-without' : isWith ? 'log-with' : ''
                  } ${
                    isCreation ? 'log-creation' : isDestruction ? 'log-destruction' : 'log-tick'
                  }`}>
                    <span className="log-time">[{logTime}]</span>
                    <span className="log-message">{logMessage || log}</span>
                    {isCreation && <span className="log-badge creation-badge">NEW TIMER</span>}
                    {isDestruction && <span className="log-badge destruction-badge">CLEANUP</span>}
                  </div>
                );
              })}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      </div>
      
      {/* Force Parent Rerender Button */}
      {onForceRerender && (
        <div style={{ 
          marginTop: '20px', 
          paddingTop: '20px', 
          borderTop: '2px solid #e0e0e0',
          textAlign: 'center'
        }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button 
              className="control-button primary" 
              onClick={onForceRerender} 
              title="Simulates parent component re-rendering (common in real apps)"
              style={{
                padding: '12px 24px',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              Force Parent Rerender
            </button>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#666', 
              marginTop: '8px',
              maxWidth: '250px',
              textAlign: 'center',
              lineHeight: '1.4'
            }}>
              💡 Simulates parent re-render
              <br />
              <strong>Watch:</strong> WITHOUT recreates timer, WITH doesn't!
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
