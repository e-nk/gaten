"use client";

import { AnswerReview, ReviewData, ReviewItem } from "@/components/review/answer-review";

interface QuizAnswerReviewProps {
  quiz: any;
  attempt: any;
  onClose: () => void;
  onRetake?: () => void;
}

export function QuizAnswerReview({ quiz, attempt, onClose, onRetake }: QuizAnswerReviewProps) {
  // Transform quiz data into review format
  const reviewData: ReviewData = {
    title: quiz.title,
    type: 'QUIZ',
    totalPoints: attempt.totalPoints,
    earnedPoints: attempt.pointsEarned,
    score: attempt.score,
    passed: attempt.passed,
    passingScore: quiz.passingScore,
    timeSpent: attempt.timeSpent,
    submittedAt: new Date(attempt.submittedAt),
    showCorrectAnswers: quiz.showCorrectAnswers,
    allowRetake: true, // This will be controlled by parent
    items: quiz.questions.map((question: any, index: number): ReviewItem => {
      const userAnswer = attempt.answers[question.id] || attempt.answers[index];
      const isCorrect = calculateIsCorrect(question, userAnswer);
      
      return {
        id: question.id,
        type: question.type,
        question: question.question,
        userAnswer: userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: isCorrect,
        points: isCorrect ? question.points : 0,
        maxPoints: question.points,
        explanation: question.explanation,
        content: question.content,
        submittedAt: new Date(attempt.submittedAt)
      };
    })
  };

  return (
    <AnswerReview
      reviewData={reviewData}
      onClose={onClose}
      onRetake={onRetake}
    />
  );
}

// Helper function to calculate if answer is correct (reuse from backend logic)
function calculateIsCorrect(question: any, userAnswer: any): boolean {
  if (!userAnswer && userAnswer !== 0) return false;

  switch (question.type) {
    case 'MULTIPLE_CHOICE':
    case 'TRUE_FALSE':
      return userAnswer === question.correctAnswer;
      
    case 'MULTIPLE_SELECT':
      const correctAnswers = question.correctAnswer || [];
      const userAnswers = Array.isArray(userAnswer) ? userAnswer : [];
      return correctAnswers.length === userAnswers.length &&
             correctAnswers.every((answer: number) => userAnswers.includes(answer));
             
    case 'FILL_BLANK':
      const correctBlanks = question.correctAnswer || [];
      const userBlanks = Array.isArray(userAnswer) ? userAnswer : [];
      return correctBlanks.every((correct: string, index: number) => {
        const userResponse = userBlanks[index]?.toLowerCase().trim();
        const correctResponse = correct.toLowerCase().trim();
        return userResponse === correctResponse;
      });
      
    case 'SHORT_ANSWER':
      const correctAnswer = question.correctAnswer || '';
      const userResponse = userAnswer || '';
      const caseSensitive = question.content?.caseSensitive || false;
      const exactMatch = question.content?.exactMatch || false;
      
      if (!exactMatch) return true; // Assume correct for manual grading
      
      if (caseSensitive) {
        return userResponse.trim() === correctAnswer.trim();
      } else {
        return userResponse.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
      }
      
    default:
      return false;
  }
}