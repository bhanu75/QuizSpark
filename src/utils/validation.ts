import { QuestionSet } from '../types';

export const validateQuestionSet = (data: any): QuestionSet => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format');
  }

  if (!data.questions || !Array.isArray(data.questions)) {
    throw new Error('Questions array is required');
  }

  if (data.questions.length === 0) {
    throw new Error('At least one question is required');
  }

  for (let i = 0; i < data.questions.length; i++) {
    const q = data.questions[i];
    
    if (!q.question || typeof q.question !== 'string') {
      throw new Error(`Question ${i + 1}: Question text is required`);
    }
    
    if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
      throw new Error(`Question ${i + 1}: At least 2 options are required`);
    }
    
    if (typeof q.correct !== 'number' || q.correct < 0 || q.correct >= q.options.length) {
      throw new Error(`Question ${i + 1}: Invalid correct answer index`);
    }
  }

  return {
    title: data.title || 'Untitled Quiz',
    timeLimit: data.timeLimit || 0,
    shuffle: data.shuffle || false,
    questions: data.questions
  };
};
