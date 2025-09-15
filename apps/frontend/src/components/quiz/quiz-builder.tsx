"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical, Settings, Eye } from "lucide-react";

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

interface QuizBuilderProps {
  onSave: (quizData: any) => void;
  initialData?: any;
}

export function QuizBuilder({ onSave, initialData }: QuizBuilderProps) {
  const [quizSettings, setQuizSettings] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    timeLimit: initialData?.timeLimit || null,
    maxAttempts: initialData?.maxAttempts || 1,
    passingScore: initialData?.passingScore || 70,
    shuffleQuestions: initialData?.shuffleQuestions || false,
    showResults: initialData?.showResults || true,
    showCorrectAnswers: initialData?.showCorrectAnswers || true,
  });

  const [questions, setQuestions] = useState<QuizQuestion[]>(initialData?.questions || []);
  const [showSettings, setShowSettings] = useState(false);

  const addQuestion = (type: QuizQuestion['type']) => {
    const newQuestion: QuizQuestion = {
      id: `temp_${Date.now()}`,
      type,
      question: '',
      content: getDefaultContent(type),
      correctAnswer: getDefaultCorrectAnswer(type),
      explanation: '',
      points: 1,
      order: questions.length,
    };
    setQuestions([...questions, newQuestion]);
  };

  const getDefaultContent = (type: QuizQuestion['type']) => {
    switch (type) {
      case 'MULTIPLE_CHOICE':
      case 'MULTIPLE_SELECT':
        return { options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'] };
      case 'TRUE_FALSE':
        return { options: ['True', 'False'] };
      case 'FILL_BLANK':
        return { blanks: 1 };
      default:
        return {};
    }
  };

  const getDefaultCorrectAnswer = (type: QuizQuestion['type']) => {
    switch (type) {
      case 'MULTIPLE_CHOICE':
        return 0; // Index of correct option
      case 'MULTIPLE_SELECT':
        return [0]; // Array of correct option indices
      case 'TRUE_FALSE':
        return 0; // 0 for True, 1 for False
      case 'FILL_BLANK':
        return ['correct answer'];
      case 'SHORT_ANSWER':
        return 'sample answer';
      default:
        return '';
    }
  };

  const updateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const quizData = {
      ...quizSettings,
      questions: questions.map((q, index) => ({ ...q, order: index }))
    };
    onSave(quizData);
  };

  return (
    <div className="space-y-6">
      {/* Quiz Settings Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-school-primary-blue">Quiz Builder</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            size="sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button onClick={handleSave} className="bg-school-primary-blue text-white">
            Save Quiz
          </Button>
        </div>
      </div>

      {/* Quiz Basic Info */}
      <div className="bg-white border border-school-primary-paledogwood rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-school-primary-blue mb-1">
              Quiz Title *
            </label>
            <input
              type="text"
              value={quizSettings.title}
              onChange={(e) => setQuizSettings(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
              placeholder="Enter quiz title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-school-primary-blue mb-1">
              Description
            </label>
            <textarea
              value={quizSettings.description}
              onChange={(e) => setQuizSettings(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue h-20"
              placeholder="Describe this quiz"
            />
          </div>
        </div>
      </div>

      {/* Quiz Settings Panel */}
      {showSettings && (
        <div className="bg-white border border-school-primary-paledogwood rounded-lg p-6">
          <h3 className="text-lg font-semibold text-school-primary-blue mb-4">Quiz Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-school-primary-blue mb-1">
                Time Limit (minutes)
              </label>
              <input
                type="number"
                value={quizSettings.timeLimit || ''}
                onChange={(e) => setQuizSettings(prev => ({ 
                  ...prev, 
                  timeLimit: e.target.value ? parseInt(e.target.value) : null 
                }))}
                className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
                placeholder="No limit"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-school-primary-blue mb-1">
                Max Attempts
              </label>
              <input
                type="number"
                min="1"
                value={quizSettings.maxAttempts}
                onChange={(e) => setQuizSettings(prev => ({ 
                  ...prev, 
                  maxAttempts: parseInt(e.target.value) || 1 
                }))}
                className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-school-primary-blue mb-1">
                Passing Score (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={quizSettings.passingScore}
                onChange={(e) => setQuizSettings(prev => ({ 
                  ...prev, 
                  passingScore: parseFloat(e.target.value) || 70 
                }))}
                className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="shuffleQuestions"
                  checked={quizSettings.shuffleQuestions}
                  onChange={(e) => setQuizSettings(prev => ({ 
                    ...prev, 
                    shuffleQuestions: e.target.checked 
                  }))}
                  className="mr-2"
                />
                <label htmlFor="shuffleQuestions" className="text-sm text-school-primary-blue">
                  Shuffle Questions
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showResults"
                  checked={quizSettings.showResults}
                  onChange={(e) => setQuizSettings(prev => ({ 
                    ...prev, 
                    showResults: e.target.checked 
                  }))}
                  className="mr-2"
                />
                <label htmlFor="showResults" className="text-sm text-school-primary-blue">
                  Show Results After Completion
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showCorrectAnswers"
                  checked={quizSettings.showCorrectAnswers}
                  onChange={(e) => setQuizSettings(prev => ({ 
                    ...prev, 
                    showCorrectAnswers: e.target.checked 
                  }))}
                  className="mr-2"
                />
                <label htmlFor="showCorrectAnswers" className="text-sm text-school-primary-blue">
                  Show Correct Answers
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Question Buttons */}
      <div className="bg-white border border-school-primary-paledogwood rounded-lg p-6">
        <h3 className="text-lg font-semibold text-school-primary-blue mb-4">Add Questions</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <Button
            onClick={() => addQuestion('MULTIPLE_CHOICE')}
            variant="outline"
            className="flex flex-col h-20 text-xs"
          >
            <Plus className="w-4 h-4 mb-1" />
            Multiple Choice
          </Button>
          
          <Button
            onClick={() => addQuestion('MULTIPLE_SELECT')}
            variant="outline"
            className="flex flex-col h-20 text-xs"
          >
            <Plus className="w-4 h-4 mb-1" />
            Multiple Select
          </Button>
          
          <Button
            onClick={() => addQuestion('TRUE_FALSE')}
            variant="outline"
            className="flex flex-col h-20 text-xs"
          >
            <Plus className="w-4 h-4 mb-1" />
            True/False
          </Button>
          
          <Button
            onClick={() => addQuestion('FILL_BLANK')}
            variant="outline"
            className="flex flex-col h-20 text-xs"
          >
            <Plus className="w-4 h-4 mb-1" />
            Fill Blank
          </Button>
          
          <Button
            onClick={() => addQuestion('SHORT_ANSWER')}
            variant="outline"
            className="flex flex-col h-20 text-xs"
          >
            <Plus className="w-4 h-4 mb-1" />
            Short Answer
          </Button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((question, index) => (
          <QuestionEditor
            key={question.id}
            question={question}
            index={index}
            onUpdate={(updates) => updateQuestion(index, updates)}
            onRemove={() => removeQuestion(index)}
          />
        ))}
        
        {questions.length === 0 && (
          <div className="text-center py-12 bg-white border border-school-primary-paledogwood rounded-lg">
            <div className="text-gray-500">
              <Plus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No questions added yet</p>
              <p className="text-sm">Use the buttons above to add your first question</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Question Editor Component (we'll create this next)
function QuestionEditor({ question, index, onUpdate, onRemove }: {
  question: QuizQuestion;
  index: number;
  onUpdate: (updates: Partial<QuizQuestion>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="bg-white border border-school-primary-paledogwood rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <GripVertical className="w-4 h-4 text-gray-400 mr-2" />
          <h4 className="font-medium text-school-primary-blue">
            Question {index + 1} - {question.type.replace('_', ' ')}
          </h4>
        </div>
        
        <Button
          onClick={onRemove}
          variant="outline"
          size="sm"
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Question Text */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-school-primary-blue mb-1">
          Question *
        </label>
        <textarea
          value={question.question}
          onChange={(e) => onUpdate({ question: e.target.value })}
          className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue h-20"
          placeholder="Enter your question here"
        />
      </div>

      {/* Question-specific content will be rendered here based on type */}
      <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded">
        Question editor for {question.type} will be implemented next...
      </div>
    </div>
  );
}