import { QuestionSet } from '../types';

export const generateQuestions = async (topic: string): Promise<QuestionSet> => {
  const hfToken = import.meta.env.VITE_HUGGINGFACE_TOKEN;
  
  console.log('🚀 Generating questions for:', topic);
  console.log('🔑 HF Token:', hfToken ? 'Available' : 'Missing');

  if (!hfToken) {
    console.log('⚠️ No HuggingFace token, using demo');
    return getTopicBasedQuestions(topic);
  }

  try {
    console.log('📡 Calling HuggingFace API...');
    
    // Use a better model that's more reliable
    const response = await fetch(
      'https://api-inference.huggingface.co/models/google/flan-t5-base',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: `Create 3 multiple choice questions about ${topic}. For each question provide: question text, 4 options, correct answer number (0-3), and explanation.`,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.7,
            do_sample: true
          }
        })
      }
    );

    console.log('📊 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      
      // If it's a rate limit or server error, return smart demo
      if (response.status === 429 || response.status >= 500) {
        console.log('🔄 Rate limited or server error, using smart demo');
        return getTopicBasedQuestions(topic);
      }
      
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 HF Response:', data);

    // Check if model is still loading
    if (data.error) {
      if (data.error.includes('loading') || data.error.includes('currently loading')) {
        console.log('⏳ Model loading, estimated time:', data.estimated_time || 'unknown');
        console.log('🔄 Using smart demo while model loads');
        return getTopicBasedQuestions(topic);
      }
      throw new Error(data.error);
    }

    // Try to process the response
    if (data && data[0] && data[0].generated_text) {
      const generatedText = data[0].generated_text;
      console.log('📝 Generated text:', generatedText);
      
      // For now, let's use this as inspiration but return structured demo
      // because parsing AI text to perfect JSON is unreliable
      console.log('✨ Using AI-inspired smart demo');
      return getAIInspiredQuestions(topic, generatedText);
    }

    throw new Error('No generated text received');

  } catch (error) {
    console.error('💥 HuggingFace failed:', error);
    console.log('🎯 Returning topic-based demo questions');
    return getTopicBasedQuestions(topic);
  }
};

