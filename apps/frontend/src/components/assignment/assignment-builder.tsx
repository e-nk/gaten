"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Upload, Calendar, FileText, Settings, X } from "lucide-react";

interface AssignmentBuilderProps {
  onSave: (assignmentData: any) => void;
  initialData?: any;
}

export function AssignmentBuilder({ onSave, initialData }: AssignmentBuilderProps) {
  const [assignmentSettings, setAssignmentSettings] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    instructions: initialData?.instructions || '',
    dueDate: initialData?.dueDate || '',
    maxPoints: initialData?.maxPoints || 100,
    allowLateSubmission: initialData?.allowLateSubmission || false,
    maxFileSize: initialData?.maxFileSize || 10,
    allowedFileTypes: initialData?.allowedFileTypes || ['pdf', 'doc', 'docx', 'txt'],
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const handleSave = (e?: React.MouseEvent) => {
		// CRITICAL: Prevent form submission
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		
		// Validation
		if (!assignmentSettings.title.trim()) {
			alert('Please enter an assignment title');
			return;
		}
		
		if (!assignmentSettings.instructions.trim()) {
			alert('Please enter assignment instructions');
			return;
		}
		
		if (assignmentSettings.allowedFileTypes.length === 0) {
			alert('Please select at least one allowed file type');
			return;
		}
		
		setSaveStatus('saving');
		
		// Simulate brief delay for better UX (same as quiz)
		setTimeout(() => {
			onSave(assignmentSettings);
			setSaveStatus('saved');
			
			// Reset to idle after 2 seconds (same as quiz)
			setTimeout(() => setSaveStatus('idle'), 2000);
		}, 300);
	};

  const updateFileTypes = (type: string, checked: boolean) => {
    setAssignmentSettings(prev => ({
      ...prev,
      allowedFileTypes: checked
        ? [...prev.allowedFileTypes, type]
        : prev.allowedFileTypes.filter(t => t !== type)
    }));
  };

  const fileTypeOptions = [
    { value: 'pdf', label: 'PDF (.pdf)' },
    { value: 'doc', label: 'Word (.doc)' },
    { value: 'docx', label: 'Word (.docx)' },
    { value: 'txt', label: 'Text (.txt)' },
    { value: 'jpg', label: 'Image (.jpg)' },
    { value: 'png', label: 'Image (.png)' },
    { value: 'zip', label: 'Archive (.zip)' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-school-primary-blue">Assignment Builder</h2>
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
            Advanced Settings
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
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Assignment'}
          </Button>
        </div>
      </div>

      {/* Basic Assignment Info */}
      <div className="bg-white border border-school-primary-paledogwood rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-school-primary-blue mb-1">
              Assignment Title *
            </label>
            <input
              type="text"
              value={assignmentSettings.title}
              onChange={(e) => {
                e.stopPropagation(); // CRITICAL: Prevent event bubbling
                setAssignmentSettings(prev => ({ ...prev, title: e.target.value }));
              }}
              onClick={(e) => e.stopPropagation()} // CRITICAL: Prevent event bubbling
              className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
              placeholder="Enter assignment title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-school-primary-blue mb-1">
              Description
            </label>
            <textarea
              value={assignmentSettings.description}
              onChange={(e) => {
                e.stopPropagation(); // CRITICAL: Prevent event bubbling
                setAssignmentSettings(prev => ({ ...prev, description: e.target.value }));
              }}
              onClick={(e) => e.stopPropagation()} // CRITICAL: Prevent event bubbling
              className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue h-20 resize-none"
              placeholder="Brief assignment description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-school-primary-blue mb-1">
              Instructions *
            </label>
            <textarea
              value={assignmentSettings.instructions}
              onChange={(e) => {
                e.stopPropagation(); // CRITICAL: Prevent event bubbling
                setAssignmentSettings(prev => ({ ...prev, instructions: e.target.value }));
              }}
              onClick={(e) => e.stopPropagation()} // CRITICAL: Prevent event bubbling
              className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue h-32 resize-none"
              placeholder="Detailed instructions for students. What should they submit? What are the requirements?"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-school-primary-blue mb-1">
                Due Date
              </label>
              <input
                type="datetime-local"
                value={assignmentSettings.dueDate}
                onChange={(e) => {
                  e.stopPropagation(); // CRITICAL: Prevent event bubbling
                  setAssignmentSettings(prev => ({ ...prev, dueDate: e.target.value }));
                }}
                onClick={(e) => e.stopPropagation()} // CRITICAL: Prevent event bubbling
                className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-school-primary-blue mb-1">
                Maximum Points
              </label>
              <input
                type="number"
                min="1"
                value={assignmentSettings.maxPoints}
                onChange={(e) => {
                  e.stopPropagation(); // CRITICAL: Prevent event bubbling
                  setAssignmentSettings(prev => ({ ...prev, maxPoints: parseInt(e.target.value) || 100 }));
                }}
                onClick={(e) => e.stopPropagation()} // CRITICAL: Prevent event bubbling
                className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      {showAdvancedSettings && (
        <div className="bg-white border border-school-primary-paledogwood rounded-lg p-6">
          <h3 className="text-lg font-semibold text-school-primary-blue mb-4">Advanced Settings</h3>
          
          <div className="space-y-6">
            {/* Submission Settings */}
            <div>
              <h4 className="font-medium text-school-primary-blue mb-3">Submission Settings</h4>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowLateSubmission"
                    checked={assignmentSettings.allowLateSubmission}
                    onChange={(e) => {
                      e.stopPropagation(); // CRITICAL: Prevent event bubbling
                      setAssignmentSettings(prev => ({ ...prev, allowLateSubmission: e.target.checked }));
                    }}
                    onClick={(e) => e.stopPropagation()} // CRITICAL: Prevent event bubbling
                    className="mr-2"
                  />
                  <label htmlFor="allowLateSubmission" className="text-sm text-school-primary-blue">
                    Allow late submissions
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-school-primary-blue mb-1">
                    Maximum File Size (MB)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={assignmentSettings.maxFileSize}
                    onChange={(e) => {
                      e.stopPropagation(); // CRITICAL: Prevent event bubbling
                      setAssignmentSettings(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) || 10 }));
                    }}
                    onClick={(e) => e.stopPropagation()} // CRITICAL: Prevent event bubbling
                    className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue max-w-xs"
                  />
                </div>
              </div>
            </div>

            {/* File Type Restrictions */}
            <div>
              <h4 className="font-medium text-school-primary-blue mb-3">Allowed File Types</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {fileTypeOptions.map((fileType) => (
                  <div key={fileType.value} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`filetype-${fileType.value}`}
                      checked={assignmentSettings.allowedFileTypes.includes(fileType.value)}
                      onChange={(e) => {
                        e.stopPropagation(); // CRITICAL: Prevent event bubbling
                        updateFileTypes(fileType.value, e.target.checked);
                      }}
                      onClick={(e) => e.stopPropagation()} // CRITICAL: Prevent event bubbling
                      className="mr-2"
                    />
                    <label htmlFor={`filetype-${fileType.value}`} className="text-sm text-gray-700">
                      {fileType.label}
                    </label>
                  </div>
                ))}
              </div>

              {assignmentSettings.allowedFileTypes.length === 0 && (
                <p className="text-sm text-red-600 mt-2">
                  Please select at least one file type.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-school-primary-blue mb-4">Preview</h3>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900">
                {assignmentSettings.title || 'Assignment Title'}
              </h4>
              {assignmentSettings.description && (
                <p className="text-gray-600 mt-1">{assignmentSettings.description}</p>
              )}
            </div>
            
            <div className="ml-4 text-right">
              <div className="text-sm text-gray-600">Points</div>
              <div className="text-lg font-bold text-school-primary-blue">
                {assignmentSettings.maxPoints}
              </div>
            </div>
          </div>

          {assignmentSettings.dueDate && (
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Due: {new Date(assignmentSettings.dueDate).toLocaleString()}</span>
            </div>
          )}

          <div className="mb-4">
            <h5 className="font-medium text-gray-900 mb-2">Instructions:</h5>
            <div className="text-gray-700 whitespace-pre-wrap">
              {assignmentSettings.instructions || 'No instructions provided yet.'}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                <span>
                  File upload (max {assignmentSettings.maxFileSize}MB)
                </span>
              </div>
              
              <div>
                Allowed: {assignmentSettings.allowedFileTypes.map(type => `.${type}`).join(', ')}
              </div>
            </div>
            
            {assignmentSettings.allowLateSubmission && (
              <div className="text-xs text-yellow-600 mt-1">
                Late submissions allowed
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}