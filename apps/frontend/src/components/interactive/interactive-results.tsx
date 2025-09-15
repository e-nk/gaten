"use client";

import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  XCircle, 
  Award, 
  Clock, 
  RotateCcw, 
  ArrowLeft, 
  Target,
  Trophy,
  TrendingUp
} from "lucide-react";

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

  const getInteractiveTypeLabel = (type: string) => {
    switch (type) {
      case 'DRAG_DROP': return 'Drag & Drop';
      case 'HOTSPOT': return 'Image Hotspots';
      case 'SEQUENCE': return 'Sequence';
      case 'MATCHING': return 'Matching';
      case 'TIMELINE': return 'Timeline';
      case 'SIMULATION': return 'Simulation';
      case 'INTERACTIVE_VIDEO': return 'Interactive Video';
      default: return 'Interactive Content';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border border-school-primary-paledogwood rounded-lg overflow-hidden">
      {/* Header */}
      <div className={`p-6 border-b ${getScoreBgColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {passed ? (
              <Trophy className="w-8 h-8 text-green-600 mr-3" />
            ) : (
              <Target className="w-8 h-8 text-red-600 mr-3" />
            )}
            <div>
              <h2 className="text-2xl font-bold text-school-primary-blue">
                {passed ? 'Excellent Work!' : 'Activity Complete'}
              </h2>
              <p className="text-gray-600">
                {getInteractiveTypeLabel(interactiveContent.type)} Results
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

        {/* Status Message */}
        <div className="mt-4">
          {passed ? (
            <div className="flex items-center text-green-700">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">
                {passingScore ? `You passed! Score: ${score?.toFixed(1)}%` : 'Activity completed successfully!'}
              </span>
            </div>
          ) : passingScore ? (
            <div className="flex items-center text-red-700">
              <XCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">
                Score needed: {passingScore}% | Your score: {score?.toFixed(1)}%
              </span>
            </div>
          ) : (
            <div className="flex items-center text-blue-700">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">Activity completed!</span>
            </div>
          )}
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
              <div className="flex justify-between">
                <span>Activity Type:</span>
                <span className="font-medium">
                  {getInteractiveTypeLabel(interactiveContent.type)}
                </span>
              </div>
              {passingScore && (
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-medium ${passed ? 'text-green-600' : 'text-red-600'}`}>
                    {passed ? 'Passed' : 'Needs Improvement'}
                  </span>
                </div>
              )}
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
                  {formatTime(timeSpent)}
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

        {/* Type-Specific Feedback */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Activity Summary</h4>
          <div className="text-blue-700 text-sm">
            <InteractiveTypeFeedback 
              type={interactiveContent.type}
              content={interactiveContent.content}
              score={score || 0}
              responses={attempt.responses}
            />
          </div>
        </div>

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
              onClick={() => {
                onRetry();
                onClose();
              }}
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
                🎉 Outstanding! You've mastered this interactive activity.
              </p>
              <p className="text-green-600 text-sm mt-1">
                Your understanding of the material is excellent!
              </p>
            </div>
          ) : canRetry ? (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-800 font-medium">
                💪 Great effort! Learning takes practice.
              </p>
              <p className="text-orange-600 text-sm mt-1">
                Review the activity and try again to improve your performance.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-800 font-medium">
                ✅ Activity completed!
              </p>
              <p className="text-gray-600 text-sm mt-1">
                Continue with your learning journey in the next lesson.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Type-specific feedback component
function InteractiveTypeFeedback({ type, content, score, responses }: any) {
  switch (type) {
    case 'DRAG_DROP':
      const dragDropItems = content.items?.length || 0;
      const correctPlacements = Math.round((score / 100) * dragDropItems);
      return (
        <p>You correctly placed {correctPlacements} out of {dragDropItems} items in their proper locations.</p>
      );
      
    case 'HOTSPOT':
      const hotspots = content.hotspots?.length || 0;
      const foundHotspots = Math.round((score / 100) * hotspots);
      return (
        <p>You successfully identified {foundHotspots} out of {hotspots} correct areas in the image.</p>
      );
      
    case 'SEQUENCE':
      const sequenceItems = content.items?.length || 0;
      const correctOrder = Math.round((score / 100) * sequenceItems);
      return (
        <p>You arranged {correctOrder} out of {sequenceItems} items in the correct chronological order.</p>
      );
      
    case 'MATCHING':
      const matchingPairs = content.leftItems?.length || 0;
      const correctMatches = Math.round((score / 100) * matchingPairs);
      return (
        <p>You made {correctMatches} out of {matchingPairs} correct matches between the items.</p>
      );
      
    case 'TIMELINE':
      const timelineEvents = content.events?.length || 0;
      const correctTimelinePlacements = Math.round((score / 100) * timelineEvents);
      return (
        <p>You placed {correctTimelinePlacements} out of {timelineEvents} events correctly on the timeline.</p>
      );
      
    case 'SIMULATION':
      const choices = responses?.choiceHistory?.length || 0;
      const correctChoices = responses?.choiceHistory?.filter((c: any) => c.isCorrect)?.length || 0;
      return (
        <p>You made {correctChoices} out of {choices} optimal decisions in the simulation scenario.</p>
      );
      
    case 'INTERACTIVE_VIDEO':
      const interactions = responses?.completedInteractions?.length || 0;
      return (
        <p>You completed {interactions} interactive elements and achieved {score.toFixed(1)}% overall performance.</p>
      );
      
    default:
      return (
        <p>You achieved {score.toFixed(1)}% performance in this interactive activity. Great work!</p>
      );
  }
}