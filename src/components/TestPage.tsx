import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  Eye, 
  EyeOff,
  Flag,
  RotateCcw
} from 'lucide-react';
import { QuestionSet, TestResults, Question } from '../types';
import { useTimer } from '../hooks/useTimer';

interface TestPageProps {
  questions: QuestionSet;
  onComplete: (results: TestResults) => void;
  onExit: () => void;
}

const TestPage: React.FC<TestPageProps> = ({ questions, onComplete, onExit }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showReview, setShowReview] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [shuffledQuestions] = useState<Question[]>(() => 
    questions.shuffle ? [...questions.questions].sort(() => Math.random() - 0.5) : questions.questions
  );
  const [startTime] = useState(Date.now());

  const { timeLeft, isRunning, start } = useTimer(
    questions.timeLimit || 0,
    () => handleComplete()
  );

  useEffect(() => {
    if (questions.timeLimit) {
      start();
    }
  }, [questions.timeLimit, start]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent shortcuts if user is typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      if (e.key >= '1' && e.key <= '4') {
        const optionIndex = parseInt(e.key) - 1;
        if (optionIndex < shuffledQuestions[currentQuestion].options.length) {
          handleAnswerSelect(optionIndex);
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFlag();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestion, shuffledQuestions]);

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < shuffledQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    const timeSpent = questions.timeLimit 
      ? questions.timeLimit - timeLeft 
      : Math.floor((Date.now() - startTime) / 1000);
    
    const results: TestResults = {
      questions: shuffledQuestions,
      answers,
      timeSpent,
      completedAt: new Date().toISOString()
    };
    onComplete(results);
  };

  const toggleFlag = () => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion)) {
        newSet.delete(currentQuestion);
      } else {
        newSet.add(currentQuestion);
      }
      return newSet;
    });
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestion(index);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentQuestion + 1) / shuffledQuestions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = shuffledQuestions.length - answeredCount;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onExit}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                title="Exit test"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {questions.title || 'Quiz'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {questions.timeLimit && (
                <div className={`flex items-center space-x-2 ${
                  timeLeft < 60 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'
                }`}>
                  <Clock className="h-4 w-4" />
                  <span className="font-mono">{formatTime(timeLeft)}</span>
                </div>
              )}
              <button
                onClick={() => setShowReview(!showReview)}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                {showReview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{showReview ? 'Hide' : 'Review'}</span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
              <span>Question {currentQuestion + 1} of {shuffledQuestions.length}</span>
              <span>{answeredCount} answered • {unansweredCount} remaining</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-teal-600 to-teal-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Main Question Area */}
          <div className={`${showReview ? 'lg:w-2/3' : 'w-full'} transition-all duration-300`}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
              <div className="mb-8">
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-2xl font-medium text-gray-900 dark:text-white pr-4">
                    {shuffledQuestions[currentQuestion].question}
                  </h2>
                  <button
                    onClick={toggleFlag}
                    className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                      flaggedQuestions.has(currentQuestion)
                        ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                    }`}
                    title={flaggedQuestions.has(currentQuestion) ? 'Remove flag' : 'Flag for review'}
                  >
                    <Flag className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {shuffledQuestions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                        answers[currentQuestion] === index
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 shadow-md'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                          answers[currentQuestion] === index
                            ? 'border-teal-500 bg-teal-500 text-white'
                            : 'border-current'
                        }`}>
                          {answers[currentQuestion] === index ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            index + 1
                          )}
                        </span>
                        <span className="text-gray-900 dark:text-white">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                <div className="flex space-x-4">
                  {currentQuestion === shuffledQuestions.length - 1 ? (
                    <button
                      onClick={handleComplete}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Complete Test</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                    >
                      <span>Next</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Review Panel */}
          {showReview && (
            <div className="lg:w-1/3">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Question Overview
                </h3>
                
                <div className="grid grid-cols-5 gap-2 mb-6">
                  {shuffledQuestions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToQuestion(index)}
                      className={`relative w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        index === currentQuestion
                          ? 'bg-teal-600 text-white shadow-lg transform scale-105'
                          : answers[index] !== undefined
                          ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {index + 1}
                      {flaggedQuestions.has(index) && (
                        <Flag className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Legend */}
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-teal-600 rounded"></div>
                    <span>Current Question</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-100 dark:bg-green-900 rounded"></div>
                    <span>Answered ({answeredCount})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-100 dark:bg-gray-700 rounded"></div>
                    <span>Unanswered ({unansweredCount})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Flag className="w-3 h-3 text-yellow-500" />
                    <span>Flagged ({flaggedQuestions.size})</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        const unanswered = shuffledQuestions.findIndex((_, idx) => answers[idx] === undefined);
                        if (unanswered !== -1) goToQuestion(unanswered);
                      }}
                      disabled={unansweredCount === 0}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Go to next unanswered
                    </button>
                    <button
                      onClick={() => {
                        const flagged = Array.from(flaggedQuestions)[0];
                        if (flagged !== undefined) goToQuestion(flagged);
                      }}
                      disabled={flaggedQuestions.size === 0}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Go to flagged question
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

  
    </div>
  );
};

export default TestPage;
