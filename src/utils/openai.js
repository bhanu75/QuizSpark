export const generateQuestions = async (topic, apiKey) => {
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
          content: `You are an expert educational content creator. Generate multiple choice questions in JSON format. Always respond with valid JSON only.

Format exactly like this:
{
  "title": "Topic Quiz",
  "timeLimit": 600,
  "questions": [
    {
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "explanation": "Brief explanation"
    }
  ]
}

Rules:
- Generate 8-12 questions
- Educational and accurate content
- Include explanations
- Mixed difficulty levels
- One correct answer only`
        },
        {
          role: 'user',
          content: `Generate multiple choice questions about: ${topic}`
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API Error: ${response.status}`);
  }

  const data = await response.json();
  let content = data.choices[0].message.content.trim();
  
  // Clean markdown formatting
  if (content.startsWith('```json')) {
    content = content.replace(/```json\n?/, '').replace(/```$/, '');
  }
  
  return JSON.parse(content);
};
