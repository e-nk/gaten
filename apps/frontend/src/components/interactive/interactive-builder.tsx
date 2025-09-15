"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Plus, X, Settings, Eye, Move, Target, List, Calendar, Zap, Globe, Upload, CirclePlus, RotateCcw, AlertTriangle, Info } from "lucide-react";

interface InteractiveBuilderProps {
  onSave: (interactiveData: any) => void;
  initialData?: any;
}

export function InteractiveBuilder({ onSave, initialData }: InteractiveBuilderProps) {
  const [interactiveSettings, setInteractiveSettings] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || 'DRAG_DROP',
    maxAttempts: initialData?.maxAttempts || 1,
    passingScore: initialData?.passingScore || null,
    showFeedback: initialData?.showFeedback ?? true,
    allowReplay: initialData?.allowReplay ?? true,
    timeLimit: initialData?.timeLimit || null,
    config: initialData?.config || {},
    content: initialData?.content || {},
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const interactiveTypes = [
    { value: 'DRAG_DROP', label: 'Drag & Drop', icon: Move, description: 'Drag items to correct positions' },
    { value: 'HOTSPOT', label: 'Image Hotspots', icon: Target, description: 'Click areas on images' },
    { value: 'SEQUENCE', label: 'Sequence', icon: List, description: 'Arrange items in correct order' },
    { value: 'MATCHING', label: 'Matching', icon: Globe, description: 'Match pairs of items' },
    { value: 'TIMELINE', label: 'Timeline', icon: Calendar, description: 'Interactive timeline activity' },
    { value: 'SIMULATION', label: 'Simulation', icon: Zap, description: 'Custom interactive simulation' },
  ];

  const handleSave = (e?: React.MouseEvent) => {
    // CRITICAL: Prevent form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Validation
    if (!interactiveSettings.title.trim()) {
      alert('Please enter a title for the interactive content');
      return;
    }
    
    if (!interactiveSettings.type) {
      alert('Please select an interactive content type');
      return;
    }
    
    // Type-specific validation
    if (!validateContentByType()) {
      return;
    }
    
    setSaveStatus('saving');
    
    // Professional save feedback (no alerts)
    setTimeout(() => {
      onSave(interactiveSettings);
      setSaveStatus('saved');
      
      // Reset to idle after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 300);
  };

  const validateContentByType = (): boolean => {
  const { type, content } = interactiveSettings;
  
  switch (type) {
    case 'DRAG_DROP':
      if (!content.items || content.items.length === 0) {
        alert('Please add at least one drag and drop item');
        return false;
      }
      if (!content.targets || content.targets.length === 0) {
        alert('Please add at least one drop target');
        return false;
      }
      break;
      
    case 'HOTSPOT':
      if (!content.imageUrl) {
        alert('Please upload an image for hotspot activity');
        return false;
      }
      if (!content.hotspots || content.hotspots.length === 0) {
        alert('Please add at least one hotspot');
        return false;
      }
      break;
      
    case 'SEQUENCE':
      if (!content.items || content.items.length < 2) {
        alert('Please add at least two items to sequence');
        return false;
      }
      break;
      
    case 'MATCHING':
      if (!content.leftItems || content.leftItems.length === 0) {
        alert('Please add items to match');
        return false;
      }
      if (!content.rightItems || content.rightItems.length === 0) {
        alert('Please add target items');
        return false;
      }
      break;
      
    case 'TIMELINE':
      if (!content.events || content.events.length < 2) {
        alert('Please add at least two events to the timeline');
        return false;
      }
      // Check if all events have titles and valid dates
      const invalidEvents = content.events.filter((event: any) => 
        !event.title || !event.year || event.year < (content.startYear || 2000) || event.year > (content.endYear || 2030)
      );
      if (invalidEvents.length > 0) {
        alert('Please ensure all events have titles and valid dates within the timeline range');
        return false;
      }
      break;
      
    case 'SIMULATION':
      // Check if simulation type is selected
      if (!content.simulationType) {
        alert('Please select a simulation type');
        return false;
      }
      
      // Check if at least one scenario exists
      if (!content.scenarios || content.scenarios.length === 0) {
        alert('Please add at least one scenario to the simulation');
        return false;
      }
      
      // Check if scenarios have required fields
      const invalidScenarios = content.scenarios.filter((scenario: any) => 
        !scenario.title || !scenario.description
      );
      if (invalidScenarios.length > 0) {
        alert('Please ensure all scenarios have titles and descriptions');
        return false;
      }
      
      // Check if scenarios have choices (unless they're endpoints)
      const scenariosWithoutChoices = content.scenarios.filter((scenario: any) => 
        !scenario.isEndpoint && (!scenario.choices || scenario.choices.length === 0)
      );
      if (scenariosWithoutChoices.length > 0) {
        alert('Please add choices to all non-endpoint scenarios');
        return false;
      }
      
      // Check if choices have text
      for (let scenario of content.scenarios) {
        if (scenario.choices && scenario.choices.length > 0) {
          const invalidChoices = scenario.choices.filter((choice: any) => !choice.text);
          if (invalidChoices.length > 0) {
            alert(`Please fill in text for all choices in "${scenario.title}"`);
            return false;
          }
        }
      }
      break;
      
    default:
      // Basic content check for other types
      if (!content.description && !content.items && !content.scenarios) {
        alert('Please configure the interactive content');
        return false;
      }
  }
  
  return true;
};

  const updateContentField = (field: string, value: any) => {
    setInteractiveSettings(prev => ({
      ...prev,
      content: { ...prev.content, [field]: value }
    }));
  };

  const updateConfigField = (field: string, value: any) => {
    setInteractiveSettings(prev => ({
      ...prev,
      config: { ...prev.config, [field]: value }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-school-primary-blue">Interactive Content Builder</h2>
        <div className="flex items-center gap-2">
          <Button 
            type="button" // CRITICAL: Prevent form submission
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowAdvancedSettings(!showAdvancedSettings);
            }}
            variant="outline"
            size="sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          
          <Button 
            type="button" // CRITICAL: Prevent form submission
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
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Interactive Content'}
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white border border-school-primary-paledogwood rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-school-primary-blue mb-1">
              Content Title *
            </label>
            <input
              type="text"
              value={interactiveSettings.title}
              onChange={(e) => {
                e.stopPropagation(); // CRITICAL: Prevent event bubbling
                setInteractiveSettings(prev => ({ ...prev, title: e.target.value }));
              }}
              onClick={(e) => e.stopPropagation()} // CRITICAL: Prevent event bubbling
              className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
              placeholder="Enter interactive content title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-school-primary-blue mb-1">
              Description
            </label>
            <textarea
              value={interactiveSettings.description}
              onChange={(e) => {
                e.stopPropagation(); // CRITICAL: Prevent event bubbling
                setInteractiveSettings(prev => ({ ...prev, description: e.target.value }));
              }}
              onClick={(e) => e.stopPropagation()} // CRITICAL: Prevent event bubbling
              className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue h-20 resize-none"
              placeholder="Describe the interactive activity"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-school-primary-blue mb-3">
              Interactive Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {interactiveTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button" // CRITICAL: Prevent form submission
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setInteractiveSettings(prev => ({ 
                        ...prev, 
                        type: type.value,
                        content: {}, // Reset content when type changes
                        config: {}
                      }));
                    }}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      interactiveSettings.type === type.value
                        ? 'border-school-primary-blue bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <IconComponent className={`w-5 h-5 mr-2 ${
                        interactiveSettings.type === type.value ? 'text-school-primary-blue' : 'text-gray-500'
                      }`} />
                      <span className={`font-medium ${
                        interactiveSettings.type === type.value ? 'text-school-primary-blue' : 'text-gray-700'
                      }`}>
                        {type.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      {showAdvancedSettings && (
        <div className="bg-white border border-school-primary-paledogwood rounded-lg p-6">
          <h3 className="text-lg font-semibold text-school-primary-blue mb-4">Advanced Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-school-primary-blue mb-1">
                Max Attempts
              </label>
              <input
                type="number"
                min="1"
                value={interactiveSettings.maxAttempts}
                onChange={(e) => {
                  e.stopPropagation(); // CRITICAL: Prevent event bubbling
                  setInteractiveSettings(prev => ({ 
                    ...prev, 
                    maxAttempts: parseInt(e.target.value) || 1 
                  }));
                }}
                onClick={(e) => e.stopPropagation()} // CRITICAL: Prevent event bubbling
                className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-school-primary-blue mb-1">
                Time Limit (minutes)
              </label>
              <input
                type="number"
                min="0"
                value={interactiveSettings.timeLimit || ''}
                onChange={(e) => {
                  e.stopPropagation(); // CRITICAL: Prevent event bubbling
                  setInteractiveSettings(prev => ({ 
                    ...prev, 
                    timeLimit: e.target.value ? parseInt(e.target.value) : null 
                  }));
                }}
                onClick={(e) => e.stopPropagation()} // CRITICAL: Prevent event bubbling
                className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
                placeholder="No limit"
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
                value={interactiveSettings.passingScore || ''}
                onChange={(e) => {
                  e.stopPropagation(); // CRITICAL: Prevent event bubbling
                  setInteractiveSettings(prev => ({ 
                    ...prev, 
                    passingScore: e.target.value ? parseFloat(e.target.value) : null 
                  }));
                }}
                onClick={(e) => e.stopPropagation()} // CRITICAL: Prevent event bubbling
                className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
                placeholder="No passing score"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showFeedback"
                  checked={interactiveSettings.showFeedback}
                  onChange={(e) => {
                    e.stopPropagation(); // CRITICAL: Prevent event bubbling
                    setInteractiveSettings(prev => ({ 
                      ...prev, 
                      showFeedback: e.target.checked 
                    }));
                  }}
                  onClick={(e) => e.stopPropagation()} // CRITICAL: Prevent event bubbling
                  className="mr-2"
                />
                <label htmlFor="showFeedback" className="text-sm text-school-primary-blue">
                  Show feedback after completion
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowReplay"
                  checked={interactiveSettings.allowReplay}
                  onChange={(e) => {
                    e.stopPropagation(); // CRITICAL: Prevent event bubbling
                    setInteractiveSettings(prev => ({ 
                      ...prev, 
                      allowReplay: e.target.checked 
                    }));
                  }}
                  onClick={(e) => e.stopPropagation()} // CRITICAL: Prevent event bubbling
                  className="mr-2"
                />
                <label htmlFor="allowReplay" className="text-sm text-school-primary-blue">
                  Allow students to replay
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Type-Specific Content Builder */}
      {interactiveSettings.type && (
        <div className="bg-white border border-school-primary-paledogwood rounded-lg p-6">
          <h3 className="text-lg font-semibold text-school-primary-blue mb-4">
            Configure {interactiveTypes.find(t => t.value === interactiveSettings.type)?.label}
          </h3>
          
          <InteractiveContentEditor
            type={interactiveSettings.type}
            content={interactiveSettings.content}
            config={interactiveSettings.config}
            onContentUpdate={updateContentField}
            onConfigUpdate={updateConfigField}
          />
        </div>
      )}

      {/* Preview */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-school-primary-blue mb-4">Preview</h3>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900">
                {interactiveSettings.title || 'Interactive Content Title'}
              </h4>
              {interactiveSettings.description && (
                <p className="text-gray-600 mt-1">{interactiveSettings.description}</p>
              )}
            </div>
            
            <div className="ml-4 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              {interactiveTypes.find(t => t.value === interactiveSettings.type)?.label || 'Interactive'}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                Max Attempts: {interactiveSettings.maxAttempts}
              </div>
              {interactiveSettings.timeLimit && (
                <div>
                  Time Limit: {interactiveSettings.timeLimit}m
                </div>
              )}
              {interactiveSettings.passingScore && (
                <div>
                  Passing Score: {interactiveSettings.passingScore}%
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Type-specific content editors
function InteractiveContentEditor({ 
  type, 
  content, 
  config, 
  onContentUpdate, 
  onConfigUpdate 
}: {
  type: string;
  content: any;
  config: any;
  onContentUpdate: (field: string, value: any) => void;
  onConfigUpdate: (field: string, value: any) => void;
}) {
  switch (type) {
    case 'DRAG_DROP':
      return <DragDropEditor content={content} onUpdate={onContentUpdate} />;
    case 'HOTSPOT':
      return <HotspotEditor content={content} onUpdate={onContentUpdate} />;
    case 'SEQUENCE':
      return <SequenceEditor content={content} onUpdate={onContentUpdate} />;
    case 'MATCHING':
      return <MatchingEditor content={content} onUpdate={onContentUpdate} />;
    case 'TIMELINE':
      return <TimelineEditor content={content} onUpdate={onContentUpdate} />;
    case 'SIMULATION':
      return <SimulationEditor content={content} onUpdate={onContentUpdate} />;
    default:
      return (
        <div className="text-center py-8 text-gray-500">
          <p>Content editor for {type} will be implemented based on your specific requirements.</p>
          <p className="text-sm mt-2">This is a flexible framework that can be extended for any interactive content type.</p>
        </div>
      );
  }
}

// Individual content type editors
function DragDropEditor({ content, onUpdate }: { content: any; onUpdate: (field: string, value: any) => void }) {
  const [items, setItems] = useState(content.items || []);
  const [targets, setTargets] = useState(content.targets || []);

  const addItem = () => {
    const newItems = [...items, { id: Date.now(), text: '', correctTarget: 0 }];
    setItems(newItems);
    onUpdate('items', newItems);
  };

  const addTarget = () => {
    const newTargets = [...targets, { id: Date.now(), label: '' }];
    setTargets(newTargets);
    onUpdate('targets', newTargets);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
    onUpdate('items', newItems);
  };

  const updateTarget = (index: number, field: string, value: any) => {
    const newTargets = [...targets];
    newTargets[index] = { ...newTargets[index], [field]: value };
    setTargets(newTargets);
    onUpdate('targets', newTargets);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    onUpdate('items', newItems);
  };

  const removeTarget = (index: number) => {
    const newTargets = targets.filter((_, i) => i !== index);
    setTargets(newTargets);
    onUpdate('targets', newTargets);
  };

  return (
    <div className="space-y-6">
      {/* Drop Targets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-school-primary-blue">Drop Targets</h4>
          <Button
            type="button" // CRITICAL: Prevent form submission
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addTarget();
            }}
            size="sm"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Target
          </Button>
        </div>
        
        <div className="space-y-3">
          {targets.map((target, index) => (
            <div key={target.id} className="flex items-center gap-3">
              <input
                type="text"
                value={target.label}
                onChange={(e) => {
                  e.stopPropagation();
                  updateTarget(index, 'label', e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
                placeholder={`Target ${index + 1} label`}
              />
              <Button
                type="button" // CRITICAL: Prevent form submission
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeTarget(index);
                }}
                size="sm"
                variant="outline"
                className="text-red-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Draggable Items */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-school-primary-blue">Draggable Items</h4>
          <Button
            type="button" // CRITICAL: Prevent form submission
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addItem();
            }}
            size="sm"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Item
          </Button>
        </div>
        
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3">
              <input
                type="text"
                value={item.text}
                onChange={(e) => {
                  e.stopPropagation();
                  updateItem(index, 'text', e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
                placeholder={`Item ${index + 1} text`}
              />
              <select
                value={item.correctTarget}
                onChange={(e) => {
                  e.stopPropagation();
                  updateItem(index, 'correctTarget', parseInt(e.target.value));
                }}
                onClick={(e) => e.stopPropagation()}
                className="px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
              >
                {targets.map((target, targetIndex) => (
                  <option key={target.id} value={targetIndex}>
                    {target.label || `Target ${targetIndex + 1}`}
                  </option>
                ))}
              </select>
              <Button
                type="button" // CRITICAL: Prevent form submission
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeItem(index);
                }}
                size="sm"
                variant="outline"
                className="text-red-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {targets.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          Add drop targets first, then add items to drag.
        </div>
      )}
    </div>
  );
}


// Replace the placeholder HotspotEditor with this complete implementation:
function HotspotEditor({ content, onUpdate }: { content: any; onUpdate: (field: string, value: any) => void }) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hotspots, setHotspots] = useState(content.hotspots || []);
  const [selectedHotspot, setSelectedHotspot] = useState<number | null>(null);
  const [isAddingHotspot, setIsAddingHotspot] = useState(false);

  const imageUrl = content.imageUrl || '';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      setImageFile(file);
      handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('Image size must be less than 10MB');
      return;
    }

    console.log('Starting upload for:', file.name);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', file);

      console.log('FormData created, starting XHR...');

      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          console.log('Upload progress:', progress + '%');
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        console.log('Upload completed, status:', xhr.status);
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('Upload response:', response);
            onUpdate('imageUrl', response.url);
            onUpdate('imageWidth', response.width);
            onUpdate('imageHeight', response.height);
            console.log('Image URL updated:', response.url);
          } catch (parseError) {
            console.error('Failed to parse response:', parseError);
            throw new Error('Invalid response from server');
          }
        } else {
          console.error('Upload failed with status:', xhr.status, xhr.responseText);
          throw new Error(`Upload failed: ${xhr.status}`);
        }
        setIsUploading(false);
        setUploadProgress(0);
        setImageFile(null);
      });

      xhr.addEventListener('error', (e) => {
        console.error('XHR error:', e);
        alert('Upload failed. Please check your connection and try again.');
        setIsUploading(false);
        setUploadProgress(0);
      });

      xhr.open('POST', 'http://localhost:4000/api/upload/hotspot-image');
      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingHotspot) return;

    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newHotspot = {
      id: Date.now(),
      x: Math.round(x * 10) / 10, // Round to 1 decimal place
      y: Math.round(y * 10) / 10,
      width: 8, // Smaller default size
      height: 8,
      label: `Hotspot ${hotspots.length + 1}`,
      feedback: '',
      isCorrect: true
    };

    const newHotspots = [...hotspots, newHotspot];
    setHotspots(newHotspots);
    onUpdate('hotspots', newHotspots);
    setSelectedHotspot(hotspots.length);
    setIsAddingHotspot(false);
  };

  const updateHotspot = (index: number, field: string, value: any) => {
    const newHotspots = [...hotspots];
    newHotspots[index] = { ...newHotspots[index], [field]: value };
    setHotspots(newHotspots);
    onUpdate('hotspots', newHotspots);
  };

  const removeHotspot = (index: number) => {
    const newHotspots = hotspots.filter((_: any, i: number) => i !== index);
    setHotspots(newHotspots);
    onUpdate('hotspots', newHotspots);
    setSelectedHotspot(null);
  };

  return (
    <div className="space-y-6">
      {/* Image Upload */}
      <div>
        <h4 className="font-medium text-school-primary-blue mb-3">Upload Image</h4>
        
        {!imageUrl ? (
          <div>
            {!isUploading ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="mb-4">
                  <p className="text-gray-600 mb-2">Choose an image for the hotspot activity</p>
                  <p className="text-sm text-gray-500">Supports JPG, PNG, GIF (max 10MB)</p>
                </div>
                
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Choose file button clicked');
                    fileInputRef.current?.click();
                  }}
                  className="bg-school-primary-blue hover:bg-school-primary-blue/90 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Image File
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  onClick={(e) => e.stopPropagation()}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-8 text-center">
                <div className="w-12 h-12 bg-school-primary-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6 text-white animate-pulse" />
                </div>
                <p className="text-school-primary-blue font-medium mb-2">Uploading image...</p>
                <p className="text-sm text-gray-600 mb-4">{uploadProgress}% complete</p>
                <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                  <div 
                    className="bg-school-primary-blue h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Display with Hotspots */}
            <div className="relative border border-gray-300 rounded-lg overflow-hidden">
              <div
                className={`relative ${isAddingHotspot ? 'cursor-crosshair' : 'cursor-default'}`}
                onClick={handleImageClick}
              >
                <img 
                  src={imageUrl} 
                  alt="Hotspot activity image"
                  className="w-full h-auto max-h-96 object-contain"
                />
                
                {/* Render Hotspots with CirclePlus icons */}
                {hotspots.map((hotspot: any, index: number) => (
                  <div
                    key={hotspot.id}
                    className={`absolute transition-all cursor-pointer ${
                      selectedHotspot === index
                        ? 'text-red-500 scale-110'
                        : 'text-blue-500 hover:text-blue-600 hover:scale-105'
                    }`}
                    style={{
                      left: `${hotspot.x}%`,
                      top: `${hotspot.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHotspot(index);
                    }}
                  >
                    <CirclePlus className="w-6 h-6 drop-shadow-lg" />
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                      {index + 1}
                    </div>
                  </div>
                ))}

                {/* Adding Hotspot Overlay */}
                {isAddingHotspot && (
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-10 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-4 shadow-lg">
                      <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-school-primary-blue font-medium mb-2">Click on the image to add a hotspot</p>
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsAddingHotspot(false);
                        }}
                        size="sm"
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Image Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsAddingHotspot(true);
                  }}
                  size="sm"
                  variant="outline"
                  disabled={isAddingHotspot}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Hotspot
                </Button>
                
                <span className="text-sm text-gray-600">
                  {hotspots.length} hotspot{hotspots.length !== 1 ? 's' : ''}
                </span>
              </div>

              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onUpdate('imageUrl', '');
                  setHotspots([]);
                  onUpdate('hotspots', []);
                  setSelectedHotspot(null);
                }}
                size="sm"
                variant="outline"
                className="text-red-600"
              >
                <X className="w-4 h-4 mr-1" />
                Remove Image
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* Hotspot Configuration */}
      {hotspots.length > 0 && (
        <div>
          <h4 className="font-medium text-school-primary-blue mb-3">Configure Hotspots</h4>
          
          <div className="space-y-4">
            {hotspots.map((hotspot: any, index: number) => (
              <div
                key={hotspot.id}
                className={`p-4 border rounded-lg ${
                  selectedHotspot === index 
                    ? 'border-school-primary-blue bg-blue-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h5 className="font-medium text-gray-900">
                    Hotspot {index + 1}
                  </h5>
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeHotspot(index);
                    }}
                    size="sm"
                    variant="outline"
                    className="text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={hotspot.label}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateHotspot(index, 'label', e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
                      placeholder="Hotspot label"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`correct-${index}`}
                      checked={hotspot.isCorrect}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateHotspot(index, 'isCorrect', e.target.checked);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="mr-2"
                    />
                    <label htmlFor={`correct-${index}`} className="text-sm text-gray-700">
                      This is a correct hotspot
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Feedback
                    </label>
                    <textarea
                      value={hotspot.feedback}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateHotspot(index, 'feedback', e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue h-20 resize-none"
                      placeholder="Feedback shown when this hotspot is clicked"
                    />
                  </div>

                  {/* Position and Size Controls */}
                  <div className="md:col-span-2">
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">X (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={hotspot.x}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateHotspot(index, 'x', parseFloat(e.target.value) || 0);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Y (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={hotspot.y}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateHotspot(index, 'y', parseFloat(e.target.value) || 0);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Width (%)</label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={hotspot.width}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateHotspot(index, 'width', parseFloat(e.target.value) || 10);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Height (%)</label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={hotspot.height}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateHotspot(index, 'height', parseFloat(e.target.value) || 10);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {imageUrl && hotspots.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p>Click "Add Hotspot" to create clickable areas on your image</p>
        </div>
      )}
    </div>
  );
}


function SequenceEditor({ content, onUpdate }: { content: any; onUpdate: (field: string, value: any) => void }) {
  const [items, setItems] = useState(content.items || []);
  const [showInstructions, setShowInstructions] = useState(true);

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      text: '',
      order: items.length, // Correct order position
      description: ''
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    onUpdate('items', newItems);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
    onUpdate('items', newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_: any, i: number) => i !== index);
    // Update order values to be sequential
    const reorderedItems = newItems.map((item: any, i: number) => ({
      ...item,
      order: i
    }));
    setItems(reorderedItems);
    onUpdate('items', reorderedItems);
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    const newItems = [...items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    
    // Update order values
    const reorderedItems = newItems.map((item: any, i: number) => ({
      ...item,
      order: i
    }));
    
    setItems(reorderedItems);
    onUpdate('items', reorderedItems);
  };

  const shuffleItems = () => {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    const shuffledWithOrder = shuffled.map((item: any, i: number) => ({
      ...item,
      // Keep original order value for correct sequence
    }));
    setItems(shuffledWithOrder);
    onUpdate('items', shuffledWithOrder);
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      {showInstructions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex">
              <List className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 mb-1">How Sequence Activities Work</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Add items that students need to arrange in correct order</li>
                  <li>• The order you create them here is the correct sequence</li>
                  <li>• Students will see them shuffled and need to drag them into correct order</li>
                  <li>• You can reorder items here by using the up/down arrows</li>
                </ul>
              </div>
            </div>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowInstructions(false);
              }}
              size="sm"
              variant="outline"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Items Management */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-school-primary-blue">Sequence Items</h4>
          <div className="flex items-center gap-2">
            {items.length > 1 && (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  shuffleItems();
                }}
                size="sm"
                variant="outline"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Shuffle
              </Button>
            )}
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addItem();
              }}
              size="sm"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <List className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="mb-4">No sequence items yet</p>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addItem();
              }}
              className="bg-school-primary-blue hover:bg-school-primary-blue/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Item
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item: any, index: number) => (
              <div
                key={item.id}
                className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  {/* Order Number */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-school-primary-blue text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex flex-col mt-2 gap-1">
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
                          moveItem(index, Math.min(items.length - 1, index + 1));
                        }}
                        disabled={index === items.length - 1}
                        size="sm"
                        variant="outline"
                        className="w-6 h-6 p-0"
                      >
                        ↓
                      </Button>
                    </div>
                  </div>

                  {/* Item Content */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item Text *
                      </label>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateItem(index, 'text', e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
                        placeholder={`Item ${index + 1} text`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (Optional)
                      </label>
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateItem(index, 'description', e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
                        placeholder="Additional context or description"
                      />
                    </div>
                  </div>

                  {/* Remove Button */}
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeItem(index);
                    }}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview */}
      {items.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-school-primary-blue mb-3">Preview (Correct Order)</h4>
          <div className="space-y-2">
            {items.map((item: any, index: number) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded p-3 flex items-center"
              >
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="font-medium">{item.text}</div>
                  {item.description && (
                    <div className="text-sm text-gray-600">{item.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-3 text-xs text-gray-600">
            <p>💡 <strong>Note:</strong> Students will see these items in random order and need to arrange them like this.</p>
          </div>
        </div>
      )}

      {/* Activity Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-school-primary-blue mb-3">Activity Settings</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scoring Method
            </label>
            <select
              value={content.scoringMethod || 'partial'}
              onChange={(e) => {
                e.stopPropagation();
                onUpdate('scoringMethod', e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
            >
              <option value="partial">Partial Credit (points per correct position)</option>
              <option value="exact">All or Nothing (perfect sequence required)</option>
              <option value="adjacent">Adjacent Pairs (points for correct neighbors)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Show Feedback
            </label>
            <select
              value={content.showFeedback !== false ? 'true' : 'false'}
              onChange={(e) => {
                e.stopPropagation();
                onUpdate('showFeedback', e.target.value === 'true');
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
            >
              <option value="true">Show correct positions after submission</option>
              <option value="false">No feedback (just score)</option>
            </select>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-600">
          <p><strong>Scoring Methods:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li><strong>Partial Credit:</strong> Students get points for each item in the correct position</li>
            <li><strong>All or Nothing:</strong> Students must get the entire sequence perfect to earn points</li>
            <li><strong>Adjacent Pairs:</strong> Students get points for each pair of items in correct relative order</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function MatchingEditor({ content, onUpdate }: { content: any; onUpdate: (field: string, value: any) => void }) {
  const [leftItems, setLeftItems] = useState(content.leftItems || []);
  const [rightItems, setRightItems] = useState(content.rightItems || []);
  const [showInstructions, setShowInstructions] = useState(true);

  const addLeftItem = () => {
		const newItem = {
			id: String(Date.now()), // Ensure ID is always a string
			text: '',
			correctMatch: null
		};
		const newLeftItems = [...leftItems, newItem];
		setLeftItems(newLeftItems);
		onUpdate('leftItems', newLeftItems);
	};

	const addRightItem = () => {
		const newItem = {
			id: String(Date.now()), // Ensure ID is always a string
			text: '',
			description: ''
		};
		const newRightItems = [...rightItems, newItem];
		setRightItems(newRightItems);
		onUpdate('rightItems', newRightItems);
	};

  const updateLeftItem = (index: number, field: string, value: any) => {
    const newLeftItems = [...leftItems];
    newLeftItems[index] = { ...newLeftItems[index], [field]: value };
    setLeftItems(newLeftItems);
    onUpdate('leftItems', newLeftItems);
  };

  const updateRightItem = (index: number, field: string, value: any) => {
    const newRightItems = [...rightItems];
    newRightItems[index] = { ...newRightItems[index], [field]: value };
    setRightItems(newRightItems);
    onUpdate('rightItems', newRightItems);
  };

  const removeLeftItem = (index: number) => {
    const removedItem = leftItems[index];
    const newLeftItems = leftItems.filter((_: any, i: number) => i !== index);
    setLeftItems(newLeftItems);
    onUpdate('leftItems', newLeftItems);
  };

  const removeRightItem = (index: number) => {
    const removedItem = rightItems[index];
    const newRightItems = rightItems.filter((_: any, i: number) => i !== index);
    
    // Remove this right item from any left item's correctMatch
    const updatedLeftItems = leftItems.map((leftItem: any) => ({
      ...leftItem,
      correctMatch: leftItem.correctMatch === removedItem.id ? null : leftItem.correctMatch
    }));
    
    setRightItems(newRightItems);
    setLeftItems(updatedLeftItems);
    onUpdate('rightItems', newRightItems);
    onUpdate('leftItems', updatedLeftItems);
  };

  const getRightItemText = (rightItemId: string) => {
    const rightItem = rightItems.find((item: any) => item.id === rightItemId);
    return rightItem ? rightItem.text : 'Unknown';
  };

  const getUnmatchedLeftItems = () => {
    return leftItems.filter((item: any) => !item.correctMatch);
  };

  const getUnusedRightItems = () => {
    const usedRightIds = leftItems.map((item: any) => item.correctMatch).filter(Boolean);
    return rightItems.filter((item: any) => !usedRightIds.includes(item.id));
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      {showInstructions && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex">
              <Globe className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800 mb-1">How Matching Activities Work</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Create items for the left column (things to be matched)</li>
                  <li>• Create items for the right column (match targets)</li>
                  <li>• Set which right item each left item should match to</li>
                  <li>• Students will drag from left to right to make connections</li>
                </ul>
              </div>
            </div>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowInstructions(false);
              }}
              size="sm"
              variant="outline"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column Items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-school-primary-blue">Items to Match</h4>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addLeftItem();
              }}
              size="sm"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </div>

          {leftItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              <Globe className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="mb-3">No items to match yet</p>
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addLeftItem();
                }}
                size="sm"
                className="bg-school-primary-blue hover:bg-school-primary-blue/90 text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add First Item
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {leftItems.map((item: any, index: number) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-300 rounded-lg p-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 mr-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Item Text *
                        </label>
                        <input
                          type="text"
                          value={item.text}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateLeftItem(index, 'text', e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
                          placeholder={`Item ${index + 1}`}
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeLeftItem(index);
                        }}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correct Match *
                      </label>
                      <select
												value={item.correctMatch || ''}
												onChange={(e) => {
													e.stopPropagation();
													// Ensure we're storing the ID as a string
													const selectedValue = e.target.value;
													updateLeftItem(index, 'correctMatch', selectedValue || null);
												}}
												onClick={(e) => e.stopPropagation()}
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
											>
												<option value="">Select match target...</option>
												{rightItems.map((rightItem: any) => (
													<option key={rightItem.id} value={rightItem.id}>
														{rightItem.text || `Right Item ${rightItems.indexOf(rightItem) + 1}`}
													</option>
												))}
											</select>
                      {item.correctMatch && (
                        <div className="mt-1 text-xs text-green-600">
                          ✓ Matches: {getRightItemText(item.correctMatch)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
							</div>
          )}
        </div>

        {/* Right Column Items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-school-primary-blue">Match Targets</h4>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addRightItem();
              }}
              size="sm"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Target
            </Button>
          </div>

          {rightItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="mb-3">No match targets yet</p>
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addRightItem();
                }}
                size="sm"
                className="bg-school-primary-blue hover:bg-school-primary-blue/90 text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add First Target
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {rightItems.map((item: any, index: number) => {
                const isUsed = leftItems.some((leftItem: any) => leftItem.correctMatch === item.id);
                return (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-4 ${
                      isUsed ? 'bg-green-50 border-green-300' : 'bg-white border-gray-300'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 mr-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Target Text *
                          </label>
                          <input
                            type="text"
                            value={item.text}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateRightItem(index, 'text', e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
                            placeholder={`Target ${index + 1}`}
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeRightItem(index);
                          }}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description (Optional)
                        </label>
                        <input
                          type="text"
                          value={item.description || ''}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateRightItem(index, 'description', e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
                          placeholder="Additional context"
                        />
                      </div>

                      {isUsed && (
                        <div className="text-xs text-green-600 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Used as a match target
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Validation Warnings */}
      {(leftItems.length > 0 || rightItems.length > 0) && (
        <div className="space-y-3">
          {getUnmatchedLeftItems().length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">
                  {getUnmatchedLeftItems().length} item{getUnmatchedLeftItems().length !== 1 ? 's' : ''} need{getUnmatchedLeftItems().length === 1 ? 's' : ''} a match target assigned
                </span>
              </div>
            </div>
          )}

          {getUnusedRightItems().length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center">
                <Info className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm text-blue-800">
                  {getUnusedRightItems().length} target{getUnusedRightItems().length !== 1 ? 's' : ''} {getUnusedRightItems().length === 1 ? 'is' : 'are'} not used (will serve as distractors)
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      {leftItems.length > 0 && rightItems.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-school-primary-blue mb-3">Preview (Correct Matches)</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Items to Match</h5>
              <div className="space-y-2">
                {leftItems.map((item: any, index: number) => (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-200 rounded p-2 text-sm"
                  >
                    {item.text || `Item ${index + 1}`}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Match Targets</h5>
              <div className="space-y-2">
                {rightItems.map((item: any, index: number) => {
                  const isCorrectMatch = leftItems.some((leftItem: any) => leftItem.correctMatch === item.id);
                  return (
                    <div
                      key={item.id}
                      className={`border rounded p-2 text-sm ${
                        isCorrectMatch 
                          ? 'bg-green-100 border-green-300 text-green-800' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      {item.text || `Target ${index + 1}`}
                      {isCorrectMatch && (
                        <span className="ml-2 text-xs">✓ Correct match</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-600">
            <p>💡 <strong>Note:</strong> Students will see these shuffled and need to connect left items to the correct right targets.</p>
          </div>
        </div>
      )}

      {/* Activity Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-school-primary-blue mb-3">Matching Settings</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allow Multiple Attempts
            </label>
            <select
              value={content.allowRetries !== false ? 'true' : 'false'}
              onChange={(e) => {
                e.stopPropagation();
                onUpdate('allowRetries', e.target.value === 'true');
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
            >
              <option value="true">Allow students to retry incorrect matches</option>
              <option value="false">Lock matches once made</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Show Feedback
            </label>
            <select
              value={content.showFeedback !== false ? 'immediate' : 'none'}
              onChange={(e) => {
                e.stopPropagation();
                onUpdate('showFeedback', e.target.value !== 'none');
                onUpdate('feedbackTiming', e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
            >
              <option value="immediate">Show feedback immediately</option>
              <option value="end">Show feedback at end only</option>
              <option value="none">No feedback</option>
            </select>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-600">
          <p><strong>Settings Help:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li><strong>Multiple Attempts:</strong> Whether students can change their matches after making them</li>
            <li><strong>Immediate Feedback:</strong> Students see if matches are correct right away</li>
            <li><strong>End Feedback:</strong> Students only see results after completing all matches</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function TimelineEditor({ content, onUpdate }: { content: any; onUpdate: (field: string, value: any) => void }) {
  const [events, setEvents] = useState(content.events || []);
  const [timelineSettings, setTimelineSettings] = useState({
    startYear: content.startYear || new Date().getFullYear() - 10,
    endYear: content.endYear || new Date().getFullYear() + 10,
    timeUnit: content.timeUnit || 'year', // year, month, day
    showDates: content.showDates !== false,
    allowApproximate: content.allowApproximate !== false
  });
  const [showInstructions, setShowInstructions] = useState(true);

  const addEvent = () => {
    const newEvent = {
      id: String(Date.now()),
      title: '',
      description: '',
      date: '', // Will be in YYYY-MM-DD format
      year: timelineSettings.startYear,
      month: 1,
      day: 1
    };
    const newEvents = [...events, newEvent];
    setEvents(newEvents);
    onUpdate('events', newEvents);
  };

  const updateEvent = (index: number, field: string, value: any) => {
    const newEvents = [...events];
    newEvents[index] = { ...newEvents[index], [field]: value };
    
    // If updating date components, rebuild the date string
    if (['year', 'month', 'day'].includes(field)) {
      const event = newEvents[index];
      const year = field === 'year' ? value : event.year;
      const month = field === 'month' ? value : event.month;
      const day = field === 'day' ? value : event.day;
      newEvents[index].date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    
    setEvents(newEvents);
    onUpdate('events', newEvents);
  };

  const removeEvent = (index: number) => {
    const newEvents = events.filter((_: any, i: number) => i !== index);
    setEvents(newEvents);
    onUpdate('events', newEvents);
  };

  const updateTimelineSettings = (field: string, value: any) => {
    const newSettings = { ...timelineSettings, [field]: value };
    setTimelineSettings(newSettings);
    
    // Update all timeline settings in content
    Object.keys(newSettings).forEach(key => {
      onUpdate(key, newSettings[key as keyof typeof newSettings]);
    });
  };

  const sortEventsByDate = () => {
    const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setEvents(sortedEvents);
    onUpdate('events', sortedEvents);
  };

  const getDateFromEvent = (event: any) => {
    if (event.date) return new Date(event.date);
    return new Date(event.year || timelineSettings.startYear, (event.month || 1) - 1, event.day || 1);
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      {showInstructions && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex">
              <Calendar className="w-5 h-5 text-indigo-600 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-indigo-800 mb-1">How Timeline Activities Work</h4>
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li>• Create historical events with specific dates</li>
                  <li>• Set the timeline range (start and end years)</li>
                  <li>• Students will drag events to correct positions on the timeline</li>
                  <li>• You can allow approximate placement for more flexible scoring</li>
                </ul>
              </div>
            </div>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowInstructions(false);
              }}
              size="sm"
              variant="outline"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Timeline Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-school-primary-blue mb-4">Timeline Settings</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Year
            </label>
            <input
              type="number"
              value={timelineSettings.startYear}
              onChange={(e) => {
                e.stopPropagation();
                updateTimelineSettings('startYear', parseInt(e.target.value) || 2000);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Year
            </label>
            <input
              type="number"
              value={timelineSettings.endYear}
              onChange={(e) => {
                e.stopPropagation();
                updateTimelineSettings('endYear', parseInt(e.target.value) || 2030);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Unit
            </label>
            <select
              value={timelineSettings.timeUnit}
              onChange={(e) => {
                e.stopPropagation();
                updateTimelineSettings('timeUnit', e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
            >
              <option value="year">Year</option>
              <option value="month">Month</option>
              <option value="day">Day</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showDates"
              checked={timelineSettings.showDates}
              onChange={(e) => {
                e.stopPropagation();
                updateTimelineSettings('showDates', e.target.checked);
              }}
              onClick={(e) => e.stopPropagation()}
              className="mr-2"
            />
            <label htmlFor="showDates" className="text-sm text-gray-700">
              Show dates on timeline
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="allowApproximate"
              checked={timelineSettings.allowApproximate}
              onChange={(e) => {
                e.stopPropagation();
                updateTimelineSettings('allowApproximate', e.target.checked);
              }}
              onClick={(e) => e.stopPropagation()}
              className="mr-2"
            />
            <label htmlFor="allowApproximate" className="text-sm text-gray-700">
              Allow approximate placement (±1 year tolerance)
            </label>
          </div>
        </div>
      </div>

      {/* Events Management */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-school-primary-blue">Timeline Events</h4>
          <div className="flex items-center gap-2">
            {events.length > 1 && (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  sortEventsByDate();
                }}
                size="sm"
                variant="outline"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Sort by Date
              </Button>
            )}
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addEvent();
              }}
              size="sm"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Event
            </Button>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="mb-4">No timeline events yet</p>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addEvent();
              }}
              className="bg-school-primary-blue hover:bg-school-primary-blue/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Event
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event: any, index: number) => (
              <div
                key={event.id}
                className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Event Details */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Event Title *
                      </label>
                      <input
                        type="text"
                        value={event.title}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateEvent(index, 'title', e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
                        placeholder="Event title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={event.description || ''}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateEvent(index, 'description', e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue h-20 resize-none"
                        placeholder="Event description"
                      />
                    </div>
                  </div>

                  {/* Date Settings */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Year *
                        </label>
                        <input
                          type="number"
                          value={event.year || timelineSettings.startYear}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateEvent(index, 'year', parseInt(e.target.value) || timelineSettings.startYear);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          min={timelineSettings.startYear}
                          max={timelineSettings.endYear}
                          className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue text-sm"
                        />
                      </div>

                      {timelineSettings.timeUnit !== 'year' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Month
                          </label>
                          <select
                            value={event.month || 1}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateEvent(index, 'month', parseInt(e.target.value));
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue text-sm"
                          >
                            {Array.from({ length: 12 }, (_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {new Date(2000, i, 1).toLocaleDateString('en', { month: 'short' })}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {timelineSettings.timeUnit === 'day' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Day
                          </label>
                          <input
                            type="number"
                            value={event.day || 1}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateEvent(index, 'day', parseInt(e.target.value) || 1);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            min="1"
                            max="31"
                            className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue text-sm"
                          />
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-gray-600">
                      <strong>Date:</strong> {getDateFromEvent(event).toLocaleDateString()}
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeEvent(index);
                        }}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Remove Event
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Timeline */}
      {events.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-school-primary-blue mb-4">Preview Timeline</h4>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute top-6 left-8 right-8 h-0.5 bg-gray-400"></div>
            
            {/* Timeline Events */}
            <div className="relative min-h-24">
              {events
                .sort((a, b) => getDateFromEvent(a).getTime() - getDateFromEvent(b).getTime())
                .map((event: any, index: number) => {
                  const eventDate = getDateFromEvent(event);
                  const startDate = new Date(timelineSettings.startYear, 0, 1);
                  const endDate = new Date(timelineSettings.endYear, 11, 31);
                  const totalRange = endDate.getTime() - startDate.getTime();
                  const eventOffset = eventDate.getTime() - startDate.getTime();
                  const percentage = Math.max(0, Math.min(100, (eventOffset / totalRange) * 100));
                  
                  return (
                    <div
                      key={event.id}
                      className="absolute transform -translate-x-1/2"
                      style={{ left: `${percentage}%` }}
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full border-2 border-white shadow"></div>
                        <div className="mt-2 bg-white border border-gray-300 rounded px-2 py-1 shadow-sm min-w-max">
                          <div className="text-xs font-medium text-gray-900">{event.title}</div>
                          {timelineSettings.showDates && (
                            <div className="text-xs text-gray-600">{eventDate.getFullYear()}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            
            {/* Timeline Labels */}
            {timelineSettings.showDates && (
              <div className="flex justify-between mt-8 text-xs text-gray-600">
                <span>{timelineSettings.startYear}</span>
                <span>{timelineSettings.endYear}</span>
              </div>
            )}
          </div>

          <div className="mt-4 text-xs text-gray-600">
            <p>💡 <strong>Note:</strong> Students will see these events in random order and need to place them correctly on the timeline.</p>
          </div>
        </div>
      )}
    </div>
  );
}



function SimulationEditor({ content, onUpdate }: { content: any; onUpdate: (field: string, value: any) => void }) {
  const [simulationType, setSimulationType] = useState(content.simulationType || 'scenario');
  const [scenarios, setScenarios] = useState(content.scenarios || []);
  const [variables, setVariables] = useState(content.variables || []);
  const [showInstructions, setShowInstructions] = useState(true);

  const simulationTypes = [
    { value: 'scenario', label: 'Decision Tree', description: 'Branching scenarios with choices' },
    { value: 'calculation', label: 'Interactive Calculator', description: 'Math/physics simulations' },
    { value: 'experiment', label: 'Virtual Experiment', description: 'Scientific simulations' },
    { value: 'business', label: 'Business Simulation', description: 'Economic/management scenarios' },
    { value: 'custom', label: 'Custom Logic', description: 'Advanced custom interactions' }
  ];

  const addScenario = () => {
    const newScenario = {
      id: String(Date.now()),
      title: '',
      description: '',
      choices: [],
      outcome: '',
      isEndpoint: false,
      nextScenario: null,
      points: 0
    };
    const newScenarios = [...scenarios, newScenario];
    setScenarios(newScenarios);
    onUpdate('scenarios', newScenarios);
  };

  const addVariable = () => {
    const newVariable = {
      id: String(Date.now()),
      name: '',
      type: 'number', // number, text, boolean
      initialValue: 0,
      min: 0,
      max: 100,
      description: ''
    };
    const newVariables = [...variables, newVariable];
    setVariables(newVariables);
    onUpdate('variables', newVariables);
  };

  const updateScenario = (index: number, field: string, value: any) => {
    const newScenarios = [...scenarios];
    newScenarios[index] = { ...newScenarios[index], [field]: value };
    setScenarios(newScenarios);
    onUpdate('scenarios', newScenarios);
  };

  const updateVariable = (index: number, field: string, value: any) => {
    const newVariables = [...variables];
    newVariables[index] = { ...newVariables[index], [field]: value };
    setVariables(newVariables);
    onUpdate('variables', newVariables);
  };

  const addChoice = (scenarioIndex: number) => {
    const newChoice = {
      id: String(Date.now()),
      text: '',
      consequence: '',
      variableChanges: {},
      nextScenario: null,
      isCorrect: false
    };
    
    const newScenarios = [...scenarios];
    if (!newScenarios[scenarioIndex].choices) {
      newScenarios[scenarioIndex].choices = [];
    }
    newScenarios[scenarioIndex].choices.push(newChoice);
    setScenarios(newScenarios);
    onUpdate('scenarios', newScenarios);
  };

  const updateChoice = (scenarioIndex: number, choiceIndex: number, field: string, value: any) => {
    const newScenarios = [...scenarios];
    newScenarios[scenarioIndex].choices[choiceIndex] = {
      ...newScenarios[scenarioIndex].choices[choiceIndex],
      [field]: value
    };
    setScenarios(newScenarios);
    onUpdate('scenarios', newScenarios);
  };

  const removeChoice = (scenarioIndex: number, choiceIndex: number) => {
    const newScenarios = [...scenarios];
    newScenarios[scenarioIndex].choices.splice(choiceIndex, 1);
    setScenarios(newScenarios);
    onUpdate('scenarios', newScenarios);
  };

  const removeScenario = (index: number) => {
    const newScenarios = scenarios.filter((_: any, i: number) => i !== index);
    setScenarios(newScenarios);
    onUpdate('scenarios', newScenarios);
  };

  const removeVariable = (index: number) => {
    const newVariables = variables.filter((_: any, i: number) => i !== index);
    setVariables(newVariables);
    onUpdate('variables', newVariables);
  };

  const handleSimulationTypeChange = (newType: string) => {
    setSimulationType(newType);
    onUpdate('simulationType', newType);
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      {showInstructions && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex">
              <Zap className="w-5 h-5 text-purple-600 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-purple-800 mb-1">How Simulations Work</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Choose a simulation type that fits your learning objectives</li>
                  <li>• Set up variables to track student progress and outcomes</li>
                  <li>• Create scenarios with branching choices and consequences</li>
                  <li>• Students interact with realistic situations and see results</li>
                </ul>
              </div>
            </div>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowInstructions(false);
              }}
              size="sm"
              variant="outline"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Simulation Type Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-school-primary-blue mb-4">Simulation Type</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {simulationTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSimulationTypeChange(type.value);
              }}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                simulationType === type.value
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center mb-2">
                <Zap className={`w-5 h-5 mr-2 ${
                  simulationType === type.value ? 'text-purple-600' : 'text-gray-500'
                }`} />
                <span className={`font-medium ${
                  simulationType === type.value ? 'text-purple-800' : 'text-gray-700'
                }`}>
                  {type.label}
                </span>
              </div>
              <p className="text-xs text-gray-600">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Variables Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-school-primary-blue">Simulation Variables</h4>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addVariable();
            }}
            size="sm"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Variable
          </Button>
        </div>

        {variables.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Settings className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="mb-3">No variables defined</p>
            <p className="text-sm text-gray-600 mb-4">Variables track values like score, health, budget, etc.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {variables.map((variable: any, index: number) => (
              <div key={variable.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Variable Name
                    </label>
                    <input
                      type="text"
                      value={variable.name}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateVariable(index, 'name', e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="e.g., score, health"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={variable.type}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateVariable(index, 'type', e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="number">Number</option>
                      <option value="text">Text</option>
                      <option value="boolean">True/False</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Initial Value
                    </label>
                    <input
                      type={variable.type === 'number' ? 'number' : 'text'}
                      value={variable.initialValue}
                      onChange={(e) => {
                        e.stopPropagation();
                        const value = variable.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
                        updateVariable(index, 'initialValue', value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeVariable(index);
                      }}
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scenarios Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-school-primary-blue">Simulation Scenarios</h4>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addScenario();
            }}
            size="sm"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Scenario
          </Button>
        </div>

        {scenarios.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Zap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="mb-4">No scenarios created yet</p>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addScenario();
              }}
              className="bg-school-primary-blue hover:bg-school-primary-blue/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Scenario
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {scenarios.map((scenario: any, scenarioIndex: number) => (
              <div key={scenario.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <h5 className="font-medium text-gray-900">Scenario {scenarioIndex + 1}</h5>
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeScenario(scenarioIndex);
                    }}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scenario Title
                    </label>
                    <input
                      type="text"
                      value={scenario.title}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateScenario(scenarioIndex, 'title', e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
                      placeholder="Scenario title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Points Awarded
                    </label>
                    <input
                      type="number"
                      value={scenario.points || 0}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateScenario(scenarioIndex, 'points', parseInt(e.target.value) || 0);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scenario Description
                  </label>
                  <textarea
                    value={scenario.description}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateScenario(scenarioIndex, 'description', e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue h-20 resize-none"
                    placeholder="Describe the situation or problem..."
                  />
                </div>

                {/* Choices */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Choices ({scenario.choices?.length || 0})
                    </label>
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addChoice(scenarioIndex);
                      }}
                      size="sm"
                      variant="outline"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Choice
                    </Button>
                  </div>

                  {scenario.choices && scenario.choices.length > 0 ? (
                    <div className="space-y-2">
                      {scenario.choices.map((choice: any, choiceIndex: number) => (
                        <div key={choice.id} className="bg-white border border-gray-200 rounded p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 mr-3">
                              <input
                                type="text"
                                value={choice.text}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  updateChoice(scenarioIndex, choiceIndex, 'text', e.target.value);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder={`Choice ${choiceIndex + 1} text`}
                              />
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`correct-${scenarioIndex}-${choiceIndex}`}
                                  checked={choice.isCorrect || false}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    updateChoice(scenarioIndex, choiceIndex, 'isCorrect', e.target.checked);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="mr-1"
                                />
                                <label htmlFor={`correct-${scenarioIndex}-${choiceIndex}`} className="text-xs text-gray-600">
                                  Correct
                                </label>
                              </div>
                              
                              <Button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeChoice(scenarioIndex, choiceIndex);
                                }}
                                size="sm"
                                variant="outline"
                                className="text-red-600 p-1"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <input
                            type="text"
                            value={choice.consequence || ''}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateChoice(scenarioIndex, choiceIndex, 'consequence', e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            placeholder="What happens after this choice..."
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No choices added yet. Add choices for students to select from.
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`endpoint-${scenarioIndex}`}
                    checked={scenario.isEndpoint || false}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateScenario(scenarioIndex, 'isEndpoint', e.target.checked);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="mr-2"
                  />
                  <label htmlFor={`endpoint-${scenarioIndex}`} className="text-sm text-gray-700">
                    This is an ending scenario (no further choices)
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview */}
      {scenarios.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-school-primary-blue mb-3">Simulation Preview</h4>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Zap className="w-5 h-5 text-purple-600 mr-2" />
                <span className="font-medium text-gray-900">
                  {simulationTypes.find(t => t.value === simulationType)?.label}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {scenarios.length} scenario{scenarios.length !== 1 ? 's' : ''} • {variables.length} variable{variables.length !== 1 ? 's' : ''}
              </div>
            </div>

            {variables.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Variables:</h5>
                <div className="flex flex-wrap gap-2">
                  {variables.map((variable: any) => (
                    <span key={variable.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {variable.name}: {variable.initialValue}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              {scenarios.slice(0, 3).map((scenario: any, index: number) => (
                <div key={scenario.id} className="border border-gray-200 rounded p-3">
                  <div className="font-medium text-sm text-gray-900">{scenario.title || `Scenario ${index + 1}`}</div>
                  <div className="text-xs text-gray-600 mt-1">{scenario.choices?.length || 0} choices available</div>
                </div>
              ))}
              {scenarios.length > 3 && (
                <div className="text-center text-sm text-gray-500">
                  +{scenarios.length - 3} more scenarios...
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-600">
            <p>💡 <strong>Note:</strong> Students will progress through scenarios based on their choices and see how variables change.</p>
          </div>
        </div>
      )}
    </div>
  );
}



// Placeholder editors for other types