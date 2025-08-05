import React, { useState } from 'react';
import { Upload, FileText, Sparkles, Download } from 'lucide-react';
import { QuestionSet } from '../types';
import { generateQuestions } from '../utils/openai';
import { validateQuestionSet } from '../utils/validation';

interface TestInputPageProps {
  onStartTest: (questions: QuestionSet) => void;
  savedQuestions: QuestionSet | null;
  setSavedQuestions: (questions: QuestionSet | null) => void;
}

const TestInputPage: React.FC<TestInputPageProps> = ({
  onStartTest,
  savedQuestions,
  setSavedQuestions
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'ai'>('upload');
  const [jsonInput, setJsonInput] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const sampleQuestions: QuestionSet = {
    title: "Sample Math Quiz",
    timeLimit: 600,
    questions: [
      {
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correct: 1,
        explanation: "2 + 2 equals 4."
      },
      {
        question: "What is the square root of 16?",
        options: ["2", "4", "6", "8"],
        correct: 1,
        explanation: "The square root of 16 is 4."
      },
      {
        question: "What is 5 × 6?",
        options: ["25", "30", "35", "40"],
        correct: 1,
        explanation: "5 multiplied by 6 equals 30."
      }
    ]
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/json" || file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const parsed = JSON.parse(content);
            setJsonInput(JSON.stringify(parsed, null, 2));
            setActiveTab('paste');
          } catch (error) {
            alert('Invalid JSON file');
          }
        };
        reader.readAsText(file);
      } else {
        alert('Please upload a JSON file');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "application/json" || file.name.endsWith('.json'))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          setJsonInput(JSON.stringify(parsed, null, 2));
          setActiveTab('paste');
        } catch (error) {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please select a JSON file');
    }
  };

  const validateAndStartTest = () => {
    try {
      const parsedQuestions = JSON.parse(jsonInput);
      const validatedQuestions = validateQuestionSet(parsedQuestions);
      setSavedQuestions(validatedQuestions);
      onStartTest(validatedQuestions);
    } catch (error) {
      alert(`Invalid JSON format: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const generated = await generateQuestions(aiPrompt);
      setJsonInput(JSON.stringify(generated, null, 2));
      setActiveTab('paste');
    } catch (error) {
      console.error('AI Generation Error:', error);
      alert(`Failed to generate questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadSample = () => {
    const dataStr = JSON.stringify(sampleQuestions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'sample-quiz.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const loadSampleQuestions = () => {
    setJsonInput(JSON.stringify(sampleQuestions, null, 2));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Create Your Test
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Choose how you'd like to create your MCQ test
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'upload' as const, label: 'Upload File', icon: Upload },
                { id: 'paste' as const, label: 'Paste JSON', icon: FileText },
                { id: 'ai' as const, label: 'AI Generate', icon: Sparkles }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === id
                      ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className="space-y-6">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                        Drop JSON file here, or click to browse
                      </span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept=".json,application/json"
                        className="sr-only"
                        onChange={handleFileSelect}
                      />
                    </label>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      JSON files only, up to 10MB
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <button
                    onClick={downloadSample}
                    className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 text-sm font-medium inline-flex items-center space-x-1 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Sample Format</span>
                  </button>
                </div>
              </div>
            )}

            {/* Paste Tab */}
            {activeTab === 'paste' && (
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder={JSON.stringify(sampleQuestions, null, 2)}
                    className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  {jsonInput && (
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {jsonInput.split('\n').length} lines
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <button
                    onClick={loadSampleQuestions}
                    className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 text-sm font-medium transition-colors"
                  >
                    Load Sample
                  </button>
                  <button
                    onClick={validateAndStartTest}
                    disabled={!jsonInput.trim()}
                    className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Start Test
                  </button>
                </div>
              </div>
            )}

            {/* AI Tab */}
            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    What topic would you like questions about?
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., World War 2, JavaScript fundamentals, Biology cells, Advanced calculus, etc."
                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 resize-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows={3}
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Be specific for better questions. Include difficulty level, focus areas, or learning objectives.
                  </p>
                </div>
                
                <button
                  onClick={handleGenerateWithAI}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generating Questions...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Generate Questions with AI</span>
                    </>
                  )}
                </button>

                <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-200 mb-1">AI Question Generation</p>
                      <p>
                        {import.meta.env.VITE_OPENAI_API_KEY 
                          ? "Connected to OpenAI. Your questions will be generated using GPT-3.5."
                          : "Demo mode: Add your OpenAI API key to environment variables for real AI generation."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent/Saved Questions */}
        {savedQuestions && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recently Created
            </h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {savedQuestions.title}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {savedQuestions.questions.length} questions
                  {savedQuestions.timeLimit && ` • ${Math.floor(savedQuestions.timeLimit / 60)} minutes`}
                </p>
              </div>
              <button
                onClick={() => onStartTest(savedQuestions)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Start Test
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestInputPage;
