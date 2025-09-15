"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X, Check } from "lucide-react";

interface QuizQuestion {
  id: string;
  type: 'MULTIPLE_CHOICE' | 'MULTIPLE_SELECT' | 'TRUE_FALSE' | 'FILL_BLANK' | 'SHORT_ANSWER';
  question: string;
  content: any;
  correctAnswer: any;
  explanation?: string;
  points: number;
  order: number;
}

interface QuestionEditorProps {
  question: QuizQuestion;
  index: number;
  onUpdate: (updates: Partial<QuizQuestion>) => void;
  onRemove: () => void;
}

export function QuestionEditor({ question, index, onUpdate, onRemove }: QuestionEditorProps) {
  const renderQuestionEditor = () => {
    switch (question.type) {
      case 'MULTIPLE_CHOICE':
        return <MultipleChoiceEditor question={question} onUpdate={onUpdate} />;
      case 'MULTIPLE_SELECT':
        return <MultipleSelectEditor question={question} onUpdate={onUpdate} />;
      case 'TRUE_FALSE':
        return <TrueFalseEditor question={question} onUpdate={onUpdate} />;
      case 'FILL_BLANK':
        return <FillBlankEditor question={question} onUpdate={onUpdate} />;
      case 'SHORT_ANSWER':
        return <ShortAnswerEditor question={question} onUpdate={onUpdate} />;
      default:
        return <div>Unsupported question type</div>;
    }
  };

  return (
    <div className="bg-white border border-school-primary-paledogwood rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <span className="w-8 h-8 bg-school-primary-blue text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
            {index + 1}
          </span>
          <div>
            <h4 className="font-medium text-school-primary-blue">
              {question.type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
            </h4>
            <span className="text-sm text-gray-500">{question.points} point(s)</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Points:</label>
            <input
              type="number"
              min="1"
              value={question.points}
              onChange={(e) => onUpdate({ points: parseInt(e.target.value) || 1 })}
              className="w-16 px-2 py-1 border border-school-primary-paledogwood rounded text-center text-sm"
            />
          </div>
          <Button
						type="button"
            onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onRemove();
						}}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-school-primary-blue mb-1">
          Question *
        </label>
        <textarea
          value={question.question}
          onChange={(e) => onUpdate({ question: e.target.value })}
          className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue h-20 resize-none"
          placeholder="Enter your question here"
        />
      </div>

      {/* Question-specific editor */}
      {renderQuestionEditor()}

      {/* Explanation */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-school-primary-blue mb-1">
          Explanation (optional)
        </label>
        <textarea
          value={question.explanation || ''}
          onChange={(e) => onUpdate({ explanation: e.target.value })}
          className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue h-16 resize-none"
          placeholder="Explain the correct answer (shown after submission)"
        />
      </div>
    </div>
  );
}

// Multiple Choice Editor
function MultipleChoiceEditor({ question, onUpdate }: { question: QuizQuestion; onUpdate: (updates: Partial<QuizQuestion>) => void }) {
  const options = question.content?.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
  const correctAnswer = question.correctAnswer ?? 0;

  const updateOptions = (newOptions: string[]) => {
    onUpdate({
      content: { ...question.content, options: newOptions }
    });
  };

  const updateCorrectAnswer = (index: number) => {
    onUpdate({ correctAnswer: index });
  };

  const addOption = () => {
    updateOptions([...options, `Option ${options.length + 1}`]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      updateOptions(newOptions);
      // Adjust correct answer if needed
      if (correctAnswer >= index) {
        updateCorrectAnswer(Math.max(0, correctAnswer - 1));
      }
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    updateOptions(newOptions);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-school-primary-blue">
          Answer Options
        </label>
        <Button 
					type="button" // Add this
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						addOption();
					}} 
					size="sm" 
					variant="outline"
				>
					<Plus className="w-4 h-4 mr-1" />
					Add Option
				</Button>
      </div>

      {options.map((option, index) => (
        <div key={index} className="flex items-center gap-3">
          <input
            type="radio"
            name={`question-${question.id}`}
            checked={correctAnswer === index}
            onChange={() => updateCorrectAnswer(index)}
            className="text-school-primary-blue"
          />
          <input
            type="text"
            value={option}
            onChange={(e) => updateOption(index, e.target.value)}
            className="flex-1 px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
            placeholder={`Option ${index + 1}`}
          />
          {options.length > 2 && (
            <Button
							type="button" // Add this
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								removeOption(index);
							}}
							size="sm"
							variant="outline"
							className="text-red-600"
						>
							<X className="w-4 h-4" />
						</Button>
          )}
        </div>
      ))}
      
      <p className="text-xs text-gray-500">
        Select the radio button next to the correct answer
      </p>
    </div>
  );
}

