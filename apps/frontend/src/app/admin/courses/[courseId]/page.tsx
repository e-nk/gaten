"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navigation/navbar";
import { AdminGuard } from "@/components/auth/admin-guard";
import { VideoUpload } from "@/components/upload/video-upload";
import { QuizBuilder } from "@/components/quiz/quiz-builder";
import { AssignmentBuilder } from "@/components/assignment/assignment-builder";
import { InteractiveBuilder } from "@/components/interactive/interactive-builder";
import ReactPlayer from 'react-player';
import { trpc } from "@/trpc/provider";
import { useSession } from "next-auth/react";
import { 
  ArrowLeft, 
  Plus, 
  BookOpen, 
  Play, 
  FileText, 
  PenTool, 
  HelpCircle,
  Edit,
  Trash2,
  GripVertical,
	CheckCircle
} from "lucide-react";

function CourseContentPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const courseId = params.courseId as string;

	const [quizBuilderReady, setQuizBuilderReady] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState<string | null>(null);
  const [moduleFormData, setModuleFormData] = useState({
    title: '',
    description: '',
  });
  const [lessonFormData, setLessonFormData] = useState({
		title: '',
		description: '',
		type: 'TEXT' as const,
		content: '',
		estimatedDuration: 0,
		videoUrl: '',
		videoDuration: 0,
		quizData: null as any,
		assignmentData: null as any,
		interactiveData: null as any,
	});
  // tRPC queries
  const { data: course } = trpc.getAdminCourses.useQuery(
    {
      creatorId: session?.user?.id || '',
      userRole: session?.user?.role || '',
    },
    {
      enabled: !!session?.user?.id,
      select: (courses) => courses.find(c => c.id === courseId),
    }
  );

  const { data: modules, refetch: refetchModules } = trpc.getCourseModules.useQuery(
    { courseId },
    { enabled: !!courseId }
  );

  // tRPC mutations
  const createModuleMutation = trpc.createModule.useMutation({
    onSuccess: () => {
      refetchModules();
      setShowModuleForm(false);
      setModuleFormData({ title: '', description: '' });
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const createLessonMutation = trpc.createLesson.useMutation({
		onSuccess: async (createdLesson) => {
			console.log('=== LESSON CREATION SUCCESS ===');
			console.log('Created lesson:', createdLesson);
			
			// Handle quiz creation
			if (lessonFormData.type === 'QUIZ' && lessonFormData.quizData) {
				try {
					await createQuizMutation.mutateAsync({
						...lessonFormData.quizData,
						lessonId: createdLesson.id,
						creatorId: session?.user?.id || '',
						userRole: session?.user?.role || '',
					});
				} catch (error) {
					console.error('Quiz creation failed:', error);
					alert('Lesson created but quiz creation failed.');
				}
			}
			
			// Handle assignment creation
			if (lessonFormData.type === 'ASSIGNMENT' && lessonFormData.assignmentData) {
				try {
					await createAssignmentMutation.mutateAsync({
						...lessonFormData.assignmentData,
						lessonId: createdLesson.id,
						creatorId: session?.user?.id || '',
						userRole: session?.user?.role || '',
					});
				} catch (error) {
					console.error('Assignment creation failed:', error);
					alert('Lesson created but assignment creation failed.');
				}
			}

			// Handle interactive content creation
    if (lessonFormData.type === 'INTERACTIVE' && lessonFormData.interactiveData) {
      try {
        await createInteractiveMutation.mutateAsync({
          ...lessonFormData.interactiveData,
          lessonId: createdLesson.id,
          creatorId: session?.user?.id || '',
          userRole: session?.user?.role || '',
        });
      } catch (error) {
        console.error('Interactive content creation failed:', error);
        alert('Lesson created but interactive content creation failed.');
      }
    }    
			
			refetchModules();
			setShowLessonForm(null);
			setLessonFormData({ 
				title: '', 
				description: '', 
				type: 'TEXT', 
				content: '', 
				estimatedDuration: 0, 
				videoUrl: '', 
				videoDuration: 0,
				quizData: null,
				assignmentData: null,
				interactiveData: null,
			});
		}
	});

	const createQuizMutation = trpc.createQuiz.useMutation();
	const createAssignmentMutation = trpc.createAssignment.useMutation();
	const createInteractiveMutation = trpc.createInteractiveContent.useMutation();




  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !session?.user?.role) return;

    const nextOrder = modules ? modules.length : 0;

    createModuleMutation.mutate({
      ...moduleFormData,
      courseId,
      order: nextOrder,
      creatorId: session.user.id,
      userRole: session.user.role,
    });
  };

const handleCreateLesson = (e: React.FormEvent) => {
		e.preventDefault();
		if (!session?.user?.id || !session?.user?.role || !showLessonForm) return;

		const module = modules?.find(m => m.id === showLessonForm);
		const nextOrder = module ? module.lessons.length : 0;

		// Prepare lesson data with video information
		const lessonData: any = {
			title: lessonFormData.title,
			description: lessonFormData.description,
			type: lessonFormData.type,
			moduleId: showLessonForm,
			order: nextOrder,
			estimatedDuration: lessonFormData.estimatedDuration,
			creatorId: session.user.id,
			userRole: session.user.role,
		};

		// Add content based on lesson type
		if (lessonFormData.type === 'TEXT') {
			lessonData.content = lessonFormData.content;
		} else if (lessonFormData.type === 'VIDEO') {
			lessonData.videoUrl = lessonFormData.videoUrl;
			lessonData.videoDuration = lessonFormData.videoDuration;
		}
		
		else if (lessonFormData.type === 'ASSIGNMENT') {
				if (!lessonFormData.assignmentData) {
				alert('Please configure the assignment before creating the lesson.');
				return;
			}
			
			if (!lessonFormData.assignmentData.title || !lessonFormData.assignmentData.instructions) {
				alert('Please fill in all required assignment fields (title and instructions).');
				return;
			}
			
			if (lessonFormData.assignmentData.allowedFileTypes.length === 0) {
				alert('Please select at least one allowed file type for the assignment.');
				return;
			}
		}

		else if (lessonFormData.type === 'INTERACTIVE') {
				if (!lessonFormData.interactiveData) {
				alert('Please configure the interactive content before creating the lesson.');
				return;
			}
			
			if (!lessonFormData.interactiveData.title || !lessonFormData.interactiveData.type) {
				alert('Please fill in all required interactive content fields (title and type).');
				return;
			}
		}

		else if (lessonFormData.type === 'QUIZ') {
			if (!lessonFormData.quizData || !lessonFormData.quizData.questions || lessonFormData.quizData.questions.length === 0) {
      alert('Please add at least one question to the quiz before creating the lesson.');
      return;
    }
    
    if (!lessonFormData.quizData.title) {
      alert('Please enter a quiz title.');
      return;
    }

		 console.log('Data being sent to backend:', lessonData);
  	createLessonMutation.mutate(lessonData);
  }

		console.log('=== LESSON FORM DATA DEBUG ===');
		console.log('Form State:', lessonFormData);
		console.log('Quiz Data:', lessonFormData.quizData);
		console.log('Data being sent to backend:', lessonData);
		console.log('Quiz Questions:', lessonFormData.quizData?.questions || 'No questions');
		console.log('Assignment Data:', lessonFormData.assignmentData);
		console.log('Interactive Data:', lessonFormData.interactiveData);
  	console.log('================================');
		console.log('Video URL in form state:', lessonFormData.videoUrl);
		console.log('Video URL being sent:', lessonData.videoUrl);
		console.log('================================');

		createLessonMutation.mutate(lessonData);
	};
	
  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <Play className="w-4 h-4" />;
      case 'TEXT': return <FileText className="w-4 h-4" />;
      case 'QUIZ': return <HelpCircle className="w-4 h-4" />;
      case 'ASSIGNMENT': return <PenTool className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getLessonTypeColor = (type: string) => {
    switch (type) {
      case 'VIDEO': return 'text-blue-600 bg-blue-50';
      case 'TEXT': return 'text-gray-600 bg-gray-50';
      case 'QUIZ': return 'text-purple-600 bg-purple-50';
      case 'ASSIGNMENT': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-school-primary-nyanza">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-school-primary-blue">Course not found</h1>
            <Button onClick={() => router.back()} className="mt-4" variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-school-primary-nyanza">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              onClick={() => router.push('/admin/courses')}
              variant="outline"
              size="sm"
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-school-primary-blue mb-2">
                {course.title}
              </h1>
              <p className="text-gray-600">
                Manage course content and structure
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => setShowModuleForm(true)}
            className="bg-school-primary-blue hover:bg-school-primary-blue/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Module
          </Button>
        </div>

        {/* Course Info */}
        <div className="bg-white rounded-lg border border-school-primary-paledogwood p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold text-school-primary-blue">
                {modules?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Modules</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-school-primary-blue">
                {modules?.reduce((total, m) => total + m.lessons.length, 0) || 0}
              </div>
              <div className="text-sm text-gray-600">Lessons</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-school-primary-blue">
                {course._count.enrollments}
              </div>
              <div className="text-sm text-gray-600">Students</div>
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                course.published 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-yellow-100 text-yellow-600'
              }`}>
                {course.published ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
        </div>

        {/* Create Module Form */}
        {showModuleForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold text-school-primary-blue mb-4">
                Create New Module
              </h2>
              
              <form onSubmit={handleCreateModule} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-school-primary-blue mb-1">
                    Module Title *
                  </label>
                  <input
                    type="text"
                    value={moduleFormData.title}
                    onChange={(e) => setModuleFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
                    required
                    placeholder="Enter module title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-school-primary-blue mb-1">
                    Description
                  </label>
                  <textarea
                    value={moduleFormData.description}
                    onChange={(e) => setModuleFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue h-24 resize-none"
                    placeholder="Describe this module"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="submit"
                    disabled={createModuleMutation.isPending}
                    className="flex-1 bg-school-primary-blue hover:bg-school-primary-blue/90 text-white"
                  >
                    {createModuleMutation.isPending ? 'Creating...' : 'Create Module'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModuleForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Lesson Form */}
        {showLessonForm && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
							<h2 className="text-xl font-bold text-school-primary-blue mb-4">
								Create New Lesson
							</h2>
							
							<form onSubmit={handleCreateLesson} className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-school-primary-blue mb-1">
										Lesson Title *
									</label>
									<input
										type="text"
										value={lessonFormData.title}
										onChange={(e) => setLessonFormData(prev => ({ ...prev, title: e.target.value }))}
										className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
										required
										placeholder="Enter lesson title"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-school-primary-blue mb-1">
										Lesson Type
									</label>
									<select
										value={lessonFormData.type}
										onChange={(e) => setLessonFormData(prev => ({ ...prev, type: e.target.value as any }))}
										className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
									>
										<option value="TEXT">Text Content</option>
										<option value="VIDEO">Video</option>
										<option value="QUIZ">Quiz</option>
										<option value="ASSIGNMENT">Assignment</option>
										<option value="INTERACTIVE">Interactive</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-school-primary-blue mb-1">
										Description
									</label>
									<textarea
										value={lessonFormData.description}
										onChange={(e) => setLessonFormData(prev => ({ ...prev, description: e.target.value }))}
										className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue h-20 resize-none"
										placeholder="Describe this lesson"
									/>
								</div>

								{/* Content based on lesson type */}
								{lessonFormData.type === 'TEXT' && (
									<div>
										<label className="block text-sm font-medium text-school-primary-blue mb-1">
											Content
										</label>
										<textarea
											value={lessonFormData.content}
											onChange={(e) => setLessonFormData(prev => ({ ...prev, content: e.target.value }))}
											className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue h-32 resize-none"
											placeholder="Enter lesson content (supports basic HTML)"
										/>
									</div>
								)}

								{lessonFormData.type === 'VIDEO' && (
									<div>
										<label className="block text-sm font-medium text-school-primary-blue mb-2">
											Video Content
										</label>
										<VideoUpload
											currentVideoUrl={lessonFormData.videoUrl}
											onVideoUpload={(videoData) => {
												setLessonFormData(prev => ({
													...prev,
													videoUrl: videoData.url,
													videoDuration: videoData.duration,
													estimatedDuration: Math.ceil(videoData.duration / 60)
												}));
											}}
										/>
									</div>
								)}

								{lessonFormData.type === 'QUIZ' && (
									<div>
										<label className="block text-sm font-medium text-school-primary-blue mb-2">
											Quiz Content
										</label>
										<div className="border border-school-primary-paledogwood rounded-lg p-4 max-h-96 overflow-y-auto">
											<QuizBuilder
												onSave={(quizData) => {
													setLessonFormData(prev => ({ ...prev, quizData }));
												}}
												initialData={lessonFormData.quizData}
											/>
										</div>
									</div>
								)}

								{lessonFormData.type === 'ASSIGNMENT' && (
									<div>
										<label className="block text-sm font-medium text-school-primary-blue mb-2">
											Assignment Content
										</label>
										
										{/* Assignment Status Indicator - Same style as quiz */}
										<div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
											<div className="flex items-center justify-between">
												<div>
													<p className="text-sm font-medium text-purple-800">
														Assignment Status: {lessonFormData.assignmentData ? 'Ready' : 'Not configured'}
													</p>
													{lessonFormData.assignmentData && (
														<p className="text-xs text-purple-600">
															Due: {lessonFormData.assignmentData.dueDate ? new Date(lessonFormData.assignmentData.dueDate).toLocaleDateString() : 'No due date'} | 
															Max Points: {lessonFormData.assignmentData.maxPoints}
														</p>
													)}
												</div>
												{lessonFormData.assignmentData && (
													<div className="text-green-600">
														<CheckCircle className="w-5 h-5" />
													</div>
												)}
											</div>
										</div>
										
										<div className="border border-school-primary-paledogwood rounded-lg p-4 max-h-96 overflow-y-auto">
											<AssignmentBuilder
												onSave={(assignmentData) => {
													console.log('=== ASSIGNMENT BUILDER ON SAVE ===');
													console.log('Received assignment data:', assignmentData);
													setLessonFormData(prev => {
														const updated = { ...prev, assignmentData };
														console.log('Updated lesson form data:', updated);
														return updated;
													});
													
													// No alert - the beautiful feedback is handled in the builder itself
												}}
												initialData={lessonFormData.assignmentData}
											/>
										</div>
										
										{/* Instructions */}
										<div className="mt-2 text-xs text-gray-600">
											<p>💡 <strong>Tip:</strong> Configure your assignment above, then click "Save Assignment" before creating the lesson.</p>
										</div>
									</div>
								)}

								{lessonFormData.type === 'INTERACTIVE' && (
									<div>
										<label className="block text-sm font-medium text-school-primary-blue mb-2">
											Interactive Content
										</label>
										
										{/* Interactive Status Indicator */}
										<div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
											<div className="flex items-center justify-between">
												<div>
													<p className="text-sm font-medium text-purple-800">
														Interactive Status: {lessonFormData.interactiveData ? 'Ready' : 'Not configured'}
													</p>
													{lessonFormData.interactiveData && (
														<p className="text-xs text-purple-600">
															Type: {lessonFormData.interactiveData.type?.replace('_', ' ')} | 
															Max Attempts: {lessonFormData.interactiveData.maxAttempts}
														</p>
													)}
												</div>
												{lessonFormData.interactiveData && (
													<div className="text-green-600">
														<CheckCircle className="w-5 h-5" />
													</div>
												)}
											</div>
										</div>
										
										<div className="border border-school-primary-paledogwood rounded-lg p-4 max-h-96 overflow-y-auto">
											<InteractiveBuilder
												onSave={(interactiveData) => {
													console.log('=== INTERACTIVE BUILDER ON SAVE ===');
													console.log('Received interactive data:', interactiveData);
													setLessonFormData(prev => {
														const updated = { ...prev, interactiveData };
														console.log('Updated lesson form data:', updated);
														return updated;
													});
												}}
												initialData={lessonFormData.interactiveData}
											/>
										</div>
										
										{/* Instructions */}
										<div className="mt-2 text-xs text-gray-600">
											<p>💡 <strong>Tip:</strong> Configure your interactive content above, then click "Save Interactive Content" before creating the lesson.</p>
										</div>
									</div>
								)}

								<div>
									<label className="block text-sm font-medium text-school-primary-blue mb-1">
										Estimated Duration (minutes)
									</label>
									<input
										type="number"
										min="0"
										value={lessonFormData.estimatedDuration}
										onChange={(e) => setLessonFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 0 }))}
										className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
										placeholder="0"
									/>
								</div>

								<div className="flex space-x-3 pt-4">
									<Button
										type="submit"
										disabled={createLessonMutation.isPending || createQuizMutation.isPending}
										className="flex-1 bg-school-primary-blue hover:bg-school-primary-blue/90 text-white"
									>
										{(createLessonMutation.isPending || createQuizMutation.isPending) ? 'Creating...' : 'Create Lesson'}
									</Button>
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											setShowLessonForm(null);
											setLessonFormData({ 
												title: '', 
												description: '', 
												type: 'TEXT', 
												content: '', 
												estimatedDuration: 0, 
												videoUrl: '', 
												videoDuration: 0,
												quizData: null,
												assignmentData: null,
												interactiveData: null,
											});
										}}
										className="flex-1"
									>
										Cancel
									</Button>
								</div>
							</form>
						</div>
					</div>
				)}

        {/* Modules and Lessons */}
        <div className="space-y-6">
          {modules?.map((module, moduleIndex) => (
            <div key={module.id} className="bg-white rounded-lg border border-school-primary-paledogwood overflow-hidden">
              {/* Module Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-school-primary-paledogwood">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <GripVertical className="w-4 h-4 text-gray-400 mr-3" />
                    <div>
                      <h3 className="font-semibold text-school-primary-blue">
                        Module {moduleIndex + 1}: {module.title}
                      </h3>
                      {module.description && (
                        <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {module.lessons.length} lessons
                    </span>
                    <Button
                      onClick={() => setShowLessonForm(module.id)}
                      size="sm"
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Lesson
                    </Button>
                  </div>
                </div>
              </div>

              {/* Lessons */}
              <div className="divide-y divide-gray-100">
                {module.lessons.map((lesson, lessonIndex) => (
                  <div key={lesson.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center">
                      <GripVertical className="w-4 h-4 text-gray-400 mr-3" />
                      <div className={`p-2 rounded ${getLessonTypeColor(lesson.type)} mr-3`}>
                        {getLessonIcon(lesson.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-school-primary-blue">
                          {lessonIndex + 1}. {lesson.title}
                        </h4>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <span className="capitalize">{lesson.type.toLowerCase()}</span>
                          {lesson.estimatedDuration && (
                            <>
                              <span className="mx-2">•</span>
                              <span>{lesson.estimatedDuration} min</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {module.lessons.length === 0 && (
                  <div className="px-6 py-8 text-center text-gray-500">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No lessons in this module yet</p>
                    <Button
                      onClick={() => setShowLessonForm(module.id)}
                      size="sm"
                      variant="outline"
                      className="mt-2"
                    >
                      Add First Lesson
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {(!modules || modules.length === 0) && (
            <div className="text-center py-12 bg-white rounded-lg border border-school-primary-paledogwood">
              <div className="w-16 h-16 bg-school-primary-nyanza rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-school-primary-blue" />
              </div>
              <h3 className="text-lg font-medium text-school-primary-blue mb-2">
                No modules yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start building your course by creating the first module
              </p>
              <Button
                onClick={() => setShowModuleForm(true)}
                className="bg-school-primary-blue hover:bg-school-primary-blue/90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Module
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CourseContentPageWrapper() {
  return (
    <AdminGuard>
      <CourseContentPage />
    </AdminGuard>
  );
}