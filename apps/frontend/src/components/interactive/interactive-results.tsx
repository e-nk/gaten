"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Award, Clock, RotateCcw, ArrowLeft, Target } from "lucide-react";

interface InteractiveResultsProps {
  interactiveContent: any;
  result: any;
  onClose: () => void;
  onRetry?: () => void;
  canRetry: boolean;
}

export function InteractiveResults({ 
  interactiveContent, 
  result, 
  onClose, 
  onRetry, 
  canRetry 
}: InteractiveResultsProps) {
  const { attempt, score, passed } = result;
  const timeSpent = attempt.timeSpent || 0;
  const passingScore = interactiveContent.passingScore;

  const getScoreColor = () => {
    if (!passingScore) return 'text-blue-600';
    return passed ? 'text-green-600' : 'text-red-600';
  };

  const getScoreBgColor = () => {
    if (!passingScore) return 'bg-blue-50 border-blue-200';
    return passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
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
                Activity {passed ? 'Completed!' : 'Results'}
              </h2>
              <p className="text-gray-600">
                {interactiveContent.title}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-4xl font-bold ${getScoreColor()}`}>
              {score?.toFixed(1) || 0}%
            </div>
            {passingScore && (
              <div className="text-sm text-gray-600">
                Passing: {passingScore}%
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Performance */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Award className="w-5 h-5 text-school-primary-blue mr-2" />
              <h3 className="font-semibold text-school-primary-blue">Performance</h3>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Score:</span>
                <span className={`font-medium ${getScoreColor()}`}>
                  {score?.toFixed(1) || 0}%
                </span>
              </div>
              {passingScore && (
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-medium ${passed ? 'text-green-600' : 'text-red-600'}`}>
                    {passed ? 'Passed' : 'Failed'}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Activity Type:</span>
                <span className="font-medium">
                  {interactiveContent.type.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </span>
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
                <span className="font-medium">
                  {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
                </span>
              </div>
              {interactiveContent.timeLimit && (
                <div className="flex justify-between">
                  <span>Time Limit:</span>
                  <span className="font-medium">{interactiveContent.timeLimit}m</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Completed:</span>
                <span className="font-medium">
                  {new Date(attempt.completedAt || attempt.startedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          {/* Attempt Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <RotateCcw className="w-5 h-5 text-school-primary-blue mr-2" />
              <h3 className="font-semibold text-school-primary-blue">Attempts</h3>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>This Attempt:</span>
                <span className="font-medium">Latest</span>
              </div>
              <div className="flex justify-between">
                <span>Max Allowed:</span>
                <span className="font-medium">{interactiveContent.maxAttempts}</span>
              </div>
              {canRetry && (
                <div className="flex justify-between">
                  <span>Can Retry:</span>
                  <span className="font-medium text-green-600">Yes</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Visualization */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Overall Performance</span>
            <span>{score?.toFixed(1) || 0}%{passingScore ? ` of ${passingScore}% needed` : ''}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className={`h-4 rounded-full transition-all duration-1000 ${
                passed ? 'bg-green-500' : score && score >= (passingScore || 0) * 0.8 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(score || 0, 100)}%` }}
            ></div>
          </div>
          {passingScore && (
            <div className="relative">
              <div 
                className="absolute top-0 w-0.5 h-4 bg-gray-500"
                style={{ left: `${passingScore}%` }}
              ></div>
              <div 
                className="absolute top-4 text-xs text-gray-500 transform -translate-x-1/2"
                style={{ left: `${passingScore}%` }}
              >
                Pass: {passingScore}%
              </div>
            </div>
          )}
        </div>

        {/* Activity-Specific Feedback */}
        {interactiveContent.showFeedback && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Activity Feedback</h4>
            <div className="text-blue-700 text-sm">
              {interactiveContent.type === 'DRAG_DROP' && (
                <p>You correctly placed {Math.round((score || 0) / 100 * (interactiveContent.content?.items?.length || 0))} out of {interactiveContent.content?.items?.length || 0} items.</p>
              )}
              {interactiveContent.type === 'HOTSPOT' && (
                <p>You identified {Math.round((score || 0) / 100 * (interactiveContent.content?.hotspots?.length || 0))} out of {interactiveContent.content?.hotspots?.length || 0} correct areas.</p>
              )}
              {interactiveContent.type === 'SEQUENCE' && (
                <p>You arranged {Math.round((score || 0) / 100 * (interactiveContent.content?.items?.length || 0))} out of {interactiveContent.content?.items?.length || 0} items correctly.</p>
              )}
              {interactiveContent.type === 'MATCHING' && (
                <p>You made {Math.round((score || 0) / 100 * (interactiveContent.content?.leftItems?.length || 0))} out of {interactiveContent.content?.leftItems?.length || 0} correct matches.</p>
              )}
              {!['DRAG_DROP', 'HOTSPOT', 'SEQUENCE', 'MATCHING'].includes(interactiveContent.type) && (
                <p>Great job completing this interactive activity!</p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lesson
          </Button>
          
          {canRetry && onRetry && (
            <Button
              onClick={onRetry}
              className={`${
                passed 
                  ? 'bg-school-primary-blue hover:bg-school-primary-blue/90' 
                  : 'bg-orange-600 hover:bg-orange-700'
              } text-white`}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {passed ? 'Try Again' : 'Retry Activity'}
            </Button>
          )}
        </div>

        {/* Encouragement Message */}
        <div className="mt-6 text-center">
          {passed ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                🎉 Excellent work! You've successfully completed this interactive activity.
              </p>
              <p className="text-green-600 text-sm mt-1">
                You've demonstrated great understanding of the material!
              </p>
            </div>
          ) : canRetry ? (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-800 font-medium">
                Keep trying! Learning is a process.
              </p>
              <p className="text-orange-600 text-sm mt-1">
                Review the content and try the activity again to improve your score.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-800 font-medium">
                Activity completed!
              </p>
              <p className="text-gray-600 text-sm mt-1">
                You can continue with the next lesson in your learning journey.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}