import { QuestionSet } from '../types';

export const generateQuestions = async (topic: string): Promise<QuestionSet> => {
  const hfToken = import.meta.env.VITE_HUGGINGFACE_TOKEN;
  
  // For testing - always return demo first
  if (!hfToken) {
    console.log('No HF token, using demo mode');
    return getSmartDemoQuestions(topic);
  }

  try {
    // Try HuggingFace with timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 15000)
    );

    const apiPromise = fetch(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: `Create quiz questions about ${topic}:`,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.8
          }
        })
      }
    );

    const response = await Promise.race([apiPromise, timeoutPromise]) as Response;

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    // If model is loading, return demo immediately
    if (data.error && data.error.includes('loading')) {
      console.log('Model loading, using enhanced demo');
      return getSmartDemoQuestions(topic);
    }

    // If we get any response, try to use it or fallback
    if (data[0]?.generated_text) {
      console.log('Got HF response:', data[0].generated_text);
      // For now, return demo but with HF data logged
      return getSmartDemoQuestions(topic);
    }

    throw new Error('No valid response');

  } catch (error) {
    console.error('HF failed:', error);
    return getSmartDemoQuestions(topic);
  }
};

function getSmartDemoQuestions(topic: string): QuestionSet {
  // Smart demo questions based on topic
  const topicLower = topic.toLowerCase();
  
  let questions;
  
  if (topicLower.includes('javascript') || topicLower.includes('js')) {
    questions = [
      {
        question: "What is the correct way to declare a variable in JavaScript?",
        options: ["var x = 5", "variable x = 5", "v x = 5", "declare x = 5"],
        correct: 0,
        explanation: "var, let, or const are used to declare variables in JavaScript."
      },
      {
        question: "Which method is used to add an element to the end of an array?",
        options: ["append()", "push()", "add()", "insert()"],
        correct: 1,
        explanation: "push() method adds one or more elements to the end of an array."
      },
      {
        question: "What does '===' operator check in JavaScript?",
        options: ["Only value", "Only type", "Both value and type", "Neither"],
        correct: 2,
        explanation: "=== checks both value and type, providing strict equality comparison."
      }
    ];
  } else if (topicLower.includes('react')) {
    questions = [
      {
        question: "What is JSX in React?",
        options: ["JavaScript XML", "Java Syntax Extension", "JSON XML", "JavaScript Extension"],
        correct: 0,
        explanation: "JSX stands for JavaScript XML, allowing HTML-like syntax in JavaScript."
      },
      {
        question: "Which hook is used to manage state in functional components?",
        options: ["useEffect", "useState", "useContext", "useReducer"],
        correct: 1,
        explanation: "useState is the primary hook for managing state in functional components."
      }
    ];
  } else {
    questions = [
      {
        question: `What is a fundamental concept in ${topic}?`,
        options: ["Basic Foundation", "Advanced Theory", "Core Principle", "Simple Rule"],
        correct: 2,
        explanation: "Core principles form the foundation of understanding any subject."
      },
      {
        question: `Which approach works best when learning ${topic}?`,
        options: ["Theory Only", "Practice Only", "Theory + Practice", "Random Learning"],
        correct: 2,
        explanation: "Combining theoretical knowledge with practical application gives the best results."
      },
      {
        question: `What skill is most important for mastering ${topic}?`,
        options: ["Memory", "Critical Thinking", "Speed", "Note-taking"],
        correct: 1,
        explanation: "Critical thinking helps you understand and apply concepts effectively."
      }
    ];
  }

  return {
    title: `${topic} Quiz`,
    timeLimit: 600,
    shuffle: false,
    questions: questions
  };
}
