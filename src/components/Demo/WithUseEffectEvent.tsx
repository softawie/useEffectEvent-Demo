import React, { useState, useEffect, useRef, useEffectEvent } from 'react';

interface WithUseEffectEventProps {
  onLog: (message: string) => void;
  onShowCode: () => void;
  onRecreationChange?: (count: number) => void;
}

export const WithUseEffectEvent = React.memo(function WithUseEffectEvent({ onLog, onShowCode, onRecreationChange }: WithUseEffectEventProps) {
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

  // ✅ GOOD: useEffectEvent allows reading latest values without recreating effects
  // Wrap the logging logic to capture name from the latest render
  const onLogEvent = useEffectEvent((message: string) => {
    // Inside useEffectEvent, we can read the latest 'name' value
    // even though it's not in the dependency array!
    onLog(`🟢 WITH: ${message} - Name: ${name}`);
  });

  useEffect(() => {
    effectRecreationCount.current++;
    onRecreationChange?.(effectRecreationCount.current);
    const creationTime = new Date().toLocaleTimeString();
    
    onLogEvent(`Timer created #${effectRecreationCount.current} at ${creationTime}`);
    
    const timer = setInterval(() => {
      // ✅ name is read inside useEffectEvent - ALWAYS gets the LATEST value!
      // Notice: Even if you toggle name, the timer will show the NEW name immediately
      // Timer NEVER recreates (no dependencies), but always sees the latest name!
      onLogEvent(`Timer tick #${effectRecreationCount.current} - Always gets FRESH name!`);
    }, 1500); // Slightly faster to see difference sooner

    return () => {
      clearInterval(timer);
      onLogEvent(`Timer #${effectRecreationCount.current} destroyed at ${new Date().toLocaleTimeString()}`);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ No dependencies! Timer never recreates, but onLogEvent always reads latest name

  return (
    <div className="example-container with-container">
      <h2 className="example-title">✅ WITH useEffectEvent</h2>
      <div className="stats">
        <span className="render-count">Renders: {renderCount.current} (normal - state changes cause re-renders)</span>
        <span className="effect-count highlight">🎯 Timer Recreations: {effectRecreationCount.current} (KEY METRIC)</span>
      </div>
      <div className="counters">
        <span className="counter">Name: {name}</span>
      </div>
      
      <div className="button-container">
        <button 
          className="action-button" 
          onClick={() => {
            const newName = name === 'John' ? 'Jane' : 'John';
            setName(newName);
            // Immediately log to show fresh value
            onLog(`🟢 WITH: Name changed to ${newName} - Timer will show this NEW value in next tick!`);
          }}
        >
          Toggle Name (Shows FRESH Value in Timer!)
        </button>
      </div>
      
      <div className="benefit-box">
        <p className="benefit-text">
          <strong>💡 Test Instructions:</strong>
          <br />
          1️⃣ Click "Toggle Name" → Check logs immediately + wait for timer tick (1.5s) → See FRESH name!
          <br />
          2️⃣ Click "Force Parent Rerender" → Timer does NOT recreate (no dependencies!)
          <br />
          3️⃣ Compare "Timer Recreations" with WITHOUT component - this is the key metric!
          <br />
          ✅ <strong>Key Benefit:</strong> Timer NEVER recreates, but always sees latest name!
        </p>
      </div>
      
      <button className="show-code-button" onClick={onShowCode}>
        📝 Show Code
      </button>
    </div>
  );
});
