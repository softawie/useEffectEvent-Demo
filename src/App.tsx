/**
 * useEffectEvent Demo App - React Web Version
 * Refactored with modular components and custom hooks
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DemoApp } from './components/Demo/DemoApp';
import { ThinkTank } from './components/Quiz/ThinkTank';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DemoApp />} />
        <Route path="/quiz" element={<ThinkTank />} />
      </Routes>
    </Router>
  );
}

export default App;
