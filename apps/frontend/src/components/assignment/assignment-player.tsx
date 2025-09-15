"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  FileText, 
  Calendar, 
  Award, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  X,
  Download,
  Eye
} from "lucide-react";

interface AssignmentPlayerProps {
  assignment: any;
  submission?: any;
  onSubmit: (submissionData: { content?: string; fileUrl?: string; fileName?: string }) => void;
  isSubmitting?: boolean;
}

export function AssignmentPlayer({ assignment, submission, onSubmit, isSubmitting = false }: AssignmentPlayerProps) {
  const [submissionType, setSubmissionType] = useState<'text' | 'file'>('text');
  const [textContent, setTextContent] = useState(submission?.content || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const now = new Date();
  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
  const isOverdue = dueDate && now > dueDate;
  const canSubmit = !isOverdue || assignment.allowLateSubmission;
  const hasSubmission = !!submission;

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!dueDate) return null;
    
    const timeDiff = dueDate.getTime() - now.getTime();
    if (timeDiff <= 0) return 'Overdue';
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} day${days !== 1 ? 's' : ''} remaining`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} remaining`;
    return `${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSizeMB = assignment.maxFileSize || 10;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    // Check file type
    const allowedTypes = assignment.allowedFileTypes || [];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (allowedTypes.length > 0 && !allowedTypes.includes(fileExtension)) {
      return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      alert(validationError);
      e.target.value = ''; // Reset input
      return;
    }

    setSelectedFile(file);
  };

  const handleFileUpload = async (file: File): Promise<{ url: string; fileName: string }> => {
    return new Promise((resolve, reject) => {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({
              url: response.url,
              fileName: file.name
            });
          } catch (error) {
            reject(new Error('Invalid response from server'));
          }
        } else {
          reject(new Error('Upload failed'));
        }
        setIsUploading(false);
        setUploadProgress(0);
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
        setIsUploading(false);
        setUploadProgress(0);
      });

      // You'll need to implement this endpoint in your backend
      xhr.open('POST', 'http://localhost:4000/api/upload/assignment-file');
      xhr.send(formData);
    });
  };

  const handleSubmit = async () => {
    try {
      if (submissionType === 'text') {
        if (!textContent.trim()) {
          alert('Please enter your text submission');
          return;
        }
        onSubmit({ content: textContent });
      } else {
        if (!selectedFile) {
          alert('Please select a file to upload');
          return;
        }
        
        const { url, fileName } = await handleFileUpload(selectedFile);
        onSubmit({ fileUrl: url, fileName });
      }
      setShowSubmitConfirm(false);
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Submission failed. Please try again.');
    }
  };

  const getSubmissionStatus = () => {
    if (!submission) return null;
    
    switch (submission.status) {
      case 'SUBMITTED':
        return { text: 'Submitted', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
      case 'GRADED':
        return { text: 'Graded', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
      case 'RETURNED':
        return { text: 'Returned', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
      default:
        return { text: 'Draft', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  const status = getSubmissionStatus();

  return (
    <div className="bg-white border border-school-primary-paledogwood rounded-lg overflow-hidden">
      {/* Assignment Header */}
      <div className="bg-gray-50 p-6 border-b border-school-primary-paledogwood">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-school-primary-blue mb-2">
              {assignment.title}
            </h2>
            {assignment.description && (
              <p className="text-gray-600 mb-4">{assignment.description}</p>
            )}
            
            {/* Assignment Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <Award className="w-5 h-5 text-school-primary-blue mr-2" />
                <div>
                  <div className="text-sm text-gray-600">Points</div>
                  <div className="font-semibold">{assignment.maxPoints}</div>
                </div>
              </div>
              
              {dueDate && (
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-school-primary-blue mr-2" />
                  <div>
                    <div className="text-sm text-gray-600">Due Date</div>
                    <div className="font-semibold">{dueDate.toLocaleDateString()}</div>
                  </div>
                </div>
              )}
              
              {dueDate && (
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-school-primary-blue mr-2" />
                  <div>
                    <div className="text-sm text-gray-600">Time Remaining</div>
                    <div className={`font-semibold ${isOverdue ? 'text-red-600' : 'text-green-600'}`}>
                      {getTimeRemaining()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submission Status */}
          {status && (
            <div className={`px-3 py-2 rounded-lg ${status.bg} ${status.border} border`}>
              <div className={`text-sm font-medium ${status.color}`}>
                {status.text}
              </div>
              {submission?.submittedAt && (
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(submission.submittedAt).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Warning for overdue */}
        {isOverdue && !assignment.allowLateSubmission && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-700 text-sm">
              This assignment is overdue and late submissions are not allowed.
            </span>
          </div>
        )}

        {isOverdue && assignment.allowLateSubmission && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-yellow-700 text-sm">
              This assignment is overdue, but late submissions are allowed.
            </span>
          </div>
        )}
      </div>

      {/* Assignment Instructions */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-school-primary-blue mb-3">Instructions</h3>
        <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
          {assignment.instructions}
        </div>
      </div>

      {/* Existing Submission Display */}
      {hasSubmission && (
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-school-primary-blue mb-3">Your Submission</h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            {submission.content && (
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Text Submission:</h4>
                <div className="text-blue-700 whitespace-pre-wrap bg-white p-3 rounded border">
                  {submission.content}
                </div>
              </div>
            )}
            
            {submission.fileUrl && (
              <div>
                <h4 className="font-medium text-blue-800 mb-2">File Submission:</h4>
                <div className="flex items-center bg-white p-3 rounded border">
                  <FileText className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="flex-1">{submission.fileName || 'Submitted File'}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(submission.fileUrl, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            )}

            {submission.grade !== null && submission.grade !== undefined && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-800">Grade:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {submission.grade}/{assignment.maxPoints}
                  </span>
                </div>
              </div>
            )}

            {submission.feedback && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Instructor Feedback:</h4>
                <div className="text-blue-700 bg-white p-3 rounded border">
                  {submission.feedback}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submission Form */}
      {canSubmit && (
        <div className="p-6">
          <h3 className="text-lg font-semibold text-school-primary-blue mb-4">
            {hasSubmission ? 'Update Submission' : 'Submit Assignment'}
          </h3>

          {/* Submission Type Selector */}
          <div className="mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setSubmissionType('text')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  submissionType === 'text'
                    ? 'bg-school-primary-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Text Submission
              </button>
              <button
                onClick={() => setSubmissionType('file')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  submissionType === 'file'
                    ? 'bg-school-primary-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                File Upload
              </button>
            </div>
          </div>

          {/* Text Submission */}
          {submissionType === 'text' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-school-primary-blue mb-2">
                  Your Response
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue h-48 resize-none"
                  placeholder="Enter your assignment submission here..."
                />
              </div>
            </div>
          )}

          {/* File Upload */}
          {submissionType === 'file' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-school-primary-blue mb-2">
                  Upload File
                </label>
                
                {!selectedFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div>
                      <p className="text-gray-600 mb-2">Drop your file here or click to browse</p>
                      <p className="text-sm text-gray-500">
                        Allowed types: {assignment.allowedFileTypes?.join(', ') || 'Any'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Max size: {assignment.maxFileSize || 10}MB
                      </p>
                    </div>
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept={assignment.allowedFileTypes?.map((type: string) => `.${type}`).join(',')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-600 mr-2" />
                        <div>
                          <div className="font-medium">{selectedFile.name}</div>
                          <div className="text-sm text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => setSelectedFile(null)}
                        size="sm"
                        variant="outline"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-6 flex justify-center">
            <Button
              onClick={() => setShowSubmitConfirm(true)}
              disabled={
                isSubmitting || 
                isUploading || 
                (submissionType === 'text' && !textContent.trim()) ||
                (submissionType === 'file' && !selectedFile)
              }
              className="bg-green-600 hover:bg-green-700 text-white px-8"
            >
              {isSubmitting ? 'Submitting...' : hasSubmission ? 'Update Submission' : 'Submit Assignment'}
            </Button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-school-primary-blue mb-4">
              Confirm Submission
            </h3>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Are you sure you want to submit this assignment?
              </p>
              
              <div className="text-sm text-gray-500">
                {submissionType === 'text' && <p>• Text submission: {textContent.length} characters</p>}
                {submissionType === 'file' && selectedFile && (
                  <p>• File: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                )}
                {hasSubmission && <p>• This will replace your previous submission</p>}
                {isOverdue && assignment.allowLateSubmission && <p>• This is a late submission</p>}
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
                disabled={isSubmitting || isUploading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmitting || isUploading ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress Modal */}
      {isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-school-primary-blue mb-4">
              Uploading File...
            </h3>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-school-primary-blue h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600">
              Please don't close this window while the file is uploading.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}