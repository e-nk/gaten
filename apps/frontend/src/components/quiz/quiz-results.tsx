"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Award, RefreshCw, Eye } from "lucide-react";

interface QuizResultsProps {
  result: {
    attempt: any;
    score: number;
    passed: boolean;
    totalPoints: number;
    pointsEarned: number;
  };
  quiz: any;
  onRetakeQuiz?: () => void;
  onViewAnswers?: () => void;
  canRetake: boolean;
}

export function QuizResults({ result, quiz, onRetakeQuiz, onViewAnswers, canRetake }: QuizResultsProps) {
  const { score, passed, totalPoints, pointsEarned, attempt } = result;
  const timeSpent = attempt.timeSpent ? Math.floor(attempt.timeSpent / 60) : 0;

  const getScoreColor = () => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = () => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="bg-white border border-school-primary-paledogwood rounded-lg overflow-hidden">
      {/* Header */}
      <div className={`p-6 border-b ${getScoreBgColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {passed ? (
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600 mr-3" />
            )}
            <div>
              <h2 className="text-2xl font-bold text-school-primary-blue">
                Quiz {passed ? 'Passed!' : 'Failed'}
              </h2>
              <p className="text-gray-600">
                {quiz.title}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-4xl font-bold ${getScoreColor()}`}>
              {score.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">
              Passing: {quiz.passingScore}%
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Score Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Award className="w-5 h-5 text-school-primary-blue mr-2" />
              <h3 className="font-semibold text-school-primary-blue">Score Breakdown</h3>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Points Earned:</span>
                <span className="font-medium">{pointsEarned}/{totalPoints}</span>
              </div>
              <div className="flex justify-between">
                <span>Percentage:</span>
                <span className={`font-medium ${getScoreColor()}`}>{score.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Questions:</span>
                <span className="font-medium">{quiz.questions?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Time Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Clock className="w-5 h-5 text-school-primary-blue mr-2" />
              <h3 className="font-semibold text-school-primary-blue">Time</h3>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Time Spent:</span>
                <span className="font-medium">{timeSpent} min</span>
              </div>
              {quiz.timeLimit && (
                <div className="flex justify-between">
                  <span>Time Limit:</span>
                  <span className="font-medium">{quiz.timeLimit} min</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Submitted:</span>
                <span className="font-medium">
                  {new Date(attempt.submittedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          {/* Attempt Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <RefreshCw className="w-5 h-5 text-school-primary-blue mr-2" />
              <h3 className="font-semibold text-school-primary-blue">Attempts</h3>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>This Attempt:</span>
                <span className="font-medium">#{attempt.attemptNumber || 1}</span>
              </div>
              <div className="flex justify-between">
                <span>Max Allowed:</span>
                <span className="font-medium">{quiz.maxAttempts}</span>
              </div>
              {canRetake && (
                <div className="flex justify-between">
                  <span>Remaining:</span>
                  <span className="font-medium text-green-600">
                    {quiz.maxAttempts - (attempt.attemptNumber || 1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Overall Performance</span>
            <span>{score.toFixed(1)}% of {quiz.passingScore}% needed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                passed ? 'bg-green-500' : score >= quiz.passingScore * 0.8 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(score, 100)}%` }}
            ></div>
          </div>
          {quiz.passingScore && (
            <div className="relative">
              <div 
                className="absolute top-0 w-0.5 h-3 bg-gray-500"
                style={{ left: `${quiz.passingScore}%` }}
              ></div>
              <div 
                className="absolute top-3 text-xs text-gray-500 transform -translate-x-1/2"
                style={{ left: `${quiz.passingScore}%` }}
              >
                Pass: {quiz.passingScore}%
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          {quiz.showCorrectAnswers && (
						<Button
							onClick={onViewAnswers}
							variant="outline"
							className="flex items-center"
						>
							<Eye className="w-4 h-4 mr-2" />
							Review Answers
						</Button>
					)}
					
					{canRetake ? (
						<Button
							onClick={onRetakeQuiz}
							className={`${
								passed 
									? 'bg-school-primary-blue hover:bg-school-primary-blue/90' 
									: 'bg-red-600 hover:bg-red-700'
							} text-white`}
						>
							<RefreshCw className="w-4 h-4 mr-2" />
							{passed ? 'Retake Quiz' : 'Try Again'}
						</Button>
					) : (
						<div className="text-center">
							<div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
								<span className="text-sm font-medium">
									All {quiz.maxAttempts} attempt{quiz.maxAttempts !== 1 ? 's' : ''} used
								</span>
							</div>
						</div>
					)}
        </div>

        {/* Encouragement Message */}
        <div className="mt-6 text-center">
					{passed ? (
						<div className="p-4 bg-green-50 border border-green-200 rounded-lg">
							<p className="text-green-800 font-medium">
								🎉 Congratulations! You've successfully completed this quiz.
							</p>
							<p className="text-green-600 text-sm mt-1">
								Great job on demonstrating your understanding of the material!
							</p>
						</div>
					) : canRetake ? (
						<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
							<p className="text-blue-800 font-medium">
								Keep learning! Review the material and try again.
							</p>
							<p className="text-blue-600 text-sm mt-1">
								You have {quiz.maxAttempts - (attempt.attemptNumber || 1)} attempts remaining.
							</p>
						</div>
					) : (
						<div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
							<p className="text-gray-800 font-medium">
								Quiz Completed
							</p>
							<p className="text-gray-600 text-sm mt-1">
								{passed 
									? 'You can continue to the next lesson.'
									: quiz.showCorrectAnswers 
										? 'Review the correct answers above to learn from this attempt.'
										: 'Contact your instructor if you need additional help with this material.'
								}
							</p>
						</div>
					)}
				</div>
      </div>
    </div>
  );
}