"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Plus, X, Settings, Eye, Move, Target, List, Calendar, Zap, Globe, Upload, CirclePlus } from "lucide-react";

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
        
      default:
        // Basic content check for other types
        if (!content.description && !content.items) {
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

// Placeholder editors for other types

function SequenceEditor({ content, onUpdate }: { content: any; onUpdate: (field: string, value: any) => void }) {
  return (
    <div className="text-center py-8 text-gray-500">
      <List className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <p>Sequence editor: Define items to be arranged in order</p>
      <p className="text-sm mt-2">Will include item management and correct sequence configuration</p>
    </div>
  );
}

function MatchingEditor({ content, onUpdate }: { content: any; onUpdate: (field: string, value: any) => void }) {
  return (
    <div className="text-center py-8 text-gray-500">
      <Globe className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <p>Matching editor: Create pairs of items to match</p>
      <p className="text-sm mt-2">Will include left/right column management and correct pair configuration</p>
    </div>
  );
}

function TimelineEditor({ content, onUpdate }: { content: any; onUpdate: (field: string, value: any) => void }) {
  return (
    <div className="text-center py-8 text-gray-500">
      <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <p>Timeline editor: Create interactive timeline with events</p>
      <p className="text-sm mt-2">Will include event management, dates, and timeline configuration</p>
    </div>
  );
}

function SimulationEditor({ content, onUpdate }: { content: any; onUpdate: (field: string, value: any) => void }) {
  return (
    <div className="text-center py-8 text-gray-500">
      <Zap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <p>Simulation editor: Custom interactive simulations</p>
      <p className="text-sm mt-2">Will include custom logic, variables, and interaction configuration</p>
    </div>
  );
}