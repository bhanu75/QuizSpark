import { QuestionSet } from '../types';

export const generateQuestions = async (topic: string): Promise<QuestionSet> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    // Return demo questions if no API key
    return {
      title: `Demo Quiz: ${topic}`,
      timeLimit: 600,
      questions: [
        {
          question: `What is a fundamental concept in "${topic}"?`,
          options: ["Concept A", "Concept B", "Concept C", "Concept D"],
          correct: 0,
          explanation: "This is a demo question. Add your OpenAI API key for real generation."
        }
      ]
    };
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert question generator. Create multiple choice questions in JSON format. Always respond with valid JSON only.

Format:
{
  "title": "Topic Name Quiz",
  "timeLimit": 600,
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Brief explanation of the correct answer"
    }
  ]
}

Rules:
- Generate 5-10 questions
- Make questions educational and accurate  
- Include brief explanations
- Vary difficulty levels
- Ensure only one correct answer per question`
        },
        {
          role: 'user',
          content: `Generate multiple choice questions about: ${topic}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content.trim();
  
  // Clean up the response to ensure it's valid JSON
  let cleanContent = content;
  if (content.startsWith('```json')) {
    cleanContent = content.replace(/```json\n?/, '').replace(/```$/, '');
  } else if (content.startsWith('```')) {
    cleanContent = content.replace(/```\n?/, '').replace(/```$/, '');
  }

  return JSON.parse(cleanContent);
};
