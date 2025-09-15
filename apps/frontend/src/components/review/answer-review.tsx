"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  ArrowRight, 
  Eye, 
  EyeOff,
  Info,
  BookOpen,
  FileText,
  Upload,
  Clock
} from "lucide-react";

export interface ReviewItem {
  id: string;
  type: 'MULTIPLE_CHOICE' | 'MULTIPLE_SELECT' | 'TRUE_FALSE' | 'FILL_BLANK' | 'SHORT_ANSWER' | 'ESSAY' | 'FILE_UPLOAD';
  question: string;
  userAnswer: any;
  correctAnswer?: any;
  isCorrect?: boolean;
  points: number;
  maxPoints: number;
  explanation?: string;
  feedback?: string;
  content?: any; // Question-specific content (options, etc.)
  submittedAt?: Date;
  gradedAt?: Date;
  graderNotes?: string;
}

export interface ReviewData {
  title: string;
  type: 'QUIZ' | 'ASSIGNMENT' | 'EXERCISE' | 'SURVEY';
  totalPoints: number;
  earnedPoints: number;
  score: number; // Percentage
  passed?: boolean;
  passingScore?: number;
  timeSpent?: number;
  submittedAt: Date;
  items: ReviewItem[];
  allowRetake?: boolean;
  showCorrectAnswers?: boolean;
  feedback?: string;
}

interface AnswerReviewProps {
  reviewData: ReviewData;
  onClose: () => void;
  onRetake?: () => void;
}