// Multiple Select Editor
function MultipleSelectEditor({ question, onUpdate }: { question: QuizQuestion; onUpdate: (updates: Partial<QuizQuestion>) => void }) {
  const options = question.content?.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
  const correctAnswers = question.correctAnswer ?? [];

  const updateOptions = (newOptions: string[]) => {
    onUpdate({
      content: { ...question.content, options: newOptions }
    });
  };

  const toggleCorrectAnswer = (index: number) => {
    const newCorrectAnswers = [...correctAnswers];
    const existingIndex = newCorrectAnswers.indexOf(index);
    
    if (existingIndex > -1) {
      newCorrectAnswers.splice(existingIndex, 1);
    } else {
      newCorrectAnswers.push(index);
    }
    
    onUpdate({ correctAnswer: newCorrectAnswers });
  };

  const addOption = () => {
    updateOptions([...options, `Option ${options.length + 1}`]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      updateOptions(newOptions);
      // Adjust correct answers
      const newCorrectAnswers = correctAnswers
        .filter((i: number) => i !== index)
        .map((i: number) => i > index ? i - 1 : i);
      onUpdate({ correctAnswer: newCorrectAnswers });
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    updateOptions(newOptions);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-school-primary-blue">
          Answer Options (multiple correct answers allowed)
        </label>
        <Button 
					type="button" // Add this
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						addOption();
					}} 
					size="sm" 
					variant="outline"
				>
					<Plus className="w-4 h-4 mr-1" />
					Add Option
				</Button>
      </div>

      {options.map((option, index) => (
        <div key={index} className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={correctAnswers.includes(index)}
            onChange={() => toggleCorrectAnswer(index)}
            className="text-school-primary-blue"
          />
          <input
            type="text"
            value={option}
            onChange={(e) => updateOption(index, e.target.value)}
            className="flex-1 px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
            placeholder={`Option ${index + 1}`}
          />
          {options.length > 2 && (
            <Button
							type="button" 
							onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							removeOption(index);
						}}
              size="sm"
              variant="outline"
              className="text-red-600"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      ))}
      
      <p className="text-xs text-gray-500">
        Check all correct answers. Students must select all correct options to get full points.
      </p>
    </div>
  );
}

// True/False Editor
function TrueFalseEditor({ question, onUpdate }: { question: QuizQuestion; onUpdate: (updates: Partial<QuizQuestion>) => void }) {
  const correctAnswer = question.correctAnswer ?? 0; // 0 = True, 1 = False

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-school-primary-blue">
        Correct Answer
      </label>
      
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <input
            type="radio"
            name={`question-${question.id}`}
            checked={correctAnswer === 0}
            onChange={() => onUpdate({ correctAnswer: 0 })}
            className="text-school-primary-blue"
          />
          <span className="font-medium text-green-600">True</span>
        </div>
        
        <div className="flex items-center gap-3">
          <input
            type="radio"
            name={`question-${question.id}`}
            checked={correctAnswer === 1}
            onChange={() => onUpdate({ correctAnswer: 1 })}
            className="text-school-primary-blue"
          />
          <span className="font-medium text-red-600">False</span>
        </div>
      </div>
    </div>
  );
}

// Fill in the Blank Editor
function FillBlankEditor({ question, onUpdate }: { question: QuizQuestion; onUpdate: (updates: Partial<QuizQuestion>) => void }) {
  const correctAnswers = question.correctAnswer ?? [''];

  const updateAnswer = (index: number, value: string) => {
    const newAnswers = [...correctAnswers];
    newAnswers[index] = value;
    onUpdate({ correctAnswer: newAnswers });
  };

  const addBlank = () => {
    onUpdate({ correctAnswer: [...correctAnswers, ''] });
  };

  const removeBlank = (index: number) => {
    if (correctAnswers.length > 1) {
      onUpdate({ 
        correctAnswer: correctAnswers.filter((_: string, i: number) => i !== index) 
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-school-primary-blue">
          Correct Answers (for blanks)
        </label>
        <Button
				 type="button"
				 onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					addBlank();
				}}
				 size="sm" 
				 variant="outline">
        <Plus className="w-4 h-4 mr-1" />
          Add Blank
        </Button>
      </div>

      {correctAnswers.map((answer: string, index: number) => (
        <div key={index} className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600 min-w-0">
            Blank {index + 1}:
          </span>
          <input
            type="text"
            value={answer}
            onChange={(e) => updateAnswer(index, e.target.value)}
            className="flex-1 px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
            placeholder="Enter correct answer"
          />
          {correctAnswers.length > 1 && (
            <Button
              onClick={() => removeBlank(index)}
              size="sm"
              variant="outline"
              className="text-red-600"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      ))}
      
      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-xs text-blue-700 mb-2">
          <strong>Tip:</strong> In your question text, use underscores _____ or the word "BLANK" to indicate where students should fill in answers.
        </p>
        <p className="text-xs text-blue-600">
          Example: "The capital of France is _____" or "The capital of France is BLANK"
        </p>
      </div>
    </div>
  );
}

// Short Answer Editor
function ShortAnswerEditor({ question, onUpdate }: { question: QuizQuestion; onUpdate: (updates: Partial<QuizQuestion>) => void }) {
  const sampleAnswer = question.correctAnswer ?? '';
  const caseSensitive = question.content?.caseSensitive ?? false;
  const exactMatch = question.content?.exactMatch ?? false;

  const updateContent = (updates: any) => {
    onUpdate({
      content: { ...question.content, ...updates }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-school-primary-blue mb-1">
          Sample/Expected Answer
        </label>
        <input
          type="text"
          value={sampleAnswer}
          onChange={(e) => onUpdate({ correctAnswer: e.target.value })}
          className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
          placeholder="Enter a sample correct answer"
        />
        <p className="text-xs text-gray-500 mt-1">
          This will be used for auto-grading if exact matching is enabled
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`caseSensitive-${question.id}`}
            checked={caseSensitive}
            onChange={(e) => updateContent({ caseSensitive: e.target.checked })}
            className="text-school-primary-blue"
          />
          <label htmlFor={`caseSensitive-${question.id}`} className="text-sm text-school-primary-blue">
            Case sensitive
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`exactMatch-${question.id}`}
            checked={exactMatch}
            onChange={(e) => updateContent({ exactMatch: e.target.checked })}
            className="text-school-primary-blue"
          />
          <label htmlFor={`exactMatch-${question.id}`} className="text-sm text-school-primary-blue">
            Require exact match for auto-grading
          </label>
        </div>
      </div>

      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-xs text-yellow-700">
          <strong>Note:</strong> Short answer questions may require manual grading for partial credit, 
          unless exact matching is enabled.
        </p>
      </div>
    </div>
  );
}