import { QuizQuestion } from '../types';

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    type: 'multiple-choice',
    difficulty: 'beginner',
    question: 'What is the main purpose of useEffectEvent?',
    options: [
      'To create new effects',
      'To prevent unnecessary effect recreations while accessing fresh values',
      'To replace useEffect entirely',
      'To handle DOM events'
    ],
    correctAnswer: 1,
    explanation: 'useEffectEvent prevents unnecessary effect recreations by stabilizing function references while still allowing access to fresh values from the component scope.'
  },
  {
    id: 2,
    type: 'code-analysis',
    difficulty: 'intermediate',
    question: 'What will happen when the user clicks "Toggle Name" in this component?',
    code: `function MyComponent({ onLog }) {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('John');
  
  useEffect(() => {
    const timer = setInterval(() => {
      onLog(\`Count: \${count}, Name: \${name}\`);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [count, onLog]);
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <button onClick={() => setName(name === 'John' ? 'Jane' : 'John')}>Toggle Name</button>
    </div>
  );
}`,
    options: [
      'The timer will immediately show the new name in logs',
      'The timer will show the old name until count changes',
      'The timer will stop working',
      'The component will crash'
    ],
    correctAnswer: 1,
    explanation: 'The timer captures the name value when the effect runs. Since name is not in the dependency array, the timer will show stale name values until the effect recreates due to count or onLog changes.'
  },
  {
    id: 3,
    type: 'code-analysis',
    difficulty: 'advanced',
    question: 'How many times will the timer be recreated if we click "Force Rerender" 5 times?',
    code: `function MyComponent({ onLog }) {
  const [count, setCount] = useState(0);
  const onLogEvent = useEffectEvent(onLog);
  
  useEffect(() => {
    console.log('Timer created');
    const timer = setInterval(() => {
      onLogEvent(\`Count: \${count}\`);
    }, 1000);
    
    return () => {
      console.log('Timer destroyed');
      clearInterval(timer);
    };
  }, [count]);
  
  return <button onClick={() => setCount(c => c + 1)}>Increment</button>;
}`,
    options: [
      '5 times (every rerender)',
      '0 times (timer never recreates)',
      '1 time (only on mount)',
      'Depends on count value'
    ],
    correctAnswer: 1,
    explanation: 'With useEffectEvent, the timer only recreates when count changes, not when the parent rerenders. Since "Force Rerender" doesn\'t change count, the timer stays stable.'
  },
  {
    id: 4,
    type: 'multiple-choice',
    difficulty: 'intermediate',
    question: 'Which dependency array is correct when using useEffectEvent?',
    code: `const onLogEvent = useEffectEvent(onLog);

useEffect(() => {
  const timer = setInterval(() => {
    onLogEvent(\`Count: \${count}, User: \${user.name}\`);
  }, 1000);
  return () => clearInterval(timer);
}, /* What should go here? */);`,
    options: [
      '[count, user.name, onLog]',
      '[count, user.name, onLogEvent]',
      '[count, user.name]',
      '[count, user]'
    ],
    correctAnswer: 3,
    explanation: 'Include count and user (the object) in dependencies since they\'re used in the effect. Don\'t include onLogEvent (it\'s stable) or onLog (it\'s wrapped by useEffectEvent).'
  },
  {
    id: 5,
    type: 'true-false',
    difficulty: 'beginner',
    question: 'useEffectEvent is currently available in stable React releases.',
    options: ['True', 'False'],
    correctAnswer: 1,
    explanation: 'False. useEffectEvent is still experimental. We use a polyfill in this demo. Always check React\'s official documentation for the latest status.'
  },
  {
    id: 6,
    type: 'code-analysis',
    difficulty: 'advanced',
    question: 'What\'s the performance difference between these two approaches?',
    code: `// Approach A
useEffect(() => {
  const ws = new WebSocket(url);
  ws.onmessage = onMessage;
  return () => ws.close();
}, [url, onMessage]);

// Approach B
const handleMessage = useEffectEvent(onMessage);
useEffect(() => {
  const ws = new WebSocket(url);
  ws.onmessage = handleMessage;
  return () => ws.close();
}, [url]);`,
    options: [
      'No difference in performance',
      'Approach A is faster',
      'Approach B prevents unnecessary WebSocket reconnections',
      'Approach B is slower due to extra function calls'
    ],
    correctAnswer: 2,
    explanation: 'Approach B prevents unnecessary WebSocket reconnections when onMessage changes. This saves network overhead, connection time, and prevents data loss during reconnections.'
  },
  {
    id: 7,
    type: 'multiple-choice',
    difficulty: 'intermediate',
    question: 'When should you NOT use useEffectEvent?',
    options: [
      'When the function changes frequently',
      'When you need the function to be reactive (cause effect recreation)',
      'When working with timers',
      'When the function is passed as a prop'
    ],
    correctAnswer: 1,
    explanation: 'Don\'t use useEffectEvent when you actually WANT the function changes to trigger effect recreation. useEffectEvent is for when you want fresh values without recreation.'
  },
  {
    id: 8,
    type: 'code-analysis',
    difficulty: 'advanced',
    question: 'What will this component log after 3 seconds?',
    code: `function Timer({ onTick }) {
  const [count, setCount] = useState(0);
  const onTickEvent = useEffectEvent(onTick);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(c => c + 1);
      onTickEvent(count);
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  return <div>Count: {count}</div>;
}`,
    options: [
      'Logs: 0, 1, 2 (stale closure)',
      'Logs: 1, 2, 3 (fresh values)',
      'Logs: 0, 0, 0 (always stale)',
      'Component crashes'
    ],
    correctAnswer: 2,
    explanation: 'Even with useEffectEvent, count is captured when the effect runs. Since the effect has no dependencies, it never recreates, so count stays 0. Use setCount(c => c + 1) and pass the new value to onTickEvent.'
  }
];