export function AnswerReview({ reviewData, onClose, onRetake }: AnswerReviewProps) {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [showExplanations, setShowExplanations] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'correct' | 'incorrect'>('all');

  const currentItem = reviewData.items[currentItemIndex];
  
  // Filter items based on type
  const filteredItems = reviewData.items.filter(item => {
    if (filterType === 'all') return true;
    if (filterType === 'correct') return item.isCorrect === true;
    if (filterType === 'incorrect') return item.isCorrect === false;
    return true;
  });

  const correctCount = reviewData.items.filter(item => item.isCorrect).length;
  const incorrectCount = reviewData.items.filter(item => !item.isCorrect).length;

  const goToNext = () => {
    if (currentItemIndex < reviewData.items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1);
    }
  };

  const goToItem = (index: number) => {
    setCurrentItemIndex(index);
  };

  return (
    <div className="bg-white border border-school-primary-paledogwood rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 p-6 border-b border-school-primary-paledogwood">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-school-primary-blue">
              Review: {reviewData.title}
            </h2>
            <p className="text-gray-600">
              {reviewData.type.charAt(0) + reviewData.type.slice(1).toLowerCase()} Results
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className={`text-2xl font-bold ${
                reviewData.passed ? 'text-green-600' : 'text-red-600'
              }`}>
                {reviewData.score.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">
                {reviewData.earnedPoints}/{reviewData.totalPoints} points
              </div>
            </div>
            
            <Button onClick={onClose} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-sm text-gray-600">Total Questions</div>
            <div className="text-lg font-bold text-gray-900">{reviewData.items.length}</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-sm text-gray-600">Correct</div>
            <div className="text-lg font-bold text-green-600">{correctCount}</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-sm text-gray-600">Incorrect</div>
            <div className="text-lg font-bold text-red-600">{incorrectCount}</div>
          </div>
          
          {reviewData.timeSpent && (
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-sm text-gray-600">Time Spent</div>
              <div className="text-lg font-bold text-gray-900">
                {Math.floor(reviewData.timeSpent / 60)}m {reviewData.timeSpent % 60}s
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 text-xs font-medium ${
                    filterType === 'all' 
                      ? 'bg-school-primary-blue text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  All ({reviewData.items.length})
                </button>
                <button
                  onClick={() => setFilterType('correct')}
                  className={`px-3 py-1 text-xs font-medium ${
                    filterType === 'correct' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Correct ({correctCount})
                </button>
                <button
                  onClick={() => setFilterType('incorrect')}
                  className={`px-3 py-1 text-xs font-medium ${
                    filterType === 'incorrect' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Incorrect ({incorrectCount})
                </button>
              </div>
            </div>

            {/* Show/Hide Explanations */}
            {reviewData.showCorrectAnswers && (
              <Button
                onClick={() => setShowExplanations(!showExplanations)}
                variant="outline"
                size="sm"
              >
                {showExplanations ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showExplanations ? 'Hide' : 'Show'} Explanations
              </Button>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Question {currentItemIndex + 1} of {reviewData.items.length}
            </span>
            <Button
              onClick={goToPrevious}
              disabled={currentItemIndex === 0}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button
              onClick={goToNext}
              disabled={currentItemIndex === reviewData.items.length - 1}
              variant="outline"
              size="sm"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Question Navigation Pills */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex flex-wrap gap-2">
          {reviewData.items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => goToItem(index)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                index === currentItemIndex
                  ? 'bg-school-primary-blue text-white'
                  : item.isCorrect === true
                    ? 'bg-green-100 text-green-600 border border-green-300'
                    : item.isCorrect === false
                      ? 'bg-red-100 text-red-600 border border-red-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Current Question Review */}
      {currentItem && (
        <div className="p-6">
          <ReviewItemDisplay
            item={currentItem}
            showExplanations={showExplanations}
            showCorrectAnswers={reviewData.showCorrectAnswers}
            index={currentItemIndex}
          />
        </div>
      )}

      {/* Footer Actions */}
      <div className="bg-gray-50 p-6 border-t border-school-primary-paledogwood">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Submitted: {reviewData.submittedAt.toLocaleString()}
          </div>
          
          <div className="flex items-center gap-3">
            {reviewData.feedback && (
              <Button variant="outline" size="sm">
                <Info className="w-4 h-4 mr-2" />
                Instructor Feedback
              </Button>
            )}
            
            {reviewData.allowRetake && onRetake && (
              <Button 
                onClick={onRetake}
                className="bg-school-primary-blue hover:bg-school-primary-blue/90 text-white"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Retake
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Individual item display component
function ReviewItemDisplay({ 
  item, 
  showExplanations, 
  showCorrectAnswers, 
  index 
}: {
  item: ReviewItem;
  showExplanations: boolean;
  showCorrectAnswers?: boolean;
  index: number;
}) {
  return (
    <div className="space-y-4">
      {/* Question Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="w-8 h-8 bg-school-primary-blue text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
              {index + 1}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                {item.type.replace('_', ' ')}
              </span>
              {item.isCorrect !== undefined && (
                item.isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )
              )}
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-school-primary-blue mb-2">
            {item.question}
          </h3>
        </div>
        
        <div className="text-right ml-4">
          <div className="text-sm text-gray-600">Points</div>
          <div className={`text-lg font-bold ${
            item.isCorrect ? 'text-green-600' : 'text-red-600'
          }`}>
            {item.points}/{item.maxPoints}
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="space-y-4">
        {/* User Answer */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Your Answer:</h4>
          <UserAnswerDisplay item={item} />
        </div>

        {/* Correct Answer (if enabled and different) */}
        {showCorrectAnswers && showExplanations && item.correctAnswer !== undefined && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">Correct Answer:</h4>
            <CorrectAnswerDisplay item={item} />
          </div>
        )}

        {/* Explanation */}
        {showExplanations && item.explanation && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Explanation:</h4>
            <p className="text-yellow-700">{item.explanation}</p>
          </div>
        )}

        {/* Grader Feedback */}
        {item.feedback && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-800 mb-2">Instructor Feedback:</h4>
            <p className="text-purple-700">{item.feedback}</p>
            {item.gradedAt && (
              <p className="text-xs text-purple-600 mt-2">
                Graded: {item.gradedAt.toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// User answer display based on question type
function UserAnswerDisplay({ item }: { item: ReviewItem }) {
  switch (item.type) {
    case 'MULTIPLE_CHOICE':
    case 'MULTIPLE_SELECT':
      const options = item.content?.options || [];
      const selectedIndices = Array.isArray(item.userAnswer) ? item.userAnswer : [item.userAnswer];
      
      return (
        <div className="space-y-2">
          {options.map((option: string, index: number) => (
            <div key={index} className={`flex items-center p-2 rounded ${
              selectedIndices.includes(index) ? 'bg-blue-100 border border-blue-300' : 'bg-gray-50'
            }`}>
              <input
                type={item.type === 'MULTIPLE_CHOICE' ? 'radio' : 'checkbox'}
                checked={selectedIndices.includes(index)}
                readOnly
                className="mr-2"
              />
              <span>{option}</span>
            </div>
          ))}
        </div>
      );

    case 'TRUE_FALSE':
      return (
        <div className="font-medium">
          {item.userAnswer === 0 ? 'True' : item.userAnswer === 1 ? 'False' : 'No answer'}
        </div>
      );

    case 'FILL_BLANK':
      const answers = Array.isArray(item.userAnswer) ? item.userAnswer : [item.userAnswer];
      return (
        <div className="space-y-2">
          {answers.map((answer: string, index: number) => (
            <div key={index} className="flex items-center">
              <span className="text-sm font-medium text-gray-600 mr-2">Blank {index + 1}:</span>
              <span className="px-3 py-1 bg-white border border-gray-300 rounded">
                {answer || '(empty)'}
              </span>
            </div>
          ))}
        </div>
      );

    case 'SHORT_ANSWER':
    case 'ESSAY':
      return (
        <div className="whitespace-pre-wrap bg-white border border-gray-300 rounded p-3">
          {item.userAnswer || '(No answer provided)'}
        </div>
      );

    case 'FILE_UPLOAD':
      return (
        <div className="flex items-center p-3 bg-white border border-gray-300 rounded">
          <Upload className="w-5 h-5 text-gray-500 mr-2" />
          <span>{item.userAnswer ? `File: ${item.userAnswer}` : 'No file uploaded'}</span>
        </div>
      );

    default:
      return <div className="text-gray-500">Answer format not supported</div>;
  }
}

// Correct answer display
function CorrectAnswerDisplay({ item }: { item: ReviewItem }) {
  switch (item.type) {
    case 'MULTIPLE_CHOICE':
      const options = item.content?.options || [];
      const correctIndex = item.correctAnswer;
      return (
        <div className="font-medium text-green-700">
          {options[correctIndex] || 'Answer not available'}
        </div>
      );

    case 'MULTIPLE_SELECT':
      const multiOptions = item.content?.options || [];
      const correctIndices = Array.isArray(item.correctAnswer) ? item.correctAnswer : [];
      return (
        <div className="space-y-1">
          {correctIndices.map((index: number) => (
            <div key={index} className="text-green-700">
              • {multiOptions[index]}
            </div>
          ))}
        </div>
      );

    case 'TRUE_FALSE':
      return (
        <div className="font-medium text-green-700">
          {item.correctAnswer === 0 ? 'True' : 'False'}
        </div>
      );

    case 'FILL_BLANK':
      const correctAnswers = Array.isArray(item.correctAnswer) ? item.correctAnswer : [item.correctAnswer];
      return (
        <div className="space-y-1">
          {correctAnswers.map((answer: string, index: number) => (
            <div key={index} className="text-green-700">
              Blank {index + 1}: <span className="font-medium">{answer}</span>
            </div>
          ))}
        </div>
      );

    case 'SHORT_ANSWER':
      return (
        <div className="text-green-700 font-medium">
          {item.correctAnswer || 'Sample answer not provided'}
        </div>
      );

    default:
      return <div className="text-gray-500">Correct answer not available</div>;
  }
}