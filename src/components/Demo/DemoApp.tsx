import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { WithoutUseEffectEvent } from './WithoutUseEffectEvent';
import { WithUseEffectEvent } from './WithUseEffectEvent';
import { PerformanceMonitor } from './PerformanceMonitor';
import { CodeModal } from '../Shared/CodeModal';
import { CodeModalType, ComponentView } from '../../types';

export function DemoApp() {
  const [logs, setLogs] = useState<string[]>([]);
  const [triggerRerender, setTriggerRerender] = useState(0);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: CodeModalType;
  }>({ isOpen: false, type: 'without' });
  const [activeComponent, setActiveComponent] = useState<ComponentView>('both');
  const [withoutRecreations, setWithoutRecreations] = useState(0);
  const [withRecreations, setWithRecreations] = useState(0);
  
  // This function changes on every render, causing issues in WithoutUseEffectEvent
  const handleLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logWithTime = `[${timestamp}] ${message}`;
    
    setLogs(prev => {
      // Avoid duplicate consecutive logs
      if (prev.length > 0 && prev[prev.length - 1] === logWithTime) {
        return prev;
      }
      return [...prev.slice(-20), logWithTime];
    });
    
    // Note: Recreation tracking is now done directly via onRecreationChange callback
    // This ensures accurate tracking without relying on log parsing
  }, [triggerRerender]); // Intentionally depends on triggerRerender

  const clearLogs = () => {
    setLogs([]);
    // Note: Recreation counts are reset by components when they remount
    // Or we can reset them here if needed
  };
  
  const forceRerender = () => setTriggerRerender(prev => prev + 1);
  
  const showCode = useCallback((type: CodeModalType) => {
    setModalState({ isOpen: true, type });
  }, []);
  
  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, type: 'without' });
  }, []);
  
  // Memoize callbacks to prevent unnecessary re-renders
  const handleWithoutRecreationChange = useCallback((count: number) => {
    setWithoutRecreations(count);
  }, []);
  
  const handleWithRecreationChange = useCallback((count: number) => {
    setWithRecreations(count);
  }, []);
  
  const showWithoutCode = useCallback(() => showCode('without'), [showCode]);
  const showWithCode = useCallback(() => showCode('with'), [showCode]);
  
  const toggleComponent = (component: ComponentView) => {
    setActiveComponent(component);
    setWithoutRecreations(0);
    setWithRecreations(0);
    clearLogs(); // Clear logs and metrics when switching
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="main-title">useEffectEvent Demo</h1>
        <p className="subtitle">
          Compare performance with and without useEffectEvent
        </p>
      </header>
      
      <div className="controls-container">
        <button className="control-button" onClick={clearLogs}>
          Clear Logs
        </button>
        
        <button className="control-button secondary" onClick={() => showCode('comparison')}>
          📋 View Code Comparison
        </button>
        
        <button className="control-button secondary" onClick={() => showCode('side-by-side')}>
          👥 Side-by-Side Comparison
        </button>
        
        <button className="control-button secondary" onClick={() => showCode('implementation')}>
          🔧 useEffectEvent Implementation
        </button>
        
        <Link to="/quiz" className="control-button quiz-nav">
          🧠 Take Think Tank Quiz
        </Link>
      </div>
      
      <div className="toggle-container">
        <h3 className="toggle-title">🎯 Demo Mode:</h3>
        <div className="toggle-buttons">
          <button 
            className={`toggle-button ${activeComponent === 'both' ? 'active' : ''}`}
            onClick={() => toggleComponent('both')}
          >
            Both Components
          </button>
          <button 
            className={`toggle-button ${activeComponent === 'without' ? 'active' : ''}`}
            onClick={() => toggleComponent('without')}
          >
            Without Only
          </button>
          <button 
            className={`toggle-button ${activeComponent === 'with' ? 'active' : ''}`}
            onClick={() => toggleComponent('with')}
          >
            With Only
          </button>
        </div>
      </div>
      
      <div className="instruction-container">
        <div style={{ 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffc107', 
          borderRadius: '8px', 
          padding: '12px', 
          marginBottom: '16px' 
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#856404' }}>
            🔍 What does "Force Parent Rerender" do?
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: '#856404' }}>
            It simulates the parent component (DemoApp) re-rendering. This happens frequently in real apps when:
            <br />• Parent state changes, props update, or context values change.
            <br />• When parent re-renders, it creates a new `onLog` function reference.
            <br />
            <strong>Result:</strong> 
            <br />❌ <strong>WITHOUT useEffectEvent:</strong> Timer recreates (because `onLog` is in dependency array)
            <br />✅ <strong>WITH useEffectEvent:</strong> Timer does NOT recreate (because `onLogEvent` is stable)
          </p>
        </div>
        <p className="instruction-text">
          💡 <strong>Important:</strong> Re-renders are normal when you click buttons (state changes cause re-renders in React).
          <br />
          🎯 <strong>Key Metric to Watch:</strong> "Timer Recreations" - this is where useEffectEvent makes a difference!
          <br />
          💡 <strong>Test it:</strong> Click "Force Parent Rerender" multiple times and watch "Timer Recreations" - WITHOUT increases, WITH stays the same!
          {activeComponent === 'both' && " Compare both components side by side."}
          {activeComponent === 'without' && " Watch how the timer recreates frequently."}
          {activeComponent === 'with' && " See how useEffectEvent prevents unnecessary recreations."}
        </p>
      </div>
      
      <PerformanceMonitor 
        logs={logs} 
        withoutRecreations={withoutRecreations}
        withRecreations={withRecreations}
        onForceRerender={forceRerender}
      />
      
      <div className="examples-container">
        {(activeComponent === 'both' || activeComponent === 'without') && (
          <WithoutUseEffectEvent 
            onLog={handleLog} 
            onShowCode={showWithoutCode}
            onRecreationChange={handleWithoutRecreationChange}
          />
        )}
        {(activeComponent === 'both' || activeComponent === 'with') && (
          <WithUseEffectEvent 
            onLog={handleLog} 
            onShowCode={showWithCode}
            onRecreationChange={handleWithRecreationChange}
          />
        )}
      </div>
      
      <div className="explanation-container">
        <h3 className="explanation-title">🎯 Key Benefits of useEffectEvent:</h3>
        <ul className="benefits-list">
          <li>Prevents unnecessary effect recreations</li>
          <li>Reduces cleanup/setup overhead</li>
          <li>Maintains stable effect dependencies</li>
          <li>Improves overall performance</li>
          <li>Reduces memory pressure from frequent timer recreations</li>
        </ul>
      </div>
      
      <CodeModal 
        isOpen={modalState.isOpen} 
        onClose={closeModal} 
        type={modalState.type} 
      />
    </div>
  );
}
