"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, Award, Clock, ArrowLeft, FileText, Upload } from "lucide-react";

interface AssignmentSubmissionResultProps {
  assignment: any;
  submission: any;
  onClose: () => void;
}

export function AssignmentSubmissionResult({ assignment, submission, onClose }: AssignmentSubmissionResultProps) {
  const submissionTime = new Date(submission.submittedAt || submission.createdAt);
  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
  const isLate = submission.isLate || (dueDate && submissionTime > dueDate);

  return (
    <div className="bg-white border border-school-primary-paledogwood rounded-lg overflow-hidden">
      {/* Success Header */}
      <div className="bg-green-50 border-b border-green-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-green-800">
                Assignment Submitted Successfully!
              </h2>
              <p className="text-green-600 mt-1">
                Your submission has been received and is ready for grading.
              </p>
            </div>
          </div>
          
          <Button onClick={onClose} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assignment
          </Button>
        </div>
      </div>

      {/* Assignment Info */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-school-primary-blue mb-4">
          {assignment.title}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Award className="w-5 h-5 text-school-primary-blue mr-2" />
              <div>
                <div className="text-sm text-gray-600">Maximum Points</div>
                <div className="font-semibold text-gray-900">{assignment.maxPoints}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-school-primary-blue mr-2" />
              <div>
                <div className="text-sm text-gray-600">Submitted</div>
                <div className="font-semibold text-gray-900">
                  {submissionTime.toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-school-primary-blue mr-2" />
              <div>
                <div className="text-sm text-gray-600">Status</div>
                <div className={`font-semibold ${isLate ? 'text-orange-600' : 'text-green-600'}`}>
                  {isLate ? 'Late Submission' : 'On Time'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Details */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-school-primary-blue mb-4">
          Submission Details
        </h3>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          {submission.content && (
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <FileText className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-blue-800">Text Submission</h4>
              </div>
              <div className="bg-white border border-blue-200 rounded p-3 max-h-32 overflow-y-auto">
                <div className="text-gray-700 whitespace-pre-wrap text-sm">
                  {submission.content.length > 200 
                    ? submission.content.substring(0, 200) + '...' 
                    : submission.content
                  }
                </div>
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {submission.content.length} characters
              </div>
            </div>
          )}
          
          {submission.fileUrl && (
            <div>
              <div className="flex items-center mb-2">
                <Upload className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-blue-800">File Submission</h4>
              </div>
              <div className="bg-white border border-blue-200 rounded p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-gray-700 font-medium">
                      {submission.fileName || 'Uploaded File'}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(submission.fileUrl, '_blank')}
                  >
                    View File
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Next Steps */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-school-primary-blue mb-4">
          What's Next?
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="w-6 h-6 bg-school-primary-blue text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
              1
            </div>
            <div>
              <div className="font-medium text-gray-900">Review and Grading</div>
              <div className="text-sm text-gray-600">
                Your instructor will review your submission and provide a grade with feedback.
              </div>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="w-6 h-6 bg-school-primary-blue text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
              2
            </div>
            <div>
              <div className="font-medium text-gray-900">Receive Feedback</div>
              <div className="text-sm text-gray-600">
                You'll be notified when grading is complete and can view detailed feedback.
              </div>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
              3
            </div>
            <div>
              <div className="font-medium text-gray-900">Continue Learning</div>
              <div className="text-sm text-gray-600">
                You can continue with the next lessons while waiting for feedback.
              </div>
            </div>
          </div>
        </div>

        {isLate && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-orange-600 mr-2" />
              <div>
                <div className="font-medium text-orange-800">Late Submission Notice</div>
                <div className="text-sm text-orange-700 mt-1">
                  This assignment was submitted after the due date. Check with your instructor about any late submission policies that may apply.
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <Button 
            onClick={onClose}
            className="bg-school-primary-blue hover:bg-school-primary-blue/90 text-white px-8"
          >
            Continue Learning
          </Button>
        </div>
      </div>
    </div>
  );
}