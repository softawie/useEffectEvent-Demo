import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { TeamMember } from '../../types';
import { TEAM_MEMBERS } from '../../data/teamMembers';
import { quizQuestions } from '../../data/quizQuestions';

export function ThinkTank() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [awardMember, setAwardMember] = useState<string>('');
  const [awardedForQuestion, setAwardedForQuestion] = useState<Record<number, string>>({});
  const [teamData, setTeamData] = useState<Record<string, TeamMember>>(() => {
    // Load from localStorage or initialize
    const saved = localStorage.getItem('thinkTankTeamData');
    if (saved) {
      return JSON.parse(saved);
    }
    // Initialize team data
    const initial: Record<string, TeamMember> = {};
    TEAM_MEMBERS.forEach(name => {
      initial[name] = {
        name,
        totalBonus: 0,
        questionsAnswered: 0,
        correctAnswers: 0,
        lastActivity: 'Never'
      };
    });
    return initial;
  });

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleAwardPoint = () => {
    const questionIndex = currentQuestion;
    if (awardedForQuestion[questionIndex]) return; // already awarded
    if (!awardMember) {
      window.alert('Please choose who gave the correct answer.');
      return;
    }

    const newTeamData = { ...teamData };
    const member = newTeamData[awardMember];
    if (!member) return;

    member.questionsAnswered += 1;
    member.correctAnswers += 1;
    member.totalBonus += 1; // 1 bonus point for correct answer
    member.lastActivity = new Date().toLocaleString();

    const newAwarded = { ...awardedForQuestion, [questionIndex]: awardMember };
    setTeamData(newTeamData);
    setAwardedForQuestion(newAwarded);
    localStorage.setItem('thinkTankTeamData', JSON.stringify(newTeamData));
  };

  const nextQuestion = () => {
    setShowExplanation(false);
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setShowExplanation(false);
    setAwardMember('');
    setAwardedForQuestion({});
  };
  
  const resetAllTeamData = () => {
    if (window.confirm('Are you sure you want to reset all team data? This cannot be undone.')) {
      const resetData: Record<string, TeamMember> = {};
      TEAM_MEMBERS.forEach(name => {
        resetData[name] = {
          name,
          totalBonus: 0,
          questionsAnswered: 0,
          correctAnswers: 0,
          lastActivity: 'Never'
        };
      });
      setTeamData(resetData);
      localStorage.setItem('thinkTankTeamData', JSON.stringify(resetData));
    }
  };

  const calculateScore = () => {
    return selectedAnswers.reduce((score, answer, index) => {
      return score + (answer === quizQuestions[index].correctAnswer ? 1 : 0);
    }, 0);
  };

  const getScoreMessage = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return { message: 'Excellent! 🏆 You\'re a useEffectEvent expert!', color: '#00d2d3' };
    if (percentage >= 70) return { message: 'Great job! 🎉 You have a solid understanding.', color: '#ffa726' };
    if (percentage >= 50) return { message: 'Good start! 📚 Review the concepts and try again.', color: '#ff9800' };
    return { message: 'Keep learning! 💪 Practice with the demo and retake the quiz.', color: '#ff6b6b' };
  };

  if (showLeaderboard) {
    const sortedTeam = Object.values(teamData).sort((a, b) => b.totalBonus - a.totalBonus);
    
    return (
      <div className="think-tank">
        <div className="quiz-header">
          <button onClick={() => setShowLeaderboard(false)} className="back-link">← Back to Quiz</button>
          <h1 className="quiz-title">🏆 Team Leaderboard</h1>
          <div className="quiz-subtitle">Team performance and bonus tracking</div>
        </div>

        <div className="leaderboard-container">
          <div className="leaderboard-actions">
            <button className="quiz-button secondary" onClick={resetAllTeamData}>
              🔄 Reset All Data
            </button>
          </div>
          
          <div className="leaderboard-grid">
            {sortedTeam.map((member, index) => {
              const accuracy = member.questionsAnswered > 0 
                ? Math.round((member.correctAnswers / member.questionsAnswered) * 100) 
                : 0;
              
              return (
                <div key={member.name} className={`leaderboard-card rank-${index + 1}`}>
                  <div className="rank-badge">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  <div className="member-info">
                    <h3 className="member-name">{member.name}</h3>
                    <div className="member-stats">
                      <div className="stat-item">
                        <span className="stat-label">Bonus Points</span>
                        <span className="stat-value bonus-points">{member.totalBonus}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Questions Answered</span>
                        <span className="stat-value">{member.questionsAnswered}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Correct Answers</span>
                        <span className="stat-value">{member.correctAnswers}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Accuracy</span>
                        <span className="stat-value accuracy">{accuracy}%</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Last Activity</span>
                        <span className="stat-value last-activity">{member.lastActivity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const { message, color } = getScoreMessage(score, quizQuestions.length);

    return (
      <div className="think-tank">
        <div className="quiz-header">
          <button onClick={() => navigate('/')} className="back-link">← Back to Demo</button>
          <h1 className="quiz-title">🧠 Think Tank Results</h1>
          <div className="quiz-subtitle">Quiz summary</div>
        </div>

        <div className="results-container">
          <div className="score-card" style={{ borderColor: color }}>
            <div className="score-display">
              <span className="score-number">{score}</span>
              <span className="score-total">/ {quizQuestions.length}</span>
            </div>
            <div className="score-percentage">{Math.round((score / quizQuestions.length) * 100)}%</div>
            <div className="score-message" style={{ color }}>{message}</div>
          </div>

          <div className="results-breakdown">
            <h3>Question Breakdown:</h3>
            {quizQuestions.map((question, index) => {
              const isCorrect = selectedAnswers[index] === question.correctAnswer;
              const awardedTo = awardedForQuestion[index];
              return (
                <div key={question.id} className={`result-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="result-header">
                    <span className="result-icon">{isCorrect ? '✅' : '❌'}</span>
                    <span className="result-difficulty">{question.difficulty}</span>
                    <span className="result-type">{question.type}</span>
                    {isCorrect && awardedTo && <span className="bonus-indicator">+1 awarded to {awardedTo}</span>}
                    {isCorrect && !awardedTo && <span className="bonus-indicator">No award assigned</span>}
                  </div>
                  <div className="result-question">{question.question}</div>
                  {!isCorrect && (
                    <div className="result-explanation">
                      <strong>Correct answer:</strong> {question.options[question.correctAnswer]}<br/>
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="results-actions">
            <button className="quiz-button primary" onClick={resetQuiz}>
              🔄 Retake Quiz
            </button>
            <button className="quiz-button secondary" onClick={() => setShowLeaderboard(true)}>
              🏆 View Team Leaderboard
            </button>
            <button className="quiz-button secondary" onClick={() => navigate('/')}>
              🎮 Practice with Demo
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = quizQuestions[currentQuestion];

  return (
    <div className="think-tank">
      <div className="quiz-header">
        <button onClick={() => navigate('/')} className="back-link">← Back to Demo</button>
        <h1 className="quiz-title">🧠 Think Tank</h1>
        <div className="quiz-subtitle">Test your useEffectEvent understanding</div>
      </div>
      
      <div className="member-selection">
        <div className="member-dropdown-container">
          <button 
            className="leaderboard-btn" 
            onClick={() => setShowLeaderboard(true)}
            title="View Team Leaderboard"
          >
            🏆 Leaderboard
          </button>
        </div>
      </div>

      <div className="quiz-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
          />
        </div>
        <div className="progress-text">
          Question {currentQuestion + 1} of {quizQuestions.length}
        </div>
      </div>

      <div className="question-container">
        <div className="question-header">
          <span className={`difficulty-badge ${question.difficulty}`}>
            {question.difficulty}
          </span>
          <span className={`type-badge ${question.type}`}>
            {question.type.replace('-', ' ')}
          </span>
        </div>

        <h2 className="question-text">{question.question}</h2>

        {question.code && (
          <div className="code-example">
            <SyntaxHighlighter
              language="typescript"
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                borderRadius: '12px',
                fontSize: '14px',
                lineHeight: '1.5'
              }}
              showLineNumbers={true}
              wrapLines={true}
            >
              {question.code}
            </SyntaxHighlighter>
          </div>
        )}

        <div className="options-container">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestion] === index;
            const isCorrect = index === question.correctAnswer;
            const showCorrectness = showExplanation;
            
            return (
              <button
                key={index}
                className={`option-button ${
                  isSelected ? 'selected' : ''
                } ${
                  showCorrectness && isCorrect ? 'correct' : ''
                } ${
                  showCorrectness && isSelected && !isCorrect ? 'incorrect' : ''
                }`}
                onClick={() => !showExplanation && handleAnswer(index)}
                disabled={showExplanation}
              >
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                <span className="option-text">{option}</span>
                {showCorrectness && isCorrect && <span className="option-icon">✅</span>}
                {showCorrectness && isSelected && !isCorrect && <span className="option-icon">❌</span>}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="explanation-container">
            <h3>💡 Explanation:</h3>
            <p>{question.explanation}</p>
            {selectedAnswers[currentQuestion] === question.correctAnswer && (
              <div className="bonus-notification">
                🎉 Correct!
              </div>
            )}

            {selectedAnswers[currentQuestion] === question.correctAnswer && (
              <div className="award-container">
                <h4>Assign the point to the team member who answered correctly:</h4>
                <div className="member-dropdown-container">
                  <select 
                    value={awardMember}
                    onChange={(e) => setAwardMember(e.target.value)}
                    className="member-dropdown"
                  >
                    <option value="">Choose team member...</option>
                    {TEAM_MEMBERS.map(member => (
                      <option key={member} value={member}>{member}</option>
                    ))}
                  </select>
                  <button 
                    className="quiz-button secondary"
                    onClick={handleAwardPoint}
                    disabled={!!awardedForQuestion[currentQuestion]}
                  >
                    {awardedForQuestion[currentQuestion] ? `Awarded to ${awardedForQuestion[currentQuestion]}` : 'Give +1 Point'}
                  </button>
                </div>
              </div>
            )}

            <button className="quiz-button primary" onClick={nextQuestion}>
              {currentQuestion < quizQuestions.length - 1 ? 'Next Question →' : 'View Results 🎯'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
