import React, { useState, useEffect, useRef } from 'react';

// Note: This component intentionally does NOT use useEffectEvent to demonstrate the problem

interface WithoutUseEffectEventProps {
  onLog: (message: string) => void;
  onShowCode: () => void;
  onRecreationChange?: (count: number) => void;
}

export const WithoutUseEffectEvent = React.memo(function WithoutUseEffectEvent({ onLog, onShowCode, onRecreationChange }: WithoutUseEffectEventProps) {
  const [name, setName] = useState('John');
  const renderCount = useRef(0);
  const effectRecreationCount = useRef(0);
  
  renderCount.current++;
  
  // Reset recreation count when component mounts
  useEffect(() => {
    effectRecreationCount.current = 0;
    onRecreationChange?.(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount - reset callback doesn't need to be in deps

  // ❌ BAD: Effect recreates on every render when onLog changes
  // Also, if we want fresh 'name' values, we must add it to deps, causing more recreations
  useEffect(() => {
    effectRecreationCount.current++;
    onRecreationChange?.(effectRecreationCount.current);
    const creationTime = new Date().toLocaleTimeString();
    
    onLog(`🔴 WITHOUT: Timer created #${effectRecreationCount.current} at ${creationTime}`);
    
    const timer = setInterval(() => {
      // ⚠️ PROBLEM: name is STALE here - captured in closure when timer was created
      // This will NOT update when you toggle name unless the timer recreates!
      // Notice: The name shown in logs will be the OLD name until timer recreates
      onLog(`🔴 WITHOUT: Timer tick #${effectRecreationCount.current} - Name: ${name} ⚠️ STALE (captured at timer creation #${effectRecreationCount.current})`);
    }, 1500); // Slightly faster to see difference sooner

    return () => {
      clearInterval(timer);
      onLog(`🔴 WITHOUT: Timer #${effectRecreationCount.current} destroyed at ${new Date().toLocaleTimeString()}`);
    };
  }, [onLog]); // ⚠️ onLog causes frequent recreations. Adding 'name' would cause even more!

  return (
    <div className="example-container without-container">
      <h2 className="example-title">❌ WITHOUT useEffectEvent</h2>
      <div className="stats">
        <span className="render-count">Renders: {renderCount.current} (normal - state changes cause re-renders)</span>
        <span className="effect-count highlight">🎯 Timer Recreations: {effectRecreationCount.current} (KEY METRIC - too many!)</span>
      </div>
      <div className="counters">
        <span className="counter">Name: {name}</span>
      </div>
      
      <div className="button-container">
        <button 
          className="action-button" 
          onClick={() => {
            const oldName = name; // Capture old name before state update
            const newName = name === 'John' ? 'Jane' : 'John';
            setName(newName);
            // Immediately log to show stale value issue
            onLog(`🔴 WITHOUT: Name changed from "${oldName}" to "${newName}"`);
            onLog(`🔴 WITHOUT: ⚠️ WAIT for next timer tick (1.5s) - it will show OLD name "${oldName}" (stale closure!)`);
            onLog(`🔴 WITHOUT: To fix stale value, timer must recreate (click "Force Parent Rerender")`);
          }}
        >
          Toggle Name (Shows STALE Value in Timer!)
        </button>
      </div>
      
      <div className="issue-box">
        <p className="issue-text">
          <strong>💡 Test Instructions:</strong>
          <br />
          1️⃣ Click "Toggle Name" → Wait 1.5 seconds → Check "Timer tick" logs → Shows OLD name (stale closure!) ⚠️
          <br />
          <em style={{ fontSize: '0.85em', color: '#666' }}>Note: Button click logs show correct values, but TIMER TICK logs show stale values!</em>
          <br />
          2️⃣ Click "Force Parent Rerender" → Timer recreates (unnecessary!) → See "Timer Recreations" increase
          <br />
          3️⃣ Compare "Timer Recreations" with WITH component - this shows the performance issue!
          <br />
          🚨 <strong>Problem:</strong> Timer recreates on every parent rerender AND name is stale in timer ticks!
        </p>
      </div>
      
      <button className="show-code-button" onClick={onShowCode}>
        📝 Show Code
      </button>
    </div>
  );
});
