import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  RotateCcw, 
  Download, 
  Home,
  Trophy,
  Target,
  TrendingUp
} from 'lucide-react';
import { TestResults, ScoreData } from '../types';

interface ResultPageProps {
  results: TestResults;
  onRestart: () => void;
  onBackToHome: () => void;
}

const ResultPage: React.FC<ResultPageProps> = ({ 
  results, 
  onRestart, 
  onBackToHome 
}) => {
  const calculateScore = (): ScoreData => {
    let correct = 0;
    results.questions.forEach((question, index) => {
      if (results.answers[index] === question.correct) {
        correct++;
      }
    });
    return {
      correct,
      total: results.questions.length,
      percentage: Math.round((correct / results.questions.length) * 100)
    };
  };

  const score = calculateScore();

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 dark:text-green-400';
    if (percentage >= 80) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (percentage >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 dark:bg-green-900';
    if (percentage >= 80) return 'bg-blue-100 dark:bg-blue-900';
    if (percentage >= 70) return 'bg-yellow-100 dark:bg-yellow-900';
    if (percentage >= 60) return 'bg-orange-100 dark:bg-orange-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return { message: "Excellent work!", icon: Trophy };
    if (percentage >= 80) return { message: "Great job!", icon: TrendingUp };
    if (percentage >= 70) return { message: "Good effort!", icon: Target };
    if (percentage >= 60) return { message: "Keep practicing!", icon: Clock };
    return { message: "Review and try again!", icon: RotateCcw };
  };

  const downloadResults = () => {
    const resultData = {
      ...results,
      score,
      completedAt: results.completedAt,
      summary: {
        totalQuestions: score.total,
        correctAnswers: score.correct,
        incorrectAnswers: score.total - score.correct,
        percentage: score.percentage,
        timeSpent: formatTime(results.timeSpent)
      }
    };
    
    const dataStr = JSON.stringify(resultData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `quiz-results-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const performance = getPerformanceMessage(score.percentage);
  const PerformanceIcon = performance.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${getScoreBg(score.percentage)}`}>
            <PerformanceIcon className={`h-10 w-10 ${getScoreColor(score.percentage)}`} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Test Complete!
          </h1>
          <p className={`text-xl font-medium mb-2 ${getScoreColor(score.percentage)}`}>
            {performance.message}
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Here's your detailed performance breakdown
          </p>
        </div>

        {/* Score Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mb-8">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className={`text-4xl font-bold ${getScoreColor(score.percentage)}`}>
                {score.percentage}%
              </div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">Overall Score</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-gray-900 dark:text-white">
                {score.correct}
              </div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">Correct</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-gray-900 dark:text-white">
                {score.total - score.correct}
              </div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">Incorrect</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-gray-900 dark:text-white">
                {results.timeSpent ? formatTime(results.timeSpent) : 'N/A'}
              </div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">Time Spent</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
              <span>Progress</span>
              <span>{score.correct} of {score.total} questions correct</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                  score.percentage >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                  score.percentage >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                  'bg-gradient-to-r from-red-500 to-red-600'
                }`}
                style={{ width: `${score.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question Review */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Question Review
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {results.questions.length} questions total
            </div>
          </div>
          
          <div className="space-y-8">
            {results.questions.map((question, index) => {
              const userAnswer = results.answers[index];
              const isCorrect = userAnswer === question.correct;
              const wasAnswered = userAnswer !== undefined;
              
              return (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-8 last:border-b-0 last:pb-0">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${
                      isCorrect 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : wasAnswered
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : wasAnswered ? (
                        <XCircle className="h-5 w-5" />
                      ) : (
                        '?'
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        {index + 1}. {question.question}
                      </h3>
                      
                      <div className="space-y-2 mb-4">
                        {question.options.map((option, optionIndex) => {
                          const isCorrectOption = optionIndex === question.correct;
                          const isUserChoice = optionIndex === userAnswer;
                          
                          return (
                            <div
                              key={optionIndex}
                              className={`p-3 rounded-lg border transition-colors ${
                                isCorrectOption
                                  ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
                                  : isUserChoice && !isCorrect
                                  ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
                                  : 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <span className="font-medium text-sm">
                                    {String.fromCharCode(65 + optionIndex)}.
                                  </span>
                                  <span>{option}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {isCorrectOption && (
                                    <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                                      <CheckCircle className="h-4 w-4" />
                                      <span className="text-xs font-medium">Correct</span>
                                    </div>
                                  )}
                                  {isUserChoice && !isCorrect && (
                                    <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                                      <XCircle className="h-4 w-4" />
                                      <span className="text-xs font-medium">Your choice</span>
                                    </div>
                                  )}
                                  {!wasAnswered && isCorrectOption && (
                                    <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                                      <span className="text-xs font-medium">Not answered</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {question.explanation && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <div className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Explanation:</strong> {question.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRestart}
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
          >
            <RotateCcw className="h-5 w-5" />
            <span>Take Again</span>
          </button>
          <button
            onClick={downloadResults}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
          >
            <Download className="h-5 w-5" />
            <span>Download Results</span>
          </button>
          <button
            onClick={onBackToHome}
            className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-8 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
          >
            <Home className="h-5 w-5" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Performance Insights */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Insights
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {((score.correct / score.total) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Accuracy Rate</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {results.timeSpent ? Math.round(results.timeSpent / score.total) : 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Avg. Time/Question</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {score.total - Object.keys(results.answers).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Questions Skipped</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