// Smart demo questions based on topic
function getTopicBasedQuestions(topic: string): QuestionSet {
  const topicLower = topic.toLowerCase();
  let questions;

  // JavaScript/Programming Questions
  if (topicLower.includes('javascript') || topicLower.includes('js') || topicLower.includes('programming')) {
    questions = [
      {
        question: "What is the correct way to declare a variable in modern JavaScript?",
        options: ["var myVar = 5", "let myVar = 5", "variable myVar = 5", "declare myVar = 5"],
        correct: 1,
        explanation: "let and const are preferred in modern JavaScript over var for better scoping."
      },
      {
        question: "Which method adds an element to the end of an array?",
        options: ["append()", "push()", "add()", "insert()"],
        correct: 1,
        explanation: "push() method adds elements to the end of an array and returns the new length."
      },
      {
        question: "What does the '===' operator do in JavaScript?",
        options: ["Assigns value", "Compares value only", "Compares value and type", "Declares variable"],
        correct: 2,
        explanation: "=== performs strict equality comparison, checking both value and type."
      },
      {
        question: "Which keyword is used to create a function in JavaScript?",
        options: ["func", "function", "def", "create"],
        correct: 1,
        explanation: "The 'function' keyword is used to declare functions in JavaScript."
      },
      {
        question: "What will console.log(typeof null) output?",
        options: ["null", "undefined", "object", "number"],
        correct: 2,
        explanation: "This is a known JavaScript quirk - typeof null returns 'object'."
      }
    ];
  }
  
  // React Questions  
  else if (topicLower.includes('react')) {
    questions = [
      {
        question: "What does JSX stand for in React?",
        options: ["JavaScript XML", "Java Syntax Extension", "JSON XML", "JavaScript Extension"],
        correct: 0,
        explanation: "JSX stands for JavaScript XML, allowing HTML-like syntax in JavaScript."
      },
      {
        question: "Which hook is used to manage state in functional components?",
        options: ["useEffect", "useState", "useContext", "useReducer"],
        correct: 1,
        explanation: "useState is the primary hook for adding state to functional components."
      },
      {
        question: "What is the virtual DOM in React?",
        options: ["Real DOM copy", "JavaScript representation of DOM", "HTML template", "CSS framework"],
        correct: 1,
        explanation: "Virtual DOM is a JavaScript representation of the real DOM for efficient updates."
      },
      {
        question: "Which method is used to render a React component?",
        options: ["ReactDOM.render()", "React.render()", "render()", "display()"],
        correct: 0,
        explanation: "ReactDOM.render() is used to render React components to the DOM."
      }
    ];
  }
  
  // Python Questions
  else if (topicLower.includes('python')) {
    questions = [
      {
        question: "Which keyword is used to define a function in Python?",
        options: ["function", "def", "func", "define"],
        correct: 1,
        explanation: "The 'def' keyword is used to define functions in Python."
      },
      {
        question: "What is the correct way to create a list in Python?",
        options: ["list = (1,2,3)", "list = [1,2,3]", "list = {1,2,3}", "list = <1,2,3>"],
        correct: 1,
        explanation: "Square brackets [] are used to create lists in Python."
      },
      {
        question: "Which method adds an item to the end of a Python list?",
        options: ["add()", "append()", "push()", "insert()"],
        correct: 1,
        explanation: "append() method adds an item to the end of a list in Python."
      },
      {
        question: "What does 'len()' function do in Python?",
        options: ["Returns last element", "Returns length/size", "Returns first element", "Returns type"],
        correct: 1,
        explanation: "len() function returns the number of items in an object like list, string, etc."
      }
    ];
  }
  
  // World War 2 Questions
  else if (topicLower.includes('world war') || topicLower.includes('ww2') || topicLower.includes('wwii')) {
    questions = [
      {
        question: "In which year did World War 2 begin?",
        options: ["1938", "1939", "1940", "1941"],
        correct: 1,
        explanation: "World War 2 began on September 1, 1939, when Germany invaded Poland."
      },
      {
        question: "Which event brought the United States into World War 2?",
        options: ["Pearl Harbor attack", "Battle of Britain", "Fall of France", "Battle of Stalingrad"],
        correct: 0,
        explanation: "The attack on Pearl Harbor on December 7, 1941, led to US entry into the war."
      },
      {
        question: "Which battle is considered the turning point on the Eastern Front?",
        options: ["Battle of Berlin", "Battle of Stalingrad", "Battle of Moscow", "Battle of Kursk"],
        correct: 1,
        explanation: "The Battle of Stalingrad (1942-1943) marked the beginning of German retreat on the Eastern Front."
      },
      {
        question: "When did World War 2 end in Europe?",
        options: ["May 8, 1945", "September 2, 1945", "April 30, 1945", "June 6, 1944"],
        correct: 0,
        explanation: "VE Day (Victory in Europe) was May 8, 1945, when Germany officially surrendered."
      }
    ];
  }
  
  // Biology Questions
  else if (topicLower.includes('biology') || topicLower.includes('cell')) {
    questions = [
      {
        question: "What is the powerhouse of the cell?",
        options: ["Nucleus", "Mitochondria", "Ribosome", "Endoplasmic reticulum"],
        correct: 1,
        explanation: "Mitochondria produce ATP (energy) for the cell, earning the nickname 'powerhouse of the cell'."
      },
      {
        question: "Which organelle controls cell activities?",
        options: ["Mitochondria", "Nucleus", "Cytoplasm", "Cell membrane"],
        correct: 1,
        explanation: "The nucleus contains DNA and controls all cell activities and reproduction."
      },
      {
        question: "What process do plants use to make food?",
        options: ["Respiration", "Photosynthesis", "Digestion", "Fermentation"],
        correct: 1,
        explanation: "Photosynthesis converts sunlight, water, and carbon dioxide into glucose and oxygen."
      },
      {
        question: "What is the basic unit of heredity?",
        options: ["Cell", "Gene", "Chromosome", "DNA"],
        correct: 1,
        explanation: "Genes are segments of DNA that contain instructions for specific traits."
      }
    ];
  }
  
  // Generic Questions for any other topic
  else {
    questions = [
      {
        question: `What is a fundamental principle when studying ${topic}?`,
        options: ["Understanding basics first", "Memorizing everything", "Skipping difficult parts", "Random learning"],
        correct: 0,
        explanation: "Building a strong foundation with basic concepts is essential for understanding any subject."
      },
      {
        question: `Which method is most effective for learning ${topic}?`,
        options: ["Reading only", "Practice only", "Theory + Practice", "Watching videos only"],
        correct: 2,
        explanation: "Combining theoretical knowledge with practical application provides the best learning outcomes."
      },
      {
        question: `What skill is crucial when mastering ${topic}?`,
        options: ["Memorization", "Critical thinking", "Speed reading", "Note-taking only"],
        correct: 1,
        explanation: "Critical thinking helps you understand concepts deeply and apply them in different contexts."
      },
      {
        question: `How should you approach complex topics in ${topic}?`,
        options: ["Avoid them completely", "Break into smaller parts", "Study randomly", "Memorize without understanding"],
        correct: 1,
        explanation: "Breaking complex topics into smaller, manageable parts makes learning more effective and less overwhelming."
      },
      {
        question: `What's the best way to retain knowledge in ${topic}?`,
        options: ["Single study session", "Regular review and practice", "Cramming before tests", "Passive reading only"],
        correct: 1,
        explanation: "Regular review and active practice help transfer information from short-term to long-term memory."
      }
    ];
  }

  return {
    title: `${topic} Quiz`,
    timeLimit: 600,
    shuffle: false,
    questions: questions.slice(0, 5) // Return max 5 questions
  };
}

// Future: Use AI response to inspire better questions
function getAIInspiredQuestions(topic: string, aiText: string): QuestionSet {
  console.log('🤖 AI suggested:', aiText);
  // For now, return smart demo, but in future we can parse AI suggestions
  return getTopicBasedQuestions(topic);
}
