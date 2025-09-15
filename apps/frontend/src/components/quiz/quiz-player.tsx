"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";

interface QuizPlayerProps {
  quiz: any;
  onSubmit: (answers: any, timeSpent: number) => void;
  existingAttempts?: any[];
  isSubmitting?: boolean;
}

export function QuizPlayer({ quiz, onSubmit, existingAttempts = [], isSubmitting = false }: QuizPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    quiz.timeLimit ? quiz.timeLimit * 60 : null // Convert minutes to seconds
  );
  const [startTime] = useState(Date.now());
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const hasTimeLimit = timeRemaining !== null;
  const attemptsRemaining = quiz.maxAttempts - existingAttempts.length;

  // Timer effect
  useEffect(() => {
    if (!hasTimeLimit || timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          // Time's up - auto submit
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, hasTimeLimit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).filter(questionId => {
      const answer = answers[questionId];
      return answer !== undefined && answer !== null && answer !== '';
    }).length;
  };

  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    onSubmit(answers, timeSpent);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  // if (attemptsRemaining <= 0) {
  //   return (
  //     <div className="bg-white border border-school-primary-paledogwood rounded-lg p-8 text-center">
  //       <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
  //       <h3 className="text-xl font-bold text-school-primary-blue mb-2">
  //         No Attempts Remaining
  //       </h3>
  //       <p className="text-gray-600">
  //         You have used all {quiz.maxAttempts} attempts for this quiz.
  //       </p>
  //     </div>
  //   );
  // }

  return (
    <div className="bg-white border border-school-primary-paledogwood rounded-lg overflow-hidden">
      {/* Quiz Header */}
      <div className="bg-gray-50 p-6 border-b border-school-primary-paledogwood">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-school-primary-blue mb-1">
              {quiz.title}
            </h2>
            <p className="text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          
          <div className="text-right">
            {hasTimeLimit && timeRemaining !== null && (
              <div className="flex items-center text-school-primary-blue mb-2">
                <Clock className="w-4 h-4 mr-2" />
                <span className={`font-mono text-lg ${timeRemaining < 300 ? 'text-red-600' : ''}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
            <div className="text-sm text-gray-600">
              Answered: {getAnsweredCount()}/{questions.length}
            </div>
            <div className="text-sm text-gray-600">
              Attempts remaining: {attemptsRemaining}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-school-primary-blue h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Navigation Pills */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex flex-wrap gap-2">
          {questions.map((_: any, index: number) => (
            <button
              key={index}
              onClick={() => goToQuestion(index)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                index === currentQuestionIndex
                  ? 'bg-school-primary-blue text-white'
                  : answers[questions[index]?.id]
                    ? 'bg-green-100 text-green-600 border border-green-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Current Question */}
      {currentQuestion && (
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-school-primary-blue flex-1">
                {currentQuestion.question}
              </h3>
              <span className="ml-4 px-2 py-1 bg-school-primary-nyanza text-school-primary-blue text-sm rounded">
                {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Question Type Specific Input */}
            <QuestionInput
              question={currentQuestion}
              value={answers[currentQuestion.id]}
              onChange={(answer) => updateAnswer(currentQuestion.id, answer)}
            />
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="bg-gray-50 p-6 border-t border-school-primary-paledogwood">
        <div className="flex items-center justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-3">
            {currentQuestionIndex === questions.length - 1 ? (
              <Button
                onClick={() => setShowSubmitConfirm(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-school-primary-blue hover:bg-school-primary-blue/90 text-white"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-500 mr-3" />
              <h3 className="text-lg font-bold text-school-primary-blue">
                Submit Quiz?
              </h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Are you sure you want to submit your quiz? This action cannot be undone.
              </p>
              <div className="text-sm text-gray-500">
                <p>• Answered: {getAnsweredCount()} of {questions.length} questions</p>
                <p>• Attempts remaining after this: {attemptsRemaining - 1}</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => setShowSubmitConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Question Input Components
function QuestionInput({ question, value, onChange }: {
  question: any;
  value: any;
  onChange: (value: any) => void;
}) {
  switch (question.type) {
    case 'MULTIPLE_CHOICE':
      return <MultipleChoiceInput question={question} value={value} onChange={onChange} />;
    case 'MULTIPLE_SELECT':
      return <MultipleSelectInput question={question} value={value} onChange={onChange} />;
    case 'TRUE_FALSE':
      return <TrueFalseInput question={question} value={value} onChange={onChange} />;
    case 'FILL_BLANK':
      return <FillBlankInput question={question} value={value} onChange={onChange} />;
    case 'SHORT_ANSWER':
      return <ShortAnswerInput question={question} value={value} onChange={onChange} />;
    default:
      return <div>Unsupported question type</div>;
  }
}

function MultipleChoiceInput({ question, value, onChange }: any) {
  const options = question.content?.options || [];

  return (
    <div className="space-y-3">
      {options.map((option: string, index: number) => (
        <label key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="radio"
            name={`question-${question.id}`}
            value={index}
            checked={value === index}
            onChange={() => onChange(index)}
            className="mr-3 text-school-primary-blue"
          />
          <span className="text-gray-700">{option}</span>
        </label>
      ))}
    </div>
  );
}

function MultipleSelectInput({ question, value, onChange }: any) {
  const options = question.content?.options || [];
  const selectedValues = Array.isArray(value) ? value : [];

  const handleToggle = (index: number) => {
    const newSelection = [...selectedValues];
    const existingIndex = newSelection.indexOf(index);
    
    if (existingIndex > -1) {
      newSelection.splice(existingIndex, 1);
    } else {
      newSelection.push(index);
    }
    
    onChange(newSelection);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 mb-3">Select all that apply:</p>
      {options.map((option: string, index: number) => (
        <label key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedValues.includes(index)}
            onChange={() => handleToggle(index)}
            className="mr-3 text-school-primary-blue"
          />
          <span className="text-gray-700">{option}</span>
        </label>
      ))}
    </div>
  );
}

function TrueFalseInput({ question, value, onChange }: any) {
  return (
    <div className="space-y-3">
      <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
        <input
          type="radio"
          name={`question-${question.id}`}
          value={0}
          checked={value === 0}
          onChange={() => onChange(0)}
          className="mr-3 text-school-primary-blue"
        />
        <span className="text-gray-700 font-medium text-green-600">True</span>
      </label>
      
      <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
        <input
          type="radio"
          name={`question-${question.id}`}
          value={1}
          checked={value === 1}
          onChange={() => onChange(1)}
          className="mr-3 text-school-primary-blue"
        />
        <span className="text-gray-700 font-medium text-red-600">False</span>
      </label>
    </div>
  );
}

function FillBlankInput({ question, value, onChange }: any) {
  const correctAnswers = question.correctAnswer || [''];
  const userAnswers = Array.isArray(value) ? value : new Array(correctAnswers.length).fill('');

  const updateAnswer = (index: number, answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = answer;
    onChange(newAnswers);
  };

  return (
    <div className="space-y-3">
      {correctAnswers.map((_: any, index: number) => (
        <div key={index}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Blank {index + 1}:
          </label>
          <input
            type="text"
            value={userAnswers[index] || ''}
            onChange={(e) => updateAnswer(index, e.target.value)}
            className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
            placeholder="Enter your answer"
          />
        </div>
      ))}
    </div>
  );
}

function ShortAnswerInput({ question, value, onChange }: any) {
  return (
    <div>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue h-24 resize-none"
        placeholder="Enter your answer here..."
      />
    </div>
  );
}