"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { InteractiveVideoPlayer } from "./interactive-video-player";
import { 
  Play, 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  Award, 
  AlertTriangle,
  ArrowRight,
  Target,
  Move,
	Calendar,
	Zap,
	XCircle,
	CirclePlus,
	X,
	ChevronDown,
} from "lucide-react";

interface InteractivePlayerProps {
  interactiveContent: any;
  attempts?: any[];
  onSubmit: (responses: any, timeSpent: number) => void;
  isSubmitting?: boolean;
}

export function InteractivePlayer({ 
  interactiveContent, 
  attempts = [], 
  onSubmit, 
  isSubmitting = false 
}: InteractivePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    interactiveContent.timeLimit ? interactiveContent.timeLimit * 60 : null
  );
  const [responses, setResponses] = useState<any>({});
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const attemptsRemaining = interactiveContent.maxAttempts - attempts.length;
  const hasTimeLimit = timeRemaining !== null;
  const lastAttempt = attempts[0];

  // Timer effect
  useEffect(() => {
    if (!isPlaying || !hasTimeLimit || timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          // Time's up - auto submit
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, hasTimeLimit, isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startActivity = () => {
    setIsPlaying(true);
    setStartTime(Date.now());
    setResponses({});
  };

  const resetActivity = () => {
    setIsPlaying(false);
    setStartTime(null);
    setResponses({});
    setTimeRemaining(interactiveContent.timeLimit ? interactiveContent.timeLimit * 60 : null);
  };

  const handleTimeUp = () => {
    const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    onSubmit(responses, timeSpent);
    setIsPlaying(false);
  };

  const handleSubmit = () => {
    const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    onSubmit(responses, timeSpent);
    setIsPlaying(false);
    setShowSubmitConfirm(false);
  };

  // Check if user has attempts remaining
  if (attemptsRemaining <= 0) {
    return (
      <div className="bg-white border border-school-primary-paledogwood rounded-lg p-8 text-center">
        <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-school-primary-blue mb-2">
          No Attempts Remaining
        </h3>
        <p className="text-gray-600 mb-4">
          You have used all {interactiveContent.maxAttempts} attempts for this activity.
        </p>
        
        {lastAttempt && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h4 className="font-medium text-blue-800 mb-2">Your Best Result:</h4>
            <div className="text-2xl font-bold text-blue-600">
              {lastAttempt.score?.toFixed(1) || 0}%
            </div>
            {interactiveContent.passingScore && (
              <div className={`text-sm mt-1 ${
                (lastAttempt.score || 0) >= interactiveContent.passingScore 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {(lastAttempt.score || 0) >= interactiveContent.passingScore ? 'Passed' : 'Failed'}
                (Passing: {interactiveContent.passingScore}%)
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-school-primary-paledogwood rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-school-primary-blue mb-2">
              {interactiveContent.title}
            </h2>
            {interactiveContent.description && (
              <p className="text-gray-600 mb-4">{interactiveContent.description}</p>
            )}
            
            {/* Activity Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <Target className="w-5 h-5 text-purple-600 mr-2" />
                <div>
                  <div className="text-sm text-gray-600">Type</div>
                  <div className="font-semibold">
                    {interactiveContent.type.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <RotateCcw className="w-5 h-5 text-purple-600 mr-2" />
                <div>
                  <div className="text-sm text-gray-600">Attempts</div>
                  <div className="font-semibold">{attemptsRemaining} remaining</div>
                </div>
              </div>
              
              {hasTimeLimit && (
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-purple-600 mr-2" />
                  <div>
                    <div className="text-sm text-gray-600">Time Limit</div>
                    <div className="font-semibold">{interactiveContent.timeLimit}m</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timer Display */}
          {isPlaying && hasTimeLimit && timeRemaining !== null && (
            <div className="ml-6">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Time Remaining</div>
                <div className={`text-2xl font-bold font-mono ${
                  timeRemaining < 60 ? 'text-red-600' : 'text-purple-600'
                }`}>
                  {formatTime(timeRemaining)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar for Timer */}
        {isPlaying && hasTimeLimit && interactiveContent.timeLimit && (
          <div className="mt-4">
            <div className="w-full bg-purple-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${
                  timeRemaining && timeRemaining < 60 ? 'bg-red-500' : 'bg-purple-600'
                }`}
                style={{ 
                  width: `${timeRemaining ? (timeRemaining / (interactiveContent.timeLimit * 60)) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-6">
        {!isPlaying ? (
          // Start Screen
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Play className="w-10 h-10 text-purple-600" />
            </div>
            
            <h3 className="text-xl font-semibold text-school-primary-blue mb-2">
              Ready to start the activity?
            </h3>
            
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {interactiveContent.type === 'DRAG_DROP' && "Drag items to their correct positions."}
              {interactiveContent.type === 'HOTSPOT' && "Click on the correct areas in the image."}
              {interactiveContent.type === 'SEQUENCE' && "Arrange the items in the correct order."}
              {interactiveContent.type === 'MATCHING' && "Match items between the two columns."}
              {interactiveContent.type === 'TIMELINE' && "Place events on the timeline in chronological order."}
              {!['DRAG_DROP', 'HOTSPOT', 'SEQUENCE', 'MATCHING', 'TIMELINE'].includes(interactiveContent.type) && 
                "Complete the interactive activity to proceed."}
            </p>

            {/* Activity Instructions */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
              <h4 className="font-medium text-purple-800 mb-2">Instructions:</h4>
              <div className="text-purple-700 text-sm space-y-1">
                {hasTimeLimit && <p>• You have {interactiveContent.timeLimit} minutes to complete this activity</p>}
                <p>• You have {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining</p>
                {interactiveContent.passingScore && (
                  <p>• You need {interactiveContent.passingScore}% to pass</p>
                )}
                {interactiveContent.allowReplay && <p>• You can replay this activity if needed</p>}
              </div>
            </div>

            <Button 
              onClick={startActivity}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Activity
            </Button>

            {/* Previous Attempts */}
            {attempts.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-school-primary-blue mb-3">Previous Attempts</h4>
                <div className="space-y-2">
                  {attempts.slice(0, 3).map((attempt, index) => (
                    <div key={attempt.id} className="flex items-center justify-between bg-gray-50 rounded p-3">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700">
                          Attempt #{attempts.length - index}
                        </span>
                        <span className="mx-2 text-gray-400">•</span>
                        <span className="text-sm text-gray-600">
                          {new Date(attempt.completedAt || attempt.startedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${
                          interactiveContent.passingScore 
                            ? (attempt.score || 0) >= interactiveContent.passingScore 
                              ? 'text-green-600' 
                              : 'text-red-600'
                            : 'text-blue-600'
                        }`}>
                          {attempt.score?.toFixed(1) || 0}%
                        </span>
                        {attempt.timeSpent && (
                          <>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className="text-xs text-gray-500">
                              {Math.floor(attempt.timeSpent / 60)}:{(attempt.timeSpent % 60).toString().padStart(2, '0')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Interactive Content Area
          <div className="space-y-6">
            <InteractiveContentRenderer
              type={interactiveContent.type}
              content={interactiveContent.content}
              config={interactiveContent.config}
              responses={responses}
              onResponseUpdate={setResponses}
            />

            {/* Submit Button */}
            <div className="flex justify-center pt-6 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <Button
                  onClick={resetActivity}
                  variant="outline"
                  disabled={isSubmitting}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                
                <Button
                  onClick={() => setShowSubmitConfirm(true)}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white px-8"
                >
                  {isSubmitting ? 'Submitting...' : 'Complete Activity'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-school-primary-blue mb-4">
              Complete Activity?
            </h3>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Are you sure you want to submit your responses?
              </p>
              
              <div className="text-sm text-gray-500 space-y-1">
                <p>• Time spent: {startTime ? Math.floor((Date.now() - startTime) / 60000) : 0} minutes</p>
                <p>• Attempts remaining after this: {attemptsRemaining - 1}</p>
                {interactiveContent.passingScore && (
                  <p>• Passing score required: {interactiveContent.passingScore}%</p>
                )}
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
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Interactive content renderers based on type
function InteractiveContentRenderer({ 
  type, 
  content, 
  config, 
  responses, 
  onResponseUpdate 
}: {
  type: string;
  content: any;
  config: any;
  responses: any;
  onResponseUpdate: (responses: any) => void;
}) {
  switch (type) {
    case 'DRAG_DROP':
      return <DragDropRenderer content={content} responses={responses} onUpdate={onResponseUpdate} />;
    case 'HOTSPOT':
      return <HotspotRenderer content={content} responses={responses} onUpdate={onResponseUpdate} />;
    case 'SEQUENCE':
      return <SequenceRenderer content={content} responses={responses} onUpdate={onResponseUpdate} />;
    case 'MATCHING':
      return <MatchingRenderer content={content} responses={responses} onUpdate={onResponseUpdate} />;
    case 'TIMELINE':
      return <TimelineRenderer content={content} responses={responses} onUpdate={onResponseUpdate} />;
    case 'INTERACTIVE_VIDEO':
      return (
        <InteractiveVideoPlayer
          interactiveContent={content}
          responses={responses}
          onUpdate={onResponseUpdate}
          onComplete={() => {
            // Mark as completed when all required interactions are done
            onResponseUpdate({ ...responses, completed: true });
          }}
        />
      );
    default:
      return <DefaultRenderer type={type} content={content} responses={responses} onUpdate={onResponseUpdate} />;
  }
}

// Simple drag and drop renderer (we'll implement a basic version)
function DragDropRenderer({ content, responses, onUpdate }: any) {
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const items = content.items || [];
  const targets = content.targets || [];
  const placements = responses.placements || {};

  const handleDragStart = (item: any) => {
    setDraggedItem(item);
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedItem) {
      const newPlacements = { ...placements };
      newPlacements[draggedItem.id] = targetIndex;
      onUpdate({ ...responses, placements: newPlacements });
      setDraggedItem(null);
    }
  };

  const getItemsInTarget = (targetIndex: number) => {
    return items.filter((item: any) => placements[item.id] === targetIndex);
  };

  const getUnplacedItems = () => {
    return items.filter((item: any) => placements[item.id] === undefined);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-school-primary-blue mb-2">
          Drag and Drop Activity
        </h3>
        <p className="text-gray-600">Drag the items below to their correct targets</p>
      </div>

      {/* Drop Targets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {targets.map((target: any, index: number) => (
          <div
            key={target.id}
            className="min-h-32 border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 hover:border-purple-400 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index)}
          >
            <h4 className="font-medium text-gray-700 mb-2">{target.label}</h4>
            <div className="space-y-2">
              {getItemsInTarget(index).map((item: any) => (
                <div
                  key={item.id}
                  className="bg-purple-100 border border-purple-300 rounded px-3 py-2 text-sm cursor-move"
                  draggable
                  onDragStart={() => handleDragStart(item)}
                >
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Draggable Items */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-medium text-gray-700 mb-3">Items to Place:</h4>
        <div className="flex flex-wrap gap-3">
          {getUnplacedItems().map((item: any) => (
            <div
              key={item.id}
              className="bg-blue-100 border border-blue-300 rounded px-4 py-2 cursor-move hover:bg-blue-200 transition-colors flex items-center"
              draggable
              onDragStart={() => handleDragStart(item)}
            >
              <Move className="w-4 h-4 mr-2 text-blue-600" />
              {item.text}
            </div>
          ))}
        </div>
        
        {getUnplacedItems().length === 0 && (
          <div className="text-center py-4 text-green-600">
            <CheckCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">All items placed! Ready to submit.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Placeholder renderers for other interactive types
function HotspotRenderer({ content, responses, onUpdate }: any) {
  const [foundHotspots, setFoundHotspots] = useState<number[]>(responses.foundHotspots || []);
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const hotspots = content.hotspots || [];
  const imageUrl = content.imageUrl;

  const handleHotspotClick = (hotspotIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (foundHotspots.includes(hotspotIndex)) {
      return; // Already found this hotspot
    }

    const hotspot = hotspots[hotspotIndex];
    const newFoundHotspots = [...foundHotspots, hotspotIndex];
    
    setFoundHotspots(newFoundHotspots);
    onUpdate({ ...responses, foundHotspots: newFoundHotspots });

    // Show feedback
    setFeedback({
      message: hotspot.feedback || (hotspot.isCorrect ? 'Correct!' : 'Try again!'),
      isCorrect: hotspot.isCorrect
    });
    setShowFeedback(true);

    // Hide feedback after 3 seconds
    setTimeout(() => setShowFeedback(false), 3000);
  };

  const getCorrectHotspotsFound = () => {
    return foundHotspots.filter(index => hotspots[index]?.isCorrect).length;
  };

  const getTotalCorrectHotspots = () => {
    return hotspots.filter((hotspot: any) => hotspot.isCorrect).length;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-school-primary-blue mb-2">
          Image Hotspot Activity
        </h3>
        <p className="text-gray-600">Click on the correct areas in the image</p>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {imageUrl ? (
          <div className="relative border border-gray-300 rounded-lg overflow-hidden">
            <div className="relative">
              <img 
                src={imageUrl} 
                alt="Interactive hotspot image"
                className="w-full h-auto"
              />
              
              {/* Render Hotspots as Clickable Areas */}
              {hotspots.map((hotspot: any, index: number) => {
                const isFound = foundHotspots.includes(index);
                const isCorrect = hotspot.isCorrect;
                
                return (
                  <div
                    key={hotspot.id}
                    className={`absolute transition-all cursor-pointer ${
                      isFound 
                        ? isCorrect 
                          ? 'text-green-500 scale-110' 
                          : 'text-red-500 scale-110'
                        : 'text-blue-500 hover:text-blue-600 hover:scale-105 animate-pulse'
                    }`}
                    style={{
                      left: `${hotspot.x}%`,
                      top: `${hotspot.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    onClick={(e) => handleHotspotClick(index, e)}
                  >
                    {isFound ? (
                      isCorrect ? (
                        <CheckCircle className="w-6 h-6 drop-shadow-lg" />
                      ) : (
                        <XCircle className="w-6 h-6 drop-shadow-lg" />
                      )
                    ) : (
                      <CirclePlus className="w-6 h-6 drop-shadow-lg" />
                    )}
                    
                    {!isFound && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                        Click me!
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Feedback Display */}
            {showFeedback && feedback && (
              <div className="absolute top-4 right-4">
                <div
                  className={`p-3 rounded-lg shadow-lg max-w-xs ${
                    feedback.isCorrect 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}
                >
                  <div className="flex items-center">
                    {feedback.isCorrect ? (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    <span className="text-sm font-medium">{feedback.message}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-12 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No image configured for this hotspot activity</p>
          </div>
        )}
      </div>

      {/* Progress Display */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <Target className="w-4 h-4 mr-2 text-gray-500" />
            <span>Hotspots found: {foundHotspots.length}/{hotspots.length}</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            <span>Correct: {getCorrectHotspotsFound()}/{getTotalCorrectHotspots()}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${getTotalCorrectHotspots() > 0 ? (getCorrectHotspotsFound() / getTotalCorrectHotspots()) * 100 : 0}%` 
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600">
        <p>Click on the highlighted areas to find all the correct hotspots</p>
        {getTotalCorrectHotspots() > 0 && (
          <p className="mt-1">Find all {getTotalCorrectHotspots()} correct hotspot{getTotalCorrectHotspots() !== 1 ? 's' : ''} to complete the activity</p>
        )}
      </div>
    </div>
  );
}

function SequenceRenderer({ content, responses, onUpdate }: any) {
  const originalItems = content.items || [];
  const [currentOrder, setCurrentOrder] = useState(() => {
    // If there's a saved response, use it; otherwise shuffle the items
    if (responses.order && responses.order.length === originalItems.length) {
      return responses.order;
    }
    // Shuffle items for initial display
    const shuffled = [...originalItems].sort(() => Math.random() - 0.5);
    return shuffled.map((item: any) => item.id);
  });

  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const getItemById = (id: string) => originalItems.find((item: any) => item.id === id);

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    if (!draggedItem) return;

    const currentIndex = currentOrder.indexOf(draggedItem);
    if (currentIndex === -1) return;

    const newOrder = [...currentOrder];
    newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);
    
    setCurrentOrder(newOrder);
    onUpdate({ ...responses, order: newOrder });
    
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    const newOrder = [...currentOrder];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);
    setCurrentOrder(newOrder);
    onUpdate({ ...responses, order: newOrder });
  };

  const resetSequence = () => {
    const shuffled = [...originalItems].sort(() => Math.random() - 0.5);
    const newOrder = shuffled.map((item: any) => item.id);
    setCurrentOrder(newOrder);
    onUpdate({ ...responses, order: newOrder });
  };

  const checkIfCorrect = () => {
    return currentOrder.every((itemId: string, index: number) => {
      const item = getItemById(itemId);
      return item && item.order === index;
    });
  };

  const getCorrectPositions = () => {
    return currentOrder.filter((itemId: string, index: number) => {
      const item = getItemById(itemId);
      return item && item.order === index;
    }).length;
  };

  const isCorrect = checkIfCorrect();
  const correctPositions = getCorrectPositions();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-school-primary-blue mb-2">
          Sequence Activity
        </h3>
        <p className="text-gray-600">Drag the items to arrange them in the correct order</p>
      </div>

      {/* Progress Indicator */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-600">
            {correctPositions} of {originalItems.length} correct
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              isCorrect ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${(correctPositions / originalItems.length) * 100}%` }}
          ></div>
        </div>
        {isCorrect && (
          <div className="flex items-center mt-2 text-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">Perfect sequence! Ready to submit.</span>
          </div>
        )}
      </div>

      {/* Sequence Items */}
      <div className="max-w-2xl mx-auto">
        <div className="space-y-3">
          {currentOrder.map((itemId: string, index: number) => {
            const item = getItemById(itemId);
            if (!item) return null;
            
            const isInCorrectPosition = item.order === index;
            const isDragging = draggedItem === itemId;
            const isDropTarget = dragOverIndex === index;
            
            return (
              <div
                key={itemId}
                className={`relative transition-all duration-200 ${
                  isDragging ? 'opacity-50 scale-95' : ''
                } ${
                  isDropTarget ? 'transform translate-y-1' : ''
                }`}
              >
                {/* Drop zone indicator */}
                {isDropTarget && (
                  <div className="absolute -top-2 left-0 right-0 h-1 bg-blue-500 rounded-full"></div>
                )}
                
                <div
                  draggable
                  onDragStart={() => handleDragStart(itemId)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`bg-white border-2 rounded-lg p-4 shadow-sm transition-all cursor-move hover:shadow-md ${
                    isInCorrectPosition 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                        isInCorrectPosition 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.text}</div>
                        {item.description && (
                          <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                        )}
                      </div>
                      
                      {isInCorrectPosition && (
                        <CheckCircle className="w-5 h-5 text-green-500 ml-3" />
                      )}
                    </div>
                    
                    {/* Manual controls */}
                    <div className="flex flex-col gap-1 ml-4">
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          moveItem(index, Math.max(0, index - 1));
                        }}
                        disabled={index === 0}
                        size="sm"
                        variant="outline"
                        className="w-6 h-6 p-0"
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          moveItem(index, Math.min(currentOrder.length - 1, index + 1));
                        }}
                        disabled={index === currentOrder.length - 1}
                        size="sm"
                        variant="outline"
                        className="w-6 h-6 p-0"
                      >
                        ↓
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center">
        <Button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            resetSequence();
          }}
          variant="outline"
          className="flex items-center"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Shuffle Again
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600 space-y-1">
        <p>💡 <strong>How to use:</strong></p>
        <p>• Drag items up or down to reorder them</p>
        <p>• Use the ↑ ↓ buttons for precise control</p>
        <p>• Green highlighting shows correct positions</p>
        <p>• Get all items in the right order to complete the activity</p>
      </div>
    </div>
  );
}



function MatchingRenderer({ content, responses, onUpdate }: any) {
  const leftItems = content.leftItems || [];
  const rightItems = content.rightItems || [];
  const [matches, setMatches] = useState(responses.matches || {});
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ [key: string]: { message: string; isCorrect: boolean } }>({});
  const [showFeedback, setShowFeedback] = useState(false);

  const allowRetries = content.allowRetries !== false;
  const showImmediateFeedback = content.feedbackTiming === 'immediate' || content.showFeedback !== false;

  const handleDragStart = (leftItemId: string) => {
    setDraggedItem(leftItemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, rightItemId: string) => {
		e.preventDefault();
		
		if (!draggedItem) return;
		
		console.log('=== MATCHING DEBUG ===');
		console.log('Dropped item ID:', draggedItem);
		console.log('Target ID:', rightItemId);
		
		// Find the left item being dragged
		const leftItem = leftItems.find((item: any) => item.id === draggedItem);
		console.log('Left item:', leftItem);
		console.log('Left item correctMatch:', leftItem?.correctMatch);
		console.log('Are IDs equal?', leftItem?.correctMatch === rightItemId);
		console.log('Type check - correctMatch type:', typeof leftItem?.correctMatch);
		console.log('Type check - rightItemId type:', typeof rightItemId);
		
		// Check if this right item is already matched (and retries not allowed)
		if (!allowRetries && Object.values(matches).includes(rightItemId)) {
			console.log('Right item already matched and retries not allowed');
			return;
		}

		// Check if this left item is already matched (and retries not allowed)
		if (!allowRetries && matches[draggedItem]) {
			console.log('Left item already matched and retries not allowed');
			return;
		}

		const newMatches = { ...matches };
		newMatches[draggedItem] = rightItemId;
		
		setMatches(newMatches);
		onUpdate({ ...responses, matches: newMatches });

		// Show immediate feedback if enabled
		if (showImmediateFeedback) {
			// Convert both to strings for comparison to ensure type consistency
			const isCorrect = leftItem && String(leftItem.correctMatch) === String(rightItemId);
			console.log('Is correct match?', isCorrect);
			console.log('Comparison:', String(leftItem?.correctMatch), '===', String(rightItemId));
			
			const newFeedback = { ...feedback };
			newFeedback[draggedItem] = {
				message: isCorrect ? 'Correct match!' : 'Try again...',
				isCorrect: isCorrect
			};
			
			setFeedback(newFeedback);
			setShowFeedback(true);
			
			// Hide feedback after 2 seconds
			setTimeout(() => setShowFeedback(false), 2000);
		}

		setDraggedItem(null);
		console.log('======================');
	};

  const handleDirectMatch = (leftItemId: string, rightItemId: string) => {
		console.log('=== DIRECT MATCH DEBUG ===');
		console.log('Left item ID:', leftItemId);
		console.log('Right item ID:', rightItemId);
		
		// Check if this right item is already matched (and retries not allowed)
		if (!allowRetries && Object.values(matches).includes(rightItemId)) {
			return;
		}

		// Check if this left item is already matched (and retries not allowed)
		if (!allowRetries && matches[leftItemId]) {
			return;
		}

		const newMatches = { ...matches };
		newMatches[leftItemId] = rightItemId;
		
		setMatches(newMatches);
		onUpdate({ ...responses, matches: newMatches });

		// Show immediate feedback if enabled
		if (showImmediateFeedback) {
			const leftItem = leftItems.find((item: any) => item.id === leftItemId);
			console.log('Left item found:', leftItem);
			console.log('Left item correctMatch:', leftItem?.correctMatch);
			
			// Convert both to strings for comparison
			const isCorrect = leftItem && String(leftItem.correctMatch) === String(rightItemId);
			console.log('Is correct?', isCorrect);
			
			const newFeedback = { ...feedback };
			newFeedback[leftItemId] = {
				message: isCorrect ? 'Correct match!' : 'Try again...',
				isCorrect: isCorrect
			};
			
			setFeedback(newFeedback);
			setShowFeedback(true);
			
			setTimeout(() => setShowFeedback(false), 2000);
		}
		console.log('===========================');
	};

  const clearMatch = (leftItemId: string) => {
    if (!allowRetries) return;
    
    const newMatches = { ...matches };
    delete newMatches[leftItemId];
    setMatches(newMatches);
    onUpdate({ ...responses, matches: newMatches });
  };

  const getCorrectMatches = () => {
		return Object.keys(matches).filter(leftItemId => {
			const leftItem = leftItems.find((item: any) => item.id === leftItemId);
			const userMatch = matches[leftItemId];
			const isCorrect = leftItem && String(leftItem.correctMatch) === String(userMatch);
			
			console.log('Checking match for:', leftItem?.text);
			console.log('Expected:', leftItem?.correctMatch, 'Got:', userMatch);
			console.log('Match result:', isCorrect);
			
			return isCorrect;
		}).length;
	};

  const getTotalPossibleMatches = () => {
    return leftItems.filter((item: any) => item.correctMatch).length;
  };

  const isRightItemUsed = (rightItemId: string) => {
    return Object.values(matches).includes(rightItemId);
  };

  const getRightItemById = (rightItemId: string) => {
    return rightItems.find((item: any) => item.id === rightItemId);
  };

  const getLeftItemById = (leftItemId: string) => {
    return leftItems.find((item: any) => item.id === leftItemId);
  };

  const correctMatches = getCorrectMatches();
  const totalMatches = getTotalPossibleMatches();
  const isComplete = Object.keys(matches).length === leftItems.length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-school-primary-blue mb-2">
          Matching Activity
        </h3>
        <p className="text-gray-600">Drag items from the left to match them with items on the right</p>
      </div>

      {/* Progress Indicator */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-600">
            {correctMatches} of {totalMatches} correct matches
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              correctMatches === totalMatches && isComplete ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${totalMatches > 0 ? (correctMatches / totalMatches) * 100 : 0}%` }}
          ></div>
        </div>
        {correctMatches === totalMatches && isComplete && (
          <div className="flex items-center mt-2 text-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">All matches completed! Ready to submit.</span>
          </div>
        )}
      </div>

      {/* Matching Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Left Column - Items to Match */}
        <div>
          <h4 className="font-medium text-green-600 text-center mb-4">Items to Match</h4>
          <div className="space-y-3">
            {leftItems.map((item: any) => {
              const isMatched = !!matches[item.id];
              const matchedRightItem = isMatched ? getRightItemById(matches[item.id]) : null;
              const isCorrect = isMatched && item.correctMatch === matches[item.id];
              
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item.id)}
                  className={`p-4 border-2 rounded-lg cursor-move transition-all ${
                    isMatched
                      ? isCorrect
                        ? 'border-green-300 bg-green-50'
                        : 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-md'
                  } ${draggedItem === item.id ? 'opacity-50 scale-95' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.text}</div>
                      {isMatched && matchedRightItem && (
                        <div className="text-sm text-gray-600 mt-1">
                          Matched with: {matchedRightItem.text}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isMatched && (
                        <>
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          
                          {allowRetries && (
                            <Button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                clearMatch(item.id);
                              }}
                              size="sm"
                              variant="outline"
                              className="text-gray-600"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </>
                      )}
                      
                      {!isMatched && (
                        <div className="text-gray-400">
                          <Move className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column - Match Targets */}
        <div>
          <h4 className="font-medium text-purple-600 text-center mb-4">Match Targets</h4>
          <div className="space-y-3">
            {rightItems.map((item: any) => {
              const isUsed = isRightItemUsed(item.id);
              const matchingLeftItem = isUsed ? Object.keys(matches).find(leftId => matches[leftId] === item.id) : null;
              const leftItem = matchingLeftItem ? getLeftItemById(matchingLeftItem) : null;
              const isCorrectMatch = isUsed && leftItem && leftItem.correctMatch === item.id;
              
              return (
                <div
                  key={item.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, item.id)}
                  className={`p-4 border-2 rounded-lg transition-all min-h-[80px] ${
                    isUsed
                      ? isCorrectMatch
                        ? 'border-green-300 bg-green-50'
                        : 'border-red-300 bg-red-50'
                      : 'border-dashed border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.text}</div>
                      {item.description && (
                        <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                      )}
                      {isUsed && leftItem && (
                        <div className="text-sm text-gray-600 mt-2">
                          Matched with: {leftItem.text}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-3">
                      {isUsed ? (
                        isCorrectMatch ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )
                      ) : (
                        <div className="w-5 h-5 border-2 border-dashed border-gray-400 rounded"></div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile-Friendly Alternative */}
      <div className="lg:hidden">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-3">Alternative: Tap to Match</h4>
          <div className="space-y-3">
            {leftItems.filter((item: any) => !matches[item.id]).map((item: any) => (
              <div key={item.id} className="bg-white border border-gray-300 rounded-lg p-3">
                <div className="font-medium text-gray-900 mb-2">{item.text}</div>
                <div className="grid grid-cols-1 gap-2">
                  {rightItems.filter(rightItem => !isRightItemUsed(rightItem.id)).map((rightItem: any) => (
                    <Button
                      key={rightItem.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDirectMatch(item.id, rightItem.id);
                      }}
                      variant="outline"
                      size="sm"
                      className="text-left justify-start"
                    >
                      {rightItem.text}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback Display */}
      {showFeedback && showImmediateFeedback && Object.keys(feedback).length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {Object.entries(feedback).map(([leftItemId, feedbackData]) => {
            const leftItem = getLeftItemById(leftItemId);
            return (
              <div
                key={leftItemId}
                className={`p-3 rounded-lg shadow-lg max-w-xs ${
                  feedbackData.isCorrect 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}
              >
                <div className="flex items-center">
                  {feedbackData.isCorrect ? (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  <div>
                    <div className="text-sm font-medium">{feedbackData.message}</div>
                    <div className="text-xs opacity-90">{leftItem?.text}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600 space-y-1">
        <p>💡 <strong>How to match:</strong></p>
        <p>• Drag items from left to right columns</p>
        <p>• On mobile, use the "Tap to Match" section below</p>
        {allowRetries && <p>• Click ✕ to clear a match and try again</p>}
        <p>• Match all items correctly to complete the activity</p>
      </div>
    </div>
  );
}


function TimelineRenderer({ content, responses, onUpdate }: any) {
  const events = content.events || [];
  const [placedEvents, setPlacedEvents] = useState(responses.placements || {});
  const [draggedEvent, setDraggedEvent] = useState<string | null>(null);
  
  const timelineSettings = {
    startYear: content.startYear || 2000,
    endYear: content.endYear || 2030,
    timeUnit: content.timeUnit || 'year',
    showDates: content.showDates !== false,
    allowApproximate: content.allowApproximate !== false
  };

  const getUnplacedEvents = () => {
    return events.filter((event: any) => !placedEvents[event.id]);
  };

  const handleDragStart = (eventId: string) => {
    setDraggedEvent(eventId);
  };

  const handleTimelineDrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggedEvent) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    // Convert percentage to date
    const startDate = new Date(timelineSettings.startYear, 0, 1);
    const endDate = new Date(timelineSettings.endYear, 11, 31);
    const totalRange = endDate.getTime() - startDate.getTime();
    const placedDate = new Date(startDate.getTime() + (percentage / 100) * totalRange);
    
    const newPlacements = { ...placedEvents };
    newPlacements[draggedEvent] = {
      percentage,
      date: placedDate.toISOString(),
      year: placedDate.getFullYear(),
      month: placedDate.getMonth() + 1,
      day: placedDate.getDate()
    };
    
    setPlacedEvents(newPlacements);
    onUpdate({ ...responses, placements: newPlacements });
    setDraggedEvent(null);
  };

  const removeEventFromTimeline = (eventId: string) => {
    const newPlacements = { ...placedEvents };
    delete newPlacements[eventId];
    setPlacedEvents(newPlacements);
    onUpdate({ ...responses, placements: newPlacements });
  };

  const getEventAccuracy = (eventId: string) => {
    const placement = placedEvents[eventId];
    const event = events.find((e: any) => e.id === eventId);
    
    if (!placement || !event) return null;
    
    const correctDate = new Date(event.date || `${event.year}-${String(event.month || 1).padStart(2, '0')}-${String(event.day || 1).padStart(2, '0')}`);
    const placedDate = new Date(placement.date);
    
    const yearDifference = Math.abs(correctDate.getFullYear() - placedDate.getFullYear());
    const tolerance = timelineSettings.allowApproximate ? 1 : 0;
    
    return yearDifference <= tolerance;
  };

  const getCorrectPlacements = () => {
    return Object.keys(placedEvents).filter(eventId => getEventAccuracy(eventId)).length;
  };

  const getEventById = (eventId: string) => {
    return events.find((event: any) => event.id === eventId);
  };

  const correctPlacements = getCorrectPlacements();
  const totalEvents = events.length;
  const isComplete = Object.keys(placedEvents).length === totalEvents;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-school-primary-blue mb-2">
          Timeline Activity
        </h3>
        <p className="text-gray-600">Drag events to place them in the correct chronological order</p>
      </div>

      {/* Progress Indicator */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-600">
            {correctPlacements} of {totalEvents} correctly placed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              correctPlacements === totalEvents && isComplete ? 'bg-green-500' : 'bg-indigo-500'
            }`}
            style={{ width: `${totalEvents > 0 ? (correctPlacements / totalEvents) * 100 : 0}%` }}
          ></div>
        </div>
        {correctPlacements === totalEvents && isComplete && (
          <div className="flex items-center mt-2 text-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">All events placed correctly! Ready to submit.</span>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-indigo-600 text-center mb-6">
          Timeline: {timelineSettings.startYear} - {timelineSettings.endYear}
        </h4>
        
        <div 
          className="relative min-h-32 border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-400 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleTimelineDrop(e);
          }}
          onClick={handleTimelineDrop}
        >
          {/* Timeline Line */}
          <div className="absolute top-1/2 left-4 right-4 h-1 bg-gray-400 rounded transform -translate-y-1/2"></div>
          
          {/* Start and End Markers */}
          <div className="absolute top-1/2 left-4 w-3 h-3 bg-gray-600 rounded-full transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-4 w-3 h-3 bg-gray-600 rounded-full transform -translate-y-1/2"></div>
          
          {/* Year Labels */}
          {timelineSettings.showDates && (
            <>
              <div className="absolute bottom-2 left-4 text-xs text-gray-600 transform -translate-x-1/2">
                {timelineSettings.startYear}
              </div>
              <div className="absolute bottom-2 right-4 text-xs text-gray-600 transform translate-x-1/2">
                {timelineSettings.endYear}
              </div>
            </>
          )}
          
          {/* Placed Events */}
          {Object.entries(placedEvents).map(([eventId, placement]: [string, any]) => {
            const event = getEventById(eventId);
            const isCorrect = getEventAccuracy(eventId);
            
            if (!event) return null;
            
            return (
              <div
                key={eventId}
                className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{ left: `${placement.percentage}%` }}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                    isCorrect ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  
                  <div className={`mt-2 px-3 py-2 rounded-lg shadow-md min-w-max max-w-32 ${
                    isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="text-xs font-medium text-gray-900 text-center">{event.title}</div>
                    {timelineSettings.showDates && (
                      <div className="text-xs text-gray-600 text-center mt-1">
                        Placed: {new Date(placement.date).getFullYear()}
                      </div>
                    )}
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeEventFromTimeline(eventId);
                      }}
                      size="sm"
                      variant="outline"
                      className="w-full mt-2 text-xs h-6"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Drop Zone Hint */}
          {Object.keys(placedEvents).length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Drag events here to place them on the timeline</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Available Events */}
      {getUnplacedEvents().length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-indigo-600 mb-4">Events to Place</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {getUnplacedEvents().map((event: any) => (
              <div
                key={event.id}
                draggable
                onDragStart={() => handleDragStart(event.id)}
                className={`p-3 border-2 border-gray-300 rounded-lg cursor-move transition-all hover:border-indigo-400 hover:shadow-md ${
                  draggedEvent === event.id ? 'opacity-50 scale-95' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">{event.title}</div>
                    {event.description && (
                      <div className="text-xs text-gray-600 mt-1 line-clamp-2">{event.description}</div>
                    )}
                  </div>
                  <Move className="w-4 h-4 text-gray-400 ml-2 mt-0.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600 space-y-1">
        <p>💡 <strong>How to use:</strong></p>
        <p>• Drag events from the list to the timeline</p>
        <p>• Position them according to when they occurred</p>
        <p>• Click "Remove" to take an event off the timeline</p>
        {timelineSettings.allowApproximate && (
          <p>• Approximate placement is allowed (±1 year tolerance)</p>
        )}
        <p>• Green markers show correct placement, red markers need adjustment</p>
      </div>
    </div>
  );
}

function SimulationRenderer({ content, responses, onUpdate }: any) {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(responses.currentScenario || 0);
  const [variables, setVariables] = useState(() => {
    const initialVars: any = {};
    (content.variables || []).forEach((variable: any) => {
      initialVars[variable.name] = responses.variables?.[variable.name] ?? variable.initialValue;
    });
    return initialVars;
  });
  const [choiceHistory, setChoiceHistory] = useState(responses.choiceHistory || []);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const scenarios = content.scenarios || [];
  const currentScenario = scenarios[currentScenarioIndex];
  const simulationType = content.simulationType || 'scenario';

  const handleChoice = (choice: any) => {
    if (!currentScenario) return;

    // Record the choice
    const newChoice = {
      scenarioIndex: currentScenarioIndex,
      choiceId: choice.id,
      choiceText: choice.text,
      consequence: choice.consequence,
      isCorrect: choice.isCorrect,
      timestamp: new Date().toISOString()
    };

    const newChoiceHistory = [...choiceHistory, newChoice];
    setChoiceHistory(newChoiceHistory);

    // Update variables based on choice consequences
    const newVariables = { ...variables };
    if (choice.variableChanges) {
      Object.entries(choice.variableChanges).forEach(([varName, change]: [string, any]) => {
        if (newVariables[varName] !== undefined) {
          newVariables[varName] += change;
        }
      });
    }
    setVariables(newVariables);

    // Show feedback if there's a consequence
    if (choice.consequence) {
      setFeedback(choice.consequence);
      setTimeout(() => setFeedback(null), 4000);
    }

    // Check if this scenario is an endpoint
    if (currentScenario.isEndpoint) {
      setSimulationComplete(true);
    } else {
      // Move to next scenario (for now, just increment - in advanced version, use choice.nextScenario)
      const nextIndex = currentScenarioIndex + 1;
      if (nextIndex < scenarios.length) {
        setCurrentScenarioIndex(nextIndex);
      } else {
        setSimulationComplete(true);
      }
    }

    // Update responses
    onUpdate({
      ...responses,
      currentScenario: currentScenarioIndex + 1,
      variables: newVariables,
      choiceHistory: newChoiceHistory,
      completed: simulationComplete || currentScenarioIndex + 1 >= scenarios.length
    });
  };

  const resetSimulation = () => {
    setCurrentScenarioIndex(0);
    
    const initialVars: any = {};
    (content.variables || []).forEach((variable: any) => {
      initialVars[variable.name] = variable.initialValue;
    });
    setVariables(initialVars);
    
    setChoiceHistory([]);
    setSimulationComplete(false);
    setFeedback(null);
    
    onUpdate({
      currentScenario: 0,
      variables: initialVars,
      choiceHistory: [],
      completed: false
    });
  };

  const getTotalScore = () => {
    return choiceHistory.reduce((total, choice) => {
      return total + (choice.isCorrect ? (scenarios[choice.scenarioIndex]?.points || 10) : 0);
    }, 0);
  };

  const getCorrectChoices = () => {
    return choiceHistory.filter(choice => choice.isCorrect).length;
  };

  if (scenarios.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Zap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p>This simulation hasn't been configured yet.</p>
      </div>
    );
  }

  if (simulationComplete) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-school-primary-blue mb-2">
            Simulation Complete!
          </h3>
          <p className="text-gray-600">You've completed the interactive simulation.</p>
        </div>

        {/* Results Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-school-primary-blue mb-4">Results Summary</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{choiceHistory.length}</div>
              <div className="text-sm text-gray-600">Decisions Made</div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{getCorrectChoices()}</div>
              <div className="text-sm text-gray-600">Correct Choices</div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{getTotalScore()}</div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>
          </div>

          {/* Variable Final States */}
          {Object.keys(variables).length > 0 && (
            <div className="mb-6">
              <h5 className="font-medium text-gray-700 mb-3">Final Values:</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(variables).map(([name, value]) => (
                  <div key={name} className="bg-white border border-gray-200 rounded p-3 text-center">
                    <div className="font-medium text-gray-900">{String(value)}</div>
                    <div className="text-xs text-gray-600 capitalize">{name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Choice History */}
          <div className="mb-6">
            <h5 className="font-medium text-gray-700 mb-3">Decision Path:</h5>
            <div className="space-y-2">
              {choiceHistory.map((choice, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    choice.isCorrect 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">
                        Step {index + 1}: {choice.choiceText}
                      </div>
                      {choice.consequence && (
                        <div className="text-xs text-gray-600 mt-1">{choice.consequence}</div>
                      )}
                    </div>
                    {choice.isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-green-600 ml-2" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 ml-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                resetSimulation();
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-school-primary-blue mb-2">
          Interactive Simulation
        </h3>
        <p className="text-gray-600">Make decisions and see the consequences unfold</p>
      </div>

      {/* Progress and Variables */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-sm font-medium text-gray-700">Progress:</span>
            <span className="ml-2 text-sm text-gray-600">
              Scenario {currentScenarioIndex + 1} of {scenarios.length}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Score:</span>
            <span className="ml-2 text-sm text-purple-600 font-medium">{getTotalScore()} points</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentScenarioIndex + 1) / scenarios.length) * 100}%` }}
          ></div>
        </div>

        {/* Variables Display */}
        {Object.keys(variables).length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(variables).map(([name, value]) => (
              <div key={name} className="bg-white border border-gray-200 rounded p-2 text-center">
                <div className="font-medium text-gray-900">{String(value)}</div>
                <div className="text-xs text-gray-600 capitalize">{name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current Scenario */}
      {currentScenario && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-6">
            <h4 className="text-xl font-bold text-school-primary-blue mb-3">
              {currentScenario.title || `Scenario ${currentScenarioIndex + 1}`}
            </h4>
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {currentScenario.description}
            </div>
          </div>

          {/* Choices */}
          {currentScenario.choices && currentScenario.choices.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-700 mb-4">What do you choose?</h5>
              <div className="space-y-3">
                {currentScenario.choices.map((choice: any, index: number) => (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleChoice(choice);
                    }}
                    className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all group"
                  >
                    <div className="flex items-start">
                      <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 group-hover:bg-purple-200">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 group-hover:text-purple-800">
                          {choice.text}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 ml-2" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {(!currentScenario.choices || currentScenario.choices.length === 0) && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-gray-600 mb-4">This scenario is complete.</p>
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSimulationComplete(true);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Finish Simulation
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Feedback Modal */}
      {feedback && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg">
            <div className="flex items-start">
              <div className="flex-1">
                <div className="text-sm font-medium mb-1">Consequence:</div>
                <div className="text-sm">{feedback}</div>
              </div>
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setFeedback(null);
                }}
                size="sm"
                variant="outline"
                className="ml-3 text-white border-white hover:bg-white hover:text-blue-500"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Choice History (Expandable) */}
      {choiceHistory.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer">
              <span className="font-medium text-gray-700">Decision History ({choiceHistory.length})</span>
              <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
            </summary>
            
            <div className="mt-4 space-y-2">
              {choiceHistory.map((choice, index) => (
                <div
                  key={index}
                  className={`p-2 rounded border text-sm ${
                    choice.isCorrect 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center">
                    {choice.isCorrect ? (
                      <CheckCircle className="w-3 h-3 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-600 mr-2" />
                    )}
                    <span className="font-medium">Step {index + 1}:</span>
                    <span className="ml-1">{choice.choiceText}</span>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600 space-y-1">
        <p>💡 <strong>How simulations work:</strong></p>
        <p>• Read each scenario carefully</p>
        <p>• Choose the option you think is best</p>
        <p>• See the consequences of your decisions</p>
        <p>• Learn from the outcomes and continue</p>
      </div>
    </div>
  );
}

// Placeholder renderers for other interactive types

function DefaultRenderer({ type, content, responses, onUpdate }: any) {
  switch (type) {
    case 'SIMULATION':
      return <SimulationRenderer content={content} responses={responses} onUpdate={onUpdate} />;
    case 'WIDGET':
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-school-primary-blue mb-2">
              Custom Widget
            </h3>
            <p className="text-gray-600">Interactive custom component</p>
          </div>

          <div className="text-center py-12 text-gray-500">
            <Zap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>Custom widget will be implemented based on specific requirements</p>
            <p className="text-sm mt-2">This framework supports any custom interactive content</p>
            
            <div className="mt-6">
              <Button
                onClick={() => onUpdate({ ...responses, completed: true })}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Mark as Completed
              </Button>
            </div>
          </div>
        </div>
      );
    default:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-school-primary-blue mb-2">
              Interactive Content
            </h3>
            <p className="text-gray-600">Custom interactive experience</p>
          </div>

          <div className="text-center py-12 text-gray-500">
            <Zap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>{type.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())} content</p>
            <p className="text-sm mt-2">Custom interactive component implementation</p>
            
            <div className="mt-6">
              <Button
                onClick={() => onUpdate({ ...responses, completed: true })}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Mark as Completed
              </Button>
            </div>
          </div>
        </div>
      );
  }
}