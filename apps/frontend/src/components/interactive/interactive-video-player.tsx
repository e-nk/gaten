"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RotateCcw,
  CheckCircle,
  XCircle,
  Target,
  FileText,
  GitBranch,
  AlertCircle
} from "lucide-react";

interface InteractiveVideoPlayerProps {
  interactiveContent: any;
  responses?: any;
  onUpdate: (responses: any) => void;
  onComplete?: () => void;
}

export function InteractiveVideoPlayer({ 
  interactiveContent, 
  responses = {}, 
  onUpdate,
  onComplete 
}: InteractiveVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [activeInteraction, setActiveInteraction] = useState<any>(null);
  const [completedInteractions, setCompletedInteractions] = useState<string[]>(responses.completedInteractions || []);
  const [interactionResponses, setInteractionResponses] = useState(responses.interactionResponses || {});
  const [showInteractionModal, setShowInteractionModal] = useState(false);

  const videoUrl = interactiveContent.videoUrl;
  const interactions = interactiveContent.interactions || [];

  // Update responses when state changes
  useEffect(() => {
    onUpdate({
      ...responses,
      completedInteractions,
      interactionResponses,
      currentTime,
      watchedDuration: Math.max(responses.watchedDuration || 0, currentTime)
    });
  }, [completedInteractions, interactionResponses, currentTime]);

  // Check for interactions at current time
  useEffect(() => {
    if (!isPlaying) return;

    const currentInteractions = interactions.filter((interaction: any) => {
      return Math.abs(interaction.timestamp - currentTime) <= 1 && 
             !completedInteractions.includes(interaction.id);
    });

    if (currentInteractions.length > 0 && !activeInteraction) {
      const interaction = currentInteractions[0];
      
      // Pause video for required interactions
      if (interaction.required && videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      
      setActiveInteraction(interaction);
      setShowInteractionModal(true);
    }
  }, [currentTime, isPlaying, interactions, completedInteractions, activeInteraction]);

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInteractionComplete = (interactionId: string, response?: any) => {
    setCompletedInteractions(prev => [...prev, interactionId]);
    
    if (response) {
      setInteractionResponses(prev => ({
        ...prev,
        [interactionId]: response
      }));
    }
    
    setActiveInteraction(null);
    setShowInteractionModal(false);
    
    // Resume video if it was paused
    if (videoRef.current && !videoRef.current.ended) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleInteractionSkip = () => {
    setActiveInteraction(null);
    setShowInteractionModal(false);
    
    // Resume video
    if (videoRef.current && !videoRef.current.ended) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const getInteractionProgress = () => {
    const required = interactions.filter((i: any) => i.required).length;
    const completed = completedInteractions.filter(id => {
      const interaction = interactions.find((i: any) => i.id === id);
      return interaction?.required;
    }).length;
    
    return { completed, total: required };
  };

  const getCorrectInteractions = () => {
    return Object.entries(interactionResponses).filter(([id, response]: [string, any]) => {
      const interaction = interactions.find((i: any) => i.id === id);
      if (interaction?.type === 'quiz') {
        return response.selectedAnswer === interaction.data.correctAnswer;
      }
      return true; // For non-quiz interactions, consider them correct if completed
    }).length;
  };

  const progress = getInteractionProgress();
  const correctCount = getCorrectInteractions();

  if (!videoUrl) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Play className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p>No video configured for this interactive lesson.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Progress Header */}
      <div className="bg-purple-50 border-b border-purple-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-purple-800">
              {interactiveContent.title}
            </h3>
            <p className="text-purple-600 text-sm">Interactive Video Experience</p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-purple-700 mb-1">
              Progress: {progress.completed}/{progress.total} required interactions
            </div>
            <div className="text-sm text-purple-600">
              Correct: {correctCount}/{completedInteractions.length}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-purple-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="relative bg-black">
        <video
          ref={videoRef}
          className="w-full h-auto"
          onTimeUpdate={handleVideoTimeUpdate}
          onLoadedMetadata={handleVideoLoadedMetadata}
          onEnded={() => {
            setIsPlaying(false);
            if (progress.completed === progress.total) {
              onComplete?.();
            }
          }}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          Your browser does not support the video tag.
        </video>
        
        {/* Video Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          {/* Timeline */}
          <div className="relative mb-3">
            <div className="w-full bg-gray-600 rounded-full h-1 cursor-pointer"
                 onClick={(e) => {
                   const rect = e.currentTarget.getBoundingClientRect();
                   const clickX = e.clientX - rect.left;
                   const newTime = (clickX / rect.width) * duration;
                   seekTo(newTime);
                 }}>
              <div 
                className="bg-purple-500 h-1 rounded-full transition-all"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              ></div>
            </div>
            
            {/* Interaction Markers */}
            {interactions.map((interaction: any) => (
              <div
                key={interaction.id}
                className={`absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
                  completedInteractions.includes(interaction.id)
                    ? 'bg-green-400'
                    : interaction.required
                    ? 'bg-yellow-400'
                    : 'bg-blue-400'
                }`}
                style={{ 
                  left: `${(interaction.timestamp / duration) * 100}%`,
                  top: '50%'
                }}
                onClick={() => seekTo(interaction.timestamp)}
                title={`${interaction.type} at ${formatTime(interaction.timestamp)}`}
              />
            ))}
          </div>
          
          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                onClick={togglePlayPause}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={toggleMute}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-white text-sm">
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
              
              <Button
                onClick={() => videoRef.current?.requestFullscreen()}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Interaction Modal */}
      {showInteractionModal && activeInteraction && (
        <InteractionModal
          interaction={activeInteraction}
          onComplete={handleInteractionComplete}
          onSkip={activeInteraction.required ? undefined : handleInteractionSkip}
          existingResponse={interactionResponses[activeInteraction.id]}
        />
      )}

      {/* Interactions Summary */}
      {interactions.length > 0 && (
        <div className="p-4 bg-gray-50 border-t">
          <h4 className="font-medium text-gray-700 mb-3">Interactive Elements</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {interactions.map((interaction: any) => {
              const isCompleted = completedInteractions.includes(interaction.id);
              const response = interactionResponses[interaction.id];
              const isCorrect = interaction.type === 'quiz' ? 
                response?.selectedAnswer === interaction.data.correctAnswer : 
                isCompleted;
              
              return (
                <div
                  key={interaction.id}
                  className={`p-2 rounded border text-xs cursor-pointer transition-colors ${
                    isCompleted
                      ? isCorrect
                        ? 'border-green-300 bg-green-50 text-green-800'
                        : 'border-red-300 bg-red-50 text-red-800'
                      : interaction.required
                      ? 'border-yellow-300 bg-yellow-50 text-yellow-800'
                      : 'border-blue-300 bg-blue-50 text-blue-800'
                  }`}
                  onClick={() => seekTo(interaction.timestamp)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">{interaction.type}</span>
                    <div className="flex items-center">
                      {isCompleted && (
                        isCorrect ? 
                          <CheckCircle className="w-3 h-3" /> : 
                          <XCircle className="w-3 h-3" />
                      )}
                      <span className="ml-1">{formatTime(interaction.timestamp)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Individual Interaction Modal Component
function InteractionModal({ 
  interaction, 
  onComplete, 
  onSkip, 
  existingResponse 
}: {
  interaction: any;
  onComplete: (id: string, response?: any) => void;
  onSkip?: () => void;
  existingResponse?: any;
}) {
  const [response, setResponse] = useState(existingResponse || {});

  const getInteractionIcon = () => {
    switch (interaction.type) {
      case 'quiz': return <CheckCircle className="w-6 h-6 text-blue-600" />;
      case 'note': return <FileText className="w-6 h-6 text-green-600" />;
      case 'choice': return <GitBranch className="w-6 h-6 text-purple-600" />;
      case 'hotspot': return <Target className="w-6 h-6 text-orange-600" />;
      case 'pause': return <AlertCircle className="w-6 h-6 text-red-600" />;
      default: return <CheckCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const handleSubmit = () => {
    onComplete(interaction.id, response);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-96 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center mb-4">
            {getInteractionIcon()}
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                {interaction.type} Interaction
              </h3>
              <p className="text-sm text-gray-600">
                At {Math.floor(interaction.timestamp / 60)}:{(interaction.timestamp % 60).toString().padStart(2, '0')}
              </p>
            </div>
          </div>

          {/* Content based on interaction type */}
          <InteractionContent 
            interaction={interaction}
            response={response}
            onResponseChange={setResponse}
          />

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            {onSkip && (
              <Button
                onClick={onSkip}
                variant="outline"
              >
                Skip
              </Button>
            )}
            
            <Button
              onClick={handleSubmit}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={interaction.type === 'quiz' && response.selectedAnswer === undefined}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Content for different interaction types
function InteractionContent({ interaction, response, onResponseChange }: any) {
  switch (interaction.type) {
    case 'quiz':
      return (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            {interaction.data.question}
          </h4>
          <div className="space-y-2">
            {interaction.data.options.map((option: string, index: number) => (
              <label key={index} className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="quiz-option"
                  value={index}
                  checked={response.selectedAnswer === index}
                  onChange={() => onResponseChange({ selectedAnswer: index })}
                  className="mr-3"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case 'note':
      return (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">
            {interaction.data.title}
          </h4>
          <div className="text-gray-700 whitespace-pre-wrap">
            {interaction.data.content}
          </div>
        </div>
      );

    case 'pause':
      return (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">
            Take a moment to reflect
          </h4>
          <div className="text-gray-700">
            {interaction.data.message || 'Pause and think about what you\'ve learned so far.'}
          </div>
        </div>
      );

    default:
      return (
        <div className="text-center py-4 text-gray-500">
          <p>Interactive element: {interaction.type}</p>
        </div>
      );
  }
}