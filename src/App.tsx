import React, { useEffect, useState } from 'react';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import TestInputPage from './components/TestInputPage';
import TestPage from './components/TestPage';
import ResultPage from './components/ResultPage';
import { useLocalStorage } from './hooks/useLocalStorage';
import { PageType, QuestionSet, TestResults } from './types';


const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [currentTest, setCurrentTest] = useState<QuestionSet | null>(null);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [savedQuestions, setSavedQuestions] = useLocalStorage<QuestionSet | null>('savedQuestions', null);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleStartTest = (questions: QuestionSet) => {
    setCurrentTest(questions);
    setCurrentPage('test');
  };

  const handleTestComplete = (results: TestResults) => {
    setTestResults(results);
    setCurrentPage('results');
  };

  const handleTestExit = () => {
    setCurrentTest(null);
    setCurrentPage('create');
  };

  const handleRestart = () => {
    setTestResults(null);
    setCurrentPage('test');
  };

  const handleBackToHome = () => {
    setCurrentTest(null);
    setTestResults(null);
    setCurrentPage('home');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <Navigation 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      
      {currentPage === 'home' && (
        <HomePage setCurrentPage={setCurrentPage} />
      )}
      
      {currentPage === 'create' && (
        <TestInputPage 
          onStartTest={handleStartTest}
          savedQuestions={savedQuestions}
          setSavedQuestions={setSavedQuestions}
        />
      )}
      
      {currentPage === 'test' && currentTest && (
        <TestPage 
          questions={currentTest}
          onComplete={handleTestComplete}
          onExit={handleTestExit}
        />
      )}
      
      {currentPage === 'results' && testResults && (
        <ResultPage 
          results={testResults}
          onRestart={handleRestart}
          onBackToHome={handleBackToHome}
        />
      )}
    </div>
  );
};

export default App;
