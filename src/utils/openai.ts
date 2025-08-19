import { QuestionSet } from '../types';

export const generateQuestions = async (topic: string): Promise<QuestionSet> => {
  const hfToken = import.meta.env.VITE_HUGGINGFACE_TOKEN;
  
  if (!hfToken) {
    // Demo questions when no token
    return {
      title: `${topic} Quiz - Demo Mode`,
      timeLimit: 600,
      questions: [
        {
          question: `What is a key concept in ${topic}?`,
          options: ["Basic Foundation", "Advanced Theory", "Core Principle", "Simple Rule"],
          correct: 2,
          explanation: "Core principles form the foundation of understanding any subject."
        },
        {
          question: `Which method is most effective for learning ${topic}?`,
          options: ["Only Reading", "Practice + Theory", "Memorization", "Random Study"],
          correct: 1,
          explanation: "Combining practical application with theoretical knowledge gives the best results."
        },
        {
          question: `What skill helps most when studying ${topic}?`,
          options: ["Speed", "Critical Thinking", "Memory", "Note-taking"],
          correct: 1,
          explanation: "Critical thinking helps you understand concepts deeply rather than just memorizing."
        },
        {
          question: `How should you approach complex topics in ${topic}?`,
          options: ["Skip difficult parts", "Break into smaller parts", "Study randomly", "Avoid completely"],
          correct: 1,
          explanation: "Breaking complex topics into smaller, manageable parts makes learning easier and more effective."
        },
        {
          question: `What's the best way to retain knowledge in ${topic}?`,
          options: ["Single study session", "Regular review", "Cramming", "Passive reading"],
          correct: 1,
          explanation: "Regular review and practice helps move information from short-term to long-term memory."
        }
      ]
    };
  }

  try {
    const prompt = `Create a quiz about "${topic}". Return ONLY this JSON format, no extra text:

{
  "title": "${topic} Quiz",
  "timeLimit": 600,
  "questions": [
    {
      "question": "What is [specific question about ${topic}]?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Brief explanation why this answer is correct"
    }
  ]
}

Rules:
- Generate exactly 5 questions about ${topic}
- Make questions educational and accurate
- Each question should have 4 options
- Include explanation for correct answer
- Return ONLY valid JSON, no markdown or extra text`;

    const response = await fetch(
      'https://api-inference.huggingface.co/models/google/flan-t5-large',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 1500,
            temperature: 0.8,
            return_full_text: false
          }
        })
      }
    );

    if (!response.ok) {
      console.error(`HuggingFace API Error: ${response.status}`);
      throw new Error(`API failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data[0] || !data[0].generated_text) {
      throw new Error('Invalid response from HuggingFace');
    }

    let content = data[0].generated_text.trim();
    
    // Clean the response - remove any non-JSON text
    content = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^[^{]*/, '') // Remove everything before first {
      .replace(/}[^}]*$/, '}') // Remove everything after last }
      .trim();

    // Try to parse JSON
    const parsed = JSON.parse(content);
    
    // Validate structure
    if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error('Invalid questions structure');
    }

    // Ensure each question has required fields
    const validQuestions = parsed.questions.filter(q => 
      q.question && 
      q.options && 
      Array.isArray(q.options) && 
      q.options.length >= 2 &&
      typeof q.correct === 'number' &&
      q.correct >= 0 && 
      q.correct < q.options.length
    );

    if (validQuestions.length === 0) {
      throw new Error('No valid questions found');
    }

    return {
      title: parsed.title || `${topic} Quiz`,
      timeLimit: parsed.timeLimit || 600,
      shuffle: parsed.shuffle || false,
      questions: validQuestions
    };

  } catch (error) {
    console.error('HuggingFace generation failed:', error);
    
    // Return demo questions as fallback
    return generateQuestions(topic.replace(hfToken || '', ''));
  }
};
