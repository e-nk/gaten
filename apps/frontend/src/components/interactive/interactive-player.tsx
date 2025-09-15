"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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


// Placeholder renderers for other interactive types

function MatchingRenderer({ content, responses, onUpdate }: any) {
  const leftItems = content.leftItems || [];
  const rightItems = content.rightItems || [];
  const matches = responses.matches || {};

  const handleMatch = (leftItemId: string, rightItemId: string) => {
    const newMatches = { ...matches };
    newMatches[leftItemId] = rightItemId;
    onUpdate({ ...responses, matches: newMatches });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-school-primary-blue mb-2">
          Matching Activity
        </h3>
        <p className="text-gray-600">Match items from the left column to the right column</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Left Column */}
        <div className="space-y-3">
          <h4 className="font-medium text-purple-600 text-center">Items to Match</h4>
          {leftItems.map((item: any) => (
            <div
              key={item.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                matches[item.id] 
                  ? 'bg-green-50 border-green-300' 
                  : 'bg-gray-50 border-gray-300 hover:border-purple-400'
              }`}
            >
              <div className="font-medium">{item.text}</div>
              {matches[item.id] && (
                <div className="text-sm text-green-600 mt-1">
                  Matched with: {rightItems.find((ri: any) => ri.id === matches[item.id])?.text}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <h4 className="font-medium text-purple-600 text-center">Match Targets</h4>
          {rightItems.map((item: any) => {
            const isUsed = Object.values(matches).includes(item.id);
            return (
              <div
                key={item.id}
                className={`p-4 border rounded-lg transition-colors ${
                  isUsed 
                    ? 'bg-blue-50 border-blue-300' 
                    : 'bg-gray-50 border-gray-300 hover:border-purple-400 cursor-pointer'
                }`}
                onClick={() => {
                  if (!isUsed) {
                    // Find unmatched left item and match it
                    const unmatchedLeft = leftItems.find((li: any) => !matches[li.id]);
                    if (unmatchedLeft) {
                      handleMatch(unmatchedLeft.id, item.id);
                    }
                  }
                }}
              >
                <div className="font-medium">{item.text}</div>
                {isUsed && (
                  <div className="text-sm text-blue-600 mt-1">
                    ✓ Matched
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Matched: {Object.keys(matches).length} of {leftItems.length}
        </p>
      </div>
    </div>
  );
}

function TimelineRenderer({ content, responses, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-school-primary-blue mb-2">
          Timeline Activity
        </h3>
        <p className="text-gray-600">Place events on the timeline in chronological order</p>
      </div>

      <div className="text-center py-12 text-gray-500">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p>Timeline interactive component will be implemented</p>
        <p className="text-sm mt-2">This will include drag-and-drop timeline placement</p>
      </div>
    </div>
  );
}

function DefaultRenderer({ type, content, responses, onUpdate }: any) {
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