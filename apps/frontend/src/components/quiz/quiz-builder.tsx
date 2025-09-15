"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical, Settings, Eye, CheckCircle } from "lucide-react";
import { QuestionEditor } from './question-editors';

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
		timeLimit: initialData?.timeLimit || null, // Explicitly null instead of undefined
		maxAttempts: initialData?.maxAttempts || 1,
		passingScore: initialData?.passingScore || 70,
		shuffleQuestions: initialData?.shuffleQuestions || false,
		showResults: initialData?.showResults || true,
		showCorrectAnswers: initialData?.showCorrectAnswers || true,
	});

  const [questions, setQuestions] = useState<QuizQuestion[]>(initialData?.questions || []);
  const [showSettings, setShowSettings] = useState(false);
	const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');


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

  const handleSave = (e?: React.MouseEvent) => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		
		// Validate quiz data
		if (!quizSettings.title.trim()) {
			alert('Please enter a quiz title');
			return;
		}
		
		if (questions.length === 0) {
			alert('Please add at least one question');
			return;
		}
		
		// Check if all questions have content
		const incompleteQuestions = questions.filter(q => !q.question.trim());
		if (incompleteQuestions.length > 0) {
			alert('Please fill in all question texts');
			return;
		}
		
		setSaveStatus('saving');
		
		const quizData = {
			...quizSettings,
			questions: questions.map((q, index) => ({ ...q, order: index }))
		};
		
		console.log('=== QUIZ BUILDER HANDLE SAVE ===');
		console.log('Saving quiz data:', quizData);
		console.log('Number of questions:', questions.length);
		
		// Simulate brief delay for better UX
		setTimeout(() => {
			onSave(quizData);
			setSaveStatus('saved');
			
			// Reset to idle after 2 seconds
			setTimeout(() => setSaveStatus('idle'), 2000);
		}, 300);
	};

  return (
    <div className="space-y-6">
      {/* Quiz Settings Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-school-primary-blue">Quiz Builder</h2>
        <div className="flex items-center gap-2">
          <Button
            type="button" // Prevent form submission
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowSettings(!showSettings);
            }}
            variant="outline"
            size="sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button 
						type="button"
						onClick={handleSave} 
						disabled={saveStatus === 'saving'}
						className={`${
							saveStatus === 'saved' 
								? 'bg-green-600 hover:bg-green-700' 
								: 'bg-school-primary-blue hover:bg-school-primary-blue/90'
						} text-white transition-colors`}
					>
						{saveStatus === 'saving' && (
							<div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
						)}
						{saveStatus === 'saved' && <CheckCircle className="w-4 h-4 mr-2" />}
						{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Quiz'}
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
              onClick={(e) => e.stopPropagation()} // Prevent event bubbling
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
              onClick={(e) => e.stopPropagation()} // Prevent event bubbling
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
									timeLimit: e.target.value ? parseInt(e.target.value) : null // Explicitly null
								}))}
								onClick={(e) => e.stopPropagation()}
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
                onClick={(e) => e.stopPropagation()}
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
                onClick={(e) => e.stopPropagation()}
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
                  onClick={(e) => e.stopPropagation()}
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
                  onClick={(e) => e.stopPropagation()}
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
                  onClick={(e) => e.stopPropagation()}
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
            type="button" // Prevent form submission
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addQuestion('MULTIPLE_CHOICE');
            }}
            variant="outline"
            className="flex flex-col h-20 text-xs"
          >
            <Plus className="w-4 h-4 mb-1" />
            Multiple Choice
          </Button>
          
          <Button
            type="button" // Prevent form submission
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addQuestion('MULTIPLE_SELECT');
            }}
            variant="outline"
            className="flex flex-col h-20 text-xs"
          >
            <Plus className="w-4 h-4 mb-1" />
            Multiple Select
          </Button>
          
          <Button
            type="button" // Prevent form submission
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addQuestion('TRUE_FALSE');
            }}
            variant="outline"
            className="flex flex-col h-20 text-xs"
          >
            <Plus className="w-4 h-4 mb-1" />
            True/False
          </Button>
          
          <Button
            type="button" // Prevent form submission
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addQuestion('FILL_BLANK');
            }}
            variant="outline"
            className="flex flex-col h-20 text-xs"
          >
            <Plus className="w-4 h-4 mb-1" />
            Fill Blank
          </Button>
          
          <Button
            type="button" // Prevent form submission
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addQuestion('SHORT_ANSWER');
            }}
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