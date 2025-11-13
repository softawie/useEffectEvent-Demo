import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CodeModalType } from '../../types';

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: CodeModalType;
}

export function CodeModal({ isOpen, onClose, type }: CodeModalProps) {
  if (!isOpen) return null;

  const getCodeContent = () => {
    switch (type) {
      case 'without':
        return `// ❌ WITHOUT useEffectEvent - PERFORMANCE ISSUES
function MyComponent({ onLog }) {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('John');
  const effectRecreationCount = useRef(0);
  
  // 🚨 PROBLEM 1: Effect depends on onLog function
  // This causes the timer to be recreated every time onLog changes!
  // 🚨 PROBLEM 2: name is captured in closure - will be stale
  // If we add name to deps, we get even MORE recreations!
  useEffect(() => {
    effectRecreationCount.current++;
    
    const timer = setInterval(() => {
      // ⚠️ name is stale unless timer recreates
      // ⚠️ onLog dependency causes unnecessary recreations
      onLog(\`🔴 WITHOUT: Timer - Count: \${count}, Name: \${name}\`);
    }, 2000);
    
    return () => clearInterval(timer);
  }, [count, onLog]); // ⚠️ onLog causes frequent recreations
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>Name: {name}</p>
      <p>Recreations: {effectRecreationCount.current}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment Count</button>
      <button onClick={() => setName(n => n === 'John' ? 'Jane' : 'John')}>
        Toggle Name
      </button>
    </div>
  );
}`;
      case 'with':
        return `// ✅ WITH useEffectEvent - OPTIMIZED PERFORMANCE
function MyComponent({ onLog }) {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('John');
  const effectRecreationCount = useRef(0);
  
  // 🎯 SOLUTION: useEffectEvent allows reading latest values
  // without making them reactive (adding to dependency array)
  const onLogEvent = useEffectEvent((message, currentCount) => {
    // ✅ name is read inside useEffectEvent - always gets latest value!
    onLog(\`🟢 WITH: \${message} - Count: \${currentCount}, Name: \${name}\`);
  });
  
  useEffect(() => {
    effectRecreationCount.current++;
    
    const timer = setInterval(() => {
      // ✅ Pass count as argument (reactive), name read inside (always fresh)
      onLogEvent('Timer tick', count);
    }, 2000);
    
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]); // ✅ Only depends on count! onLogEvent is stable and should NOT be in deps
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>Name: {name}</p>
      <p>Recreations: {effectRecreationCount.current}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment Count</button>
      <button onClick={() => setName(n => n === 'John' ? 'Jane' : 'John')}>
        Toggle Name
      </button>
    </div>
  );
}`;
      case 'implementation':
        return `// 🔧 useEffectEvent Polyfill Implementation
function useEffectEvent<T extends (...args: any[]) => any>(fn: T): T {
  const ref = useRef<T>(fn);
  
  // Always store the latest function
  ref.current = fn;
  
  // Return a stable callback that never changes identity
  return useCallback((...args: any[]) => {
    // Always call the most recent function version
    return ref.current(...args);
  }, []) as T; // Empty dependency array = stable reference
}

/* 🎯 How it works:

1. 📦 STORES: Latest function in a ref (ref.current = fn)
2. 🔒 STABLE: Returns memoized callback with empty deps []
3. 🔄 FRESH: Always calls the most recent function version
4. ✅ RESULT: Prevents effect dependency issues

💡 Key insight: The returned function never changes identity,
  but always calls the latest version of the original function.
  This breaks the dependency chain that causes effect recreations!
*/`;
      case 'comparison':
        return `// 📊 QUICK COMPARISON

// ❌ WITHOUT useEffectEvent (PROBLEMATIC)
useEffect(() => {
  const timer = setInterval(() => {
    // ⚠️ PROBLEM: onLog changes frequently, causing recreations
    // ⚠️ PROBLEM: name is stale if not in deps, but adding it causes more recreations
    onLog(\`Count: \${count}, Name: \${name}\`);
  }, 2000);
  return () => clearInterval(timer);
}, [count, onLog]); // 🚨 onLog causes frequent recreations

// ✅ WITH useEffectEvent (OPTIMIZED)
const onLogEvent = useEffectEvent((message: string, currentCount: number) => {
  // ✅ name is read inside useEffectEvent - always gets latest value!
  onLog(\`🟢 WITH: \${message} - Count: \${currentCount}, Name: \${name}\`);
});

useEffect(() => {
  const timer = setInterval(() => {
    // ✅ Pass count as argument (reactive), name read inside useEffectEvent (always fresh)
    onLogEvent('Timer tick', count);
  }, 2000);
  return () => clearInterval(timer);
}, [count]); // 🎯 Only count! onLogEvent is stable and should NOT be in deps

/* 📈 PERFORMANCE IMPACT:

   WITHOUT: Timer recreates on EVERY parent re-render (when onLog changes)
   WITH:    Timer recreates ONLY when count changes
   
   Result: Significant reduction in unnecessary recreations!
   BONUS: Always gets fresh name value without adding it to dependencies!
*/`;
      case 'side-by-side':
        return 'SIDE_BY_SIDE_VIEW'; // Special marker for side-by-side view
      default:
        return 'Code comparison content';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'without': return '❌ Without useEffectEvent - Performance Issues';
      case 'with': return '✅ With useEffectEvent - Optimized Performance';
      case 'implementation': return '🔧 useEffectEvent Implementation';
      case 'comparison': return '📊 Quick Comparison';
      case 'side-by-side': return '👥 Side-by-Side Code Comparison';
      default: return 'Code Example';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{getTitle()}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        {type === 'side-by-side' ? (
          <div className="side-by-side-container">
            <div className="code-panel without-panel">
              <h4 className="panel-title">❌ WITHOUT useEffectEvent</h4>
              <SyntaxHighlighter
                language="typescript"
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  fontSize: '13px',
                  lineHeight: '1.4'
                }}
                showLineNumbers={true}
                wrapLines={true}
              >
{`function WithoutUseEffectEvent({ onLog }) {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('John');
  const effectRecreationCount = useRef(0);
  
  // 🚨 PROBLEM: Effect depends on onLog (causes frequent recreations)
  useEffect(() => {
    effectRecreationCount.current++;
    
    const timer = setInterval(() => {
      // ⚠️ name is stale unless timer recreates
      // ⚠️ onLog dependency causes unnecessary recreations
      onLog(\`🔴 WITHOUT: Timer #\${effectRecreationCount.current} - Count: \${count}, Name: \${name}\`);
    }, 2000);

    return () => clearInterval(timer);
  }, [count, onLog]); // ⚠️ Recreates when onLog changes
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>Name: {name}</p>
      <p>Recreations: {effectRecreationCount.current}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment Count
      </button>
      <button onClick={() => setName(name === 'John' ? 'Jane' : 'John')}>
        Toggle Name
      </button>
    </div>
  );
}`}
              </SyntaxHighlighter>
            </div>
            
            <div className="code-panel with-panel">
              <h4 className="panel-title">✅ WITH useEffectEvent</h4>
              <SyntaxHighlighter
                language="typescript"
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  fontSize: '13px',
                  lineHeight: '1.4'
                }}
                showLineNumbers={true}
                wrapLines={true}
              >
{`function WithUseEffectEvent({ onLog }) {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('John');
  const effectRecreationCount = useRef(0);
  
  // ✅ SOLUTION: useEffectEvent allows reading latest values
  const onLogEvent = useEffectEvent((message, currentCount) => {
    // ✅ name is read inside useEffectEvent - always gets latest value!
    onLog(\`🟢 WITH: \${message} - Count: \${currentCount}, Name: \${name}\`);
  });
  
  useEffect(() => {
    effectRecreationCount.current++;
    
    const timer = setInterval(() => {
      // ✅ Pass count as argument, name read inside useEffectEvent
      onLogEvent('Timer tick', count);
    }, 2000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]); // 🎯 Only recreates when count changes. onLogEvent is stable!
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>Name: {name}</p>
      <p>Recreations: {effectRecreationCount.current}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment Count
      </button>
      <button onClick={() => setName(name === 'John' ? 'Jane' : 'John')}>
        Toggle Name
      </button>
    </div>
  );
}`}
              </SyntaxHighlighter>
            </div>
          </div>
        ) : (
          <div className="code-container">
            <SyntaxHighlighter
              language="typescript"
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                borderRadius: '0 0 12px 12px',
                fontSize: '14px',
                lineHeight: '1.5'
              }}
              showLineNumbers={true}
              wrapLines={true}
            >
              {getCodeContent()}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    </div>
  );
}
