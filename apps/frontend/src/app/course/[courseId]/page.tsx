"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navigation/navbar";
import { QuizPlayer } from "@/components/quiz/quiz-player";
import { QuizAnswerReview } from "@/components/quiz/quiz-answer-review";
import { AssignmentPlayer } from "@/components/assignment/assignment-player";
import { InteractivePlayer } from "@/components/interactive/interactive-player";
import { InteractiveResults } from "@/components/interactive/interactive-results";
import { trpc } from "@/trpc/provider";
import ReactPlayer from 'react-player';
import { 
  Play, 
  FileText, 
  HelpCircle, 
  PenTool, 
  BookOpen,
  CheckCircle,
  Clock,
  Users,
  ArrowLeft,
  ArrowRight,
  Menu,
  X,
  ChevronUp,
  ChevronDown,
	Target
} from "lucide-react";
import { QuizResults } from "@/components/quiz/quiz-results";
import { AssignmentSubmissionResult } from "@/components/assignment/assignment-submission-result";

export default function CoursePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const courseId = params.courseId as string;
	const [quizResults, setQuizResults] = useState<any>(null);
	const [showQuizResults, setShowQuizResults] = useState(false);
	const [showAssignmentResults, setShowAssignmentResults] = useState(false);
	const [assignmentSubmissionResult, setAssignmentSubmissionResult] = useState<any>(null);
	const [showInteractiveResults, setShowInteractiveResults] = useState(false);
	const [interactiveSubmissionResult, setInteractiveSubmissionResult] = useState<any>(null);



  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
	  const [sidebarCollapsed, setsidebarCollapsed] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
	const [showAnswerReview, setShowAnswerReview] = useState(false);
	const [reviewAttempt, setReviewAttempt] = useState<any>(null);

  // tRPC queries
  const { data: courseData, isLoading } = trpc.getCourseForStudent.useQuery({
    courseId,
    userId: session?.user?.id
  });



  const { data: lessonData } = trpc.getLessonContent.useQuery(
    {
      lessonId: selectedLessonId!,
      userId: session?.user?.id!
    },
    {
      enabled: !!selectedLessonId && !!session?.user?.id && !!courseData?.isEnrolled
    }
  );

  const { data: userProgress } = trpc.getUserCourseProgress.useQuery(
    {
      courseId,
      userId: session?.user?.id!
    },
    {
      enabled: !!session?.user?.id && !!courseData?.isEnrolled
    }
  );
	const { data: quizData } = trpc.getQuiz.useQuery(
		{
			quizId: lessonData?.lesson.quizzes?.[0]?.id || '',
			userId: session?.user?.id
		},
		{
			enabled: !!lessonData?.lesson.quizzes?.[0]?.id && !!session?.user?.id,
			onSuccess: (data) => {
				console.log('=== QUIZ DATA RETRIEVED ===');
				console.log('Quiz data:', data);
			},
			onError: (error) => {
				console.error('=== QUIZ RETRIEVAL ERROR ===');
				console.error('Error:', error);
			}
		}
	);

	const { data: quizAttempts } = trpc.getUserQuizAttempts.useQuery(
		{
			quizId: lessonData?.lesson.quizzes?.[0]?.id || '',
			userId: session?.user?.id || ''
		},
		{
			enabled: !!lessonData?.lesson.quizzes?.[0]?.id && !!session?.user?.id
		}
	);

	const { data: assignmentData } = trpc.getAssignment.useQuery(
		{
			assignmentId: lessonData?.lesson.assignments?.[0]?.id || '',
			userId: session?.user?.id
		},
		{
			enabled: !!lessonData?.lesson.assignments?.[0]?.id && !!session?.user?.id
		}
	);

	const { data: assignmentSubmission } = trpc.getUserAssignmentSubmission.useQuery(
			{
				assignmentId: lessonData?.lesson.assignments?.[0]?.id || '',
				userId: session?.user?.id || ''
			},
			{
				enabled: !!lessonData?.lesson.assignments?.[0]?.id && !!session?.user?.id
			}
		);

		const { data: interactiveData } = trpc.getInteractiveContent.useQuery(
		{
			contentId: lessonData?.lesson.interactiveContents?.[0]?.id || '',
			userId: session?.user?.id
		},
		{
			enabled: !!lessonData?.lesson.interactiveContents?.[0]?.id && !!session?.user?.id
		}
	);

	const { data: interactiveAttempts } = trpc.getUserInteractiveAttempts.useQuery(
		{
			contentId: lessonData?.lesson.interactiveContents?.[0]?.id || '',
			userId: session?.user?.id || ''
		},
		{
			enabled: !!lessonData?.lesson.interactiveContents?.[0]?.id && !!session?.user?.id
		}
	);

	

  // tRPC mutations
  const markCompleteMutation = trpc.markLessonComplete.useMutation({
    onSuccess: () => {
      window.location.reload();
    }
  });

	const submitInteractiveMutation = trpc.submitInteractiveAttempt.useMutation({
		onSuccess: (result) => {
			// Show beautiful results instead of alert
			setInteractiveSubmissionResult(result);
			setShowInteractiveResults(true);
			
			// Mark lesson complete if passed or no passing score required
			if ((result.passed || !interactiveData?.passingScore) && !isLessonCompleted(selectedLessonId!)) {
				handleMarkComplete();
			}
			
			// Refresh interactive data
			window.location.reload();
		},
		onError: (error) => {
			alert('Failed to submit interactive content: ' + error.message);
		}
	});

	const submitQuizMutation = trpc.submitQuizAttempt.useMutation({
		onSuccess: (result) => {
			setQuizResults(result);
			setShowQuizResults(true);
			
			// Mark lesson complete if passed
			if (result.passed && !isLessonCompleted(selectedLessonId!)) {
				handleMarkComplete();
			}
			
			// Refresh attempts data
			window.location.reload();
		},
		onError: (error) => {
			alert('Failed to submit quiz: ' + error.message);
		}
	});

	const submitAssignmentMutation = trpc.submitAssignment.useMutation({
		onSuccess: (result) => {
			// Show beautiful results instead of alert
			setAssignmentSubmissionResult(result);
			setShowAssignmentResults(true);
			
			// Mark lesson complete
			if (!isLessonCompleted(selectedLessonId!)) {
				handleMarkComplete();
			}
			
			// Refresh assignment data
			window.location.reload();
		},
		onError: (error) => {
			alert('Failed to submit assignment: ' + error.message);
		}
	});

  // Get all lessons in order
  const allLessons = courseData?.course.modules.flatMap(module => 
    module.lessons.map(lesson => ({
      ...lesson,
      moduleTitle: module.title,
      moduleId: module.id
    }))
  ) || [];

  // Set first lesson as default
  useEffect(() => {
    if (allLessons.length > 0 && !selectedLessonId) {
      setSelectedLessonId(allLessons[0].id);
    }
  }, [allLessons, selectedLessonId]);

  // Initialize expanded modules
  useEffect(() => {
    if (courseData?.course.modules && expandedModules.size === 0) {
      const initialExpanded = new Set<string>();
      
      if (selectedLessonId) {
        const moduleWithSelectedLesson = courseData.course.modules.find(module =>
          module.lessons.some(lesson => lesson.id === selectedLessonId)
        );
        if (moduleWithSelectedLesson) {
          initialExpanded.add(moduleWithSelectedLesson.id);
        }
      } else if (courseData.course.modules.length > 0) {
        initialExpanded.add(courseData.course.modules[0].id);
      }
      
      setExpandedModules(initialExpanded);
    }
  }, [courseData, selectedLessonId, expandedModules.size]);

  // Get current lesson index
  const currentLessonIndex = allLessons.findIndex(l => l.id === selectedLessonId);

  const handleMarkComplete = () => {
    if (selectedLessonId && session?.user?.id) {
      markCompleteMutation.mutate({
        lessonId: selectedLessonId,
        userId: session.user.id,
        watchTime: 0
      });
    }
  };

  const goToNextLesson = () => {
    if (currentLessonIndex < allLessons.length - 1) {
      setSelectedLessonId(allLessons[currentLessonIndex + 1].id);
    }
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setSelectedLessonId(allLessons[currentLessonIndex - 1].id);
    }
  };

  const toggleModuleExpansion = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <Play className="w-4 h-4" />;
      case 'TEXT': return <FileText className="w-4 h-4" />;
      case 'QUIZ': return <HelpCircle className="w-4 h-4" />;
      case 'ASSIGNMENT': return <PenTool className="w-4 h-4" />;
			case 'INTERACTIVE': return <Target className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return userProgress?.some(p => p.lesson.id === lessonId && p.completed) || false;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-school-primary-nyanza">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-school-primary-blue">Loading course...</div>
        </div>
      </div>
    );
  }

  // Course not found or not enrolled
  if (!courseData) {
    return (
      <div className="min-h-screen bg-school-primary-nyanza">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-school-primary-blue mb-4">
            Course not found
          </h1>
          <Button onClick={() => router.push('/courses')} variant="outline">
            Browse Courses
          </Button>
        </div>
      </div>
    );
  }

  // Not enrolled
  if (!courseData.isEnrolled) {
    return (
      <div className="min-h-screen bg-school-primary-nyanza">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-school-primary-blue mb-4">
            You are not enrolled in this course
          </h1>
          <p className="text-gray-600 mb-6">
            Please enroll in the course to access the content.
          </p>
          <Button onClick={() => router.push('/courses')} className="bg-school-primary-blue text-white">
            Browse Courses
          </Button>
        </div>
      </div>
    );
  }

  const currentLesson = allLessons[currentLessonIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        {/* Enhanced Sidebar with better UX */}
				<div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 overflow-hidden flex flex-col relative`}>
					{/* Sidebar Header */}
					<div className="p-4 border-b border-gray-200 flex-shrink-0">
						<div className="flex items-center justify-between mb-2">
							<h1 className="font-bold text-school-primary-blue text-lg truncate">
								{courseData.course.title}
							</h1>
							<div className="flex items-center gap-2">
								<Button
									size="sm"
									variant="ghost"
									onClick={() => setSidebarOpen(false)}
									className="hover:bg-gray-100 p-1 h-8 w-8"
								>
									<X className="w-4 h-4" />
								</Button>
							</div>
						</div>
						
						{/* Progress */}
						<div className="text-sm text-gray-600 mb-2">
							Progress: {Math.round(courseData.enrollment?.progress || 0)}%
						</div>
						<div className="w-full bg-gray-200 rounded-full h-2">
							<div 
								className="bg-school-primary-blue h-2 rounded-full transition-all duration-300"
								style={{ width: `${courseData.enrollment?.progress || 0}%` }}
							></div>
						</div>
					</div>

					{/* Scrollable Course Content */}
					<div className="flex-1 overflow-y-auto custom-scrollbar">
						{courseData.course.modules.map((module, moduleIndex) => {
							const completedLessonsInModule = module.lessons.filter(lesson => 
								isLessonCompleted(lesson.id)
							).length;
							const totalLessonsInModule = module.lessons.length;
							const moduleProgress = totalLessonsInModule > 0 ? (completedLessonsInModule / totalLessonsInModule) * 100 : 0;
							const isModuleExpanded = expandedModules.has(module.id);

							return (
								<div key={module.id} className="border-b border-gray-100 last:border-b-0">
									{/* Module Header - Improved Click Area */}
									<div
										onClick={() => toggleModuleExpansion(module.id)}
										className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-all duration-200 cursor-pointer select-none"
									>
										<div className="flex items-center justify-between">
											<div className="flex-1 min-w-0">
												<h3 className="font-semibold text-school-primary-blue text-sm truncate">
													{moduleIndex + 1}. {module.title}
												</h3>
												<div className="flex items-center justify-between mt-2">
													<span className="text-xs text-gray-500">
														{completedLessonsInModule}/{totalLessonsInModule} lessons
													</span>
													<span className="text-xs text-gray-500">
														{Math.round(moduleProgress)}% complete
													</span>
												</div>
												
												{/* Module Progress Bar */}
												<div className="w-full bg-gray-200 rounded-full h-1 mt-2">
													<div 
														className="bg-school-primary-blue h-1 rounded-full transition-all duration-300"
														style={{ width: `${moduleProgress}%` }}
													></div>
												</div>
											</div>
											
											{/* Expand/Collapse Icon with Animation */}
											<div className="ml-3 flex-shrink-0">
												<div className={`transform transition-transform duration-200 ${isModuleExpanded ? 'rotate-180' : 'rotate-0'}`}>
													<ChevronDown className="w-4 h-4 text-gray-400" />
												</div>
											</div>
										</div>
									</div>
									
									{/* Module Lessons - Smooth Animation */}
									<div className={`overflow-hidden transition-all duration-300 ease-in-out ${
										isModuleExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
									}`}>
										<div className="divide-y divide-gray-50 bg-white">
											{module.lessons.map((lesson, lessonIndex) => (
												<div
													key={lesson.id}
													onClick={() => setSelectedLessonId(lesson.id)}
													className={`w-full text-left p-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer border-l-4 ${
														selectedLessonId === lesson.id 
															? 'bg-blue-50 border-l-school-primary-blue' 
															: 'border-l-transparent'
													}`}
												>
													<div className="flex items-center justify-between">
														<div className="flex items-center flex-1 min-w-0">
															<div className="mr-3 text-gray-500 flex-shrink-0">
																{getLessonIcon(lesson.type)}
															</div>
															<div className="flex-1 min-w-0">
																<div className="text-sm font-medium text-gray-900 truncate">
																	{lessonIndex + 1}. {lesson.title}
																</div>
																<div className="flex items-center text-xs text-gray-500 mt-1">
																	<span className="capitalize">{lesson.type.toLowerCase()}</span>
																	{lesson.estimatedDuration && (
																		<>
																			<span className="mx-1">•</span>
																			<Clock className="w-3 h-3 mr-1" />
																			<span>{lesson.estimatedDuration}m</span>
																		</>
																	)}
																</div>
															</div>
														</div>
														
														{/* Completion Status */}
														<div className="ml-2 flex-shrink-0">
															{isLessonCompleted(lesson.id) ? (
																<CheckCircle className="w-5 h-5 text-green-500" />
															) : (
																<div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
															)}
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Content Header */}
					<div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								{!sidebarOpen && (
									<Button
										size="sm"
										variant="outline"
										onClick={() => setSidebarOpen(true)}
										className="mr-4 hover:bg-school-primary-nyanza"
									>
										<Menu className="w-4 h-4" />
									</Button>
								)}
								
								{currentLesson && (
									<div>
										<h2 className="font-bold text-school-primary-blue text-lg">
											{currentLesson.title}
										</h2>
										<div className="flex items-center text-sm text-gray-600 mt-1">
											<span className="capitalize">{currentLesson.type.toLowerCase()}</span>
											{currentLesson.estimatedDuration && (
												<>
													<span className="mx-2">•</span>
													<Clock className="w-4 h-4 mr-1" />
													<span>{currentLesson.estimatedDuration} minutes</span>
												</>
											)}
										</div>
									</div>
								)}
							</div>

							<div className="flex items-center space-x-2">
								<Button
									onClick={goToPreviousLesson}
									disabled={currentLessonIndex <= 0}
									size="sm"
									variant="outline"
									className="hover:bg-school-primary-nyanza"
								>
									<ArrowLeft className="w-4 h-4 mr-1" />
									Previous
								</Button>
								
								<Button
									onClick={goToNextLesson}
									disabled={currentLessonIndex >= allLessons.length - 1}
									size="sm"
									variant="outline"
									className="hover:bg-school-primary-nyanza"
								>
									Next
									<ArrowRight className="w-4 h-4 ml-1" />
								</Button>
							</div>
						</div>
					</div>
          {/* Lesson Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            {lessonData ? (
              <div className="max-w-6xl mx-auto">
                {/* Lesson Description */}
                {lessonData.lesson.description && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-gray-700">{lessonData.lesson.description}</p>
                  </div>
                )}

                {/* TEXT Content */}
                {lessonData.lesson.type === 'TEXT' && (
                  <div className="prose max-w-none">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      {lessonData.lesson.content ? (
                        <div dangerouslySetInnerHTML={{ __html: lessonData.lesson.content.replace(/\n/g, '<br />') }} />
                      ) : (
                        <p className="text-gray-500 italic">No content available for this lesson yet.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* VIDEO Content - Simple HTML5 Version */}
								{lessonData.lesson.type === 'VIDEO' && (
									<div className="bg-white border border-gray-200 rounded-lg p-6">
										{lessonData.lesson.videoUrl ? (
											<div className="space-y-4">
												<div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
													<video
														className="w-full h-full"
														controls
														preload="metadata"
														onTimeUpdate={(e) => {
															const video = e.target as HTMLVideoElement;
															if (video.duration > 0) {
																const percentWatched = Math.round((video.currentTime / video.duration) * 100);
																setVideoProgress(percentWatched);
																
																if (percentWatched >= 90 && !isLessonCompleted(selectedLessonId!)) {
																	handleMarkComplete();
																}
															}
														}}
														onEnded={() => {
															if (!isLessonCompleted(selectedLessonId!)) {
																handleMarkComplete();
															}
														}}
														onError={(e) => {
															console.error('Video error:', e);
														}}
														style={{
															backgroundColor: '#000',
															objectFit: 'contain'
														}}
													>
														<source src={lessonData.lesson.videoUrl} />
														Your browser does not support the video tag.
													</video>
												</div>
												
												{/* Video Info Bar */}
												<div className="flex items-center justify-between text-sm bg-gray-50 p-4 rounded-lg">
													<div className="flex items-center space-x-4">
														<div className="flex items-center">
															<Play className="w-4 h-4 mr-2 text-school-primary-blue" />
															<span className="font-medium">Video Lesson</span>
														</div>
														{lessonData.lesson.videoDuration && (
															<div className="flex items-center text-gray-600">
																<Clock className="w-4 h-4 mr-1" />
																<span>{Math.ceil(lessonData.lesson.videoDuration / 60)} minutes</span>
															</div>
														)}
													</div>
												</div>

												{/* Progress Bar */}
												<div className="space-y-2">
													<div className="flex justify-between text-sm text-gray-600">
														<span>Progress</span>
														<span>{isLessonCompleted(selectedLessonId!) ? '100%' : videoProgress + '%'}</span>
													</div>
													<div className="w-full bg-gray-200 rounded-full h-2">
														<div 
															className={`h-2 rounded-full transition-all duration-300 ${
																isLessonCompleted(selectedLessonId!) 
																	? 'bg-green-500' 
																	: 'bg-school-primary-blue'
															}`}
															style={{ 
																width: `${isLessonCompleted(selectedLessonId!) ? '100' : videoProgress}%` 
															}}
														></div>
													</div>
												</div>
											</div>
										) : (
											<div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
												<div className="text-center text-gray-500">
													<Play className="w-16 h-16 mx-auto mb-4" />
													<p>No video available for this lesson yet.</p>
												</div>
											</div>
										)}
									</div>
								)}

								{lessonData.lesson.type === 'QUIZ' && (
									<div className="bg-white border border-gray-200 rounded-lg p-6">
										{showQuizResults && quizResults ? (
											// Show results from current session
											<QuizResults
												result={quizResults}
												quiz={quizData}
												canRetake={(quizAttempts?.length || 0) < (quizData?.maxAttempts || 1)}
												onRetakeQuiz={() => {
													setShowQuizResults(false);
													setQuizResults(null);
												}}
												onViewAnswers={() => {
													setReviewAttempt(quizResults.attempt);
													setShowAnswerReview(true);
												}}
											/>
												)	: showAnswerReview && reviewAttempt && quizData ? (
											<QuizAnswerReview
												quiz={quizData}
												attempt={reviewAttempt}
												onClose={() => {
													setShowAnswerReview(false);
													setReviewAttempt(null);
												}}
												onRetake={() => {
													setShowAnswerReview(false);
													setReviewAttempt(null);
													setShowQuizResults(false);
													setQuizResults(null);
												}}
											/>
										) : (quizAttempts && quizAttempts.length > 0) ? (
											// Show results from previous attempts if any exist
											<div className="space-y-4">
												{/* Latest Attempt Results */}
												<QuizResults
													result={{
														attempt: quizAttempts[0], // Most recent attempt
														score: quizAttempts[0].score,
														passed: quizAttempts[0].passed,
														totalPoints: quizAttempts[0].totalPoints,
														pointsEarned: quizAttempts[0].pointsEarned,
													}}
													quiz={quizData}
													canRetake={quizAttempts.length < (quizData?.maxAttempts || 1)}
													onRetakeQuiz={() => {
														// Allow retake if attempts remaining
														if (quizAttempts.length < (quizData?.maxAttempts || 1)) {
															setShowQuizResults(false);
															setQuizResults(null);
														}
													}}
													onViewAnswers={() => {
														setReviewAttempt(quizAttempts[0]);
														setShowAnswerReview(true);
													}}
												/>

												{/* Attempt History */}
												{quizAttempts.length > 1 && (
													<div className="mt-6 border-t border-gray-200 pt-6">
														<h3 className="text-lg font-semibold text-school-primary-blue mb-4">
															Previous Attempts
														</h3>
														<div className="space-y-2">
															{quizAttempts.slice(1).map((attempt, index) => (
																<div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
																	<div className="flex items-center">
																		<span className="text-sm font-medium text-gray-700">
																			Attempt #{quizAttempts.length - index - 1}
																		</span>
																		<span className="mx-2 text-gray-400">•</span>
																		<span className="text-sm text-gray-600">
																			{new Date(attempt.submittedAt || attempt.createdAt).toLocaleDateString()}
																		</span>
																	</div>
																	<div className="flex items-center space-x-3">
																		<span className={`text-sm font-medium ${
																			attempt.passed ? 'text-green-600' : 'text-red-600'
																		}`}>
																			{attempt.score.toFixed(1)}%
																		</span>
																		<span className={`px-2 py-1 rounded-full text-xs font-medium ${
																			attempt.passed 
																				? 'bg-green-100 text-green-800' 
																				: 'bg-red-100 text-red-800'
																		}`}>
																			{attempt.passed ? 'Passed' : 'Failed'}
																		</span>
																		{quizData?.showCorrectAnswers && (
																			<Button
																				size="sm"
																				variant="outline"
																				onClick={() => {
																					setReviewAttempt(attempt);
																					setShowAnswerReview(true);
																				}}
																			>
																				Review
																			</Button>
																		)}
																	</div>
																</div>
															))}
														</div>
													</div>
												)}
											</div>
										) : quizData ? (
											// Show quiz player for first attempt
											<QuizPlayer
												quiz={quizData}
												existingAttempts={quizAttempts || []}
												isSubmitting={submitQuizMutation.isPending}
												onSubmit={(answers, timeSpent) => {
													submitQuizMutation.mutate({
														quizId: quizData.id,
														userId: session?.user?.id || '',
														answers,
														timeSpent
													});
												}}
											/>
										) : (
											// No quiz data available
											<div className="text-center py-12">
												<div className="w-16 h-16 bg-school-primary-nyanza rounded-full flex items-center justify-center mx-auto mb-4">
													<HelpCircle className="w-8 h-8 text-school-primary-blue" />
												</div>
												<h3 className="text-lg font-medium text-school-primary-blue mb-2">
													No quiz available
												</h3>
												<p className="text-gray-600">
													This quiz lesson hasn't been set up yet.
												</p>
											</div>
										)}
									</div>
								)}

								{lessonData.lesson.type === 'ASSIGNMENT' && (
									<div className="bg-white border border-gray-200 rounded-lg p-6">
										{showAssignmentResults && assignmentSubmissionResult && assignmentData ? (
											<AssignmentSubmissionResult
												assignment={assignmentData}
												submission={assignmentSubmissionResult}
												onClose={() => {
													setShowAssignmentResults(false);
													setAssignmentSubmissionResult(null);
												}}
											/>
										) : assignmentData ? (
											<AssignmentPlayer
												assignment={assignmentData}
												submission={assignmentSubmission}
												isSubmitting={submitAssignmentMutation.isPending}
												onSubmit={(submissionData) => {
													submitAssignmentMutation.mutate({
														assignmentId: assignmentData.id,
														userId: session?.user?.id || '',
														...submissionData
													});
												}}
											/>
										) : (
											<div className="text-center py-12">
												<div className="w-16 h-16 bg-school-primary-nyanza rounded-full flex items-center justify-center mx-auto mb-4">
													<PenTool className="w-8 h-8 text-school-primary-blue" />
												</div>
												<h3 className="text-lg font-medium text-school-primary-blue mb-2">
													No assignment available
												</h3>
												<p className="text-gray-600">
													This assignment lesson hasn't been set up yet.
												</p>
											</div>
										)}
									</div>
								)}

								{lessonData.lesson.type === 'INTERACTIVE' && (
									<div className="bg-white border border-gray-200 rounded-lg p-6">
										{showInteractiveResults && interactiveSubmissionResult && interactiveData ? (
											// Show results from fresh submission
											<InteractiveResults
												interactiveContent={interactiveData}
												result={interactiveSubmissionResult}
												canRetry={(interactiveAttempts?.length || 0) < (interactiveData?.maxAttempts || 1)}
												onClose={() => {
													setShowInteractiveResults(false);
													setInteractiveSubmissionResult(null);
													window.location.reload();
												}}
												onRetry={() => {
													setShowInteractiveResults(false);
													setInteractiveSubmissionResult(null);
												}}
											/>
										) : interactiveData && interactiveAttempts && interactiveAttempts.length > 0 && 
											(interactiveAttempts.length >= (interactiveData?.maxAttempts || 1)) ? (
											// Show results when no attempts remaining
											<InteractiveResults
												interactiveContent={interactiveData}
												result={{
													attempt: interactiveAttempts[0], // Most recent attempt
													score: interactiveAttempts[0]?.score || 0,
													passed: interactiveData.passingScore ? 
														(interactiveAttempts[0]?.score || 0) >= interactiveData.passingScore : 
														true
												}}
												canRetry={false}
												onClose={() => {
													// Just a placeholder
													console.log('No more attempts - results view');
												}}
											/>
										) : interactiveData ? (
											// Show normal player when attempts available
											<InteractivePlayer
												interactiveContent={interactiveData}
												attempts={interactiveAttempts || []}
												isSubmitting={submitInteractiveMutation.isPending}
												onSubmit={(responses, timeSpent) => {
													submitInteractiveMutation.mutate({
														contentId: interactiveData.id,
														userId: session?.user?.id || '',
														responses,
														timeSpent,
														completed: true
													});
												}}
											/>
										) : (
											// No interactive content configured
											<div className="text-center py-12">
												<div className="w-16 h-16 bg-school-primary-nyanza rounded-full flex items-center justify-center mx-auto mb-4">
													<Target className="w-8 h-8 text-school-primary-blue" />
												</div>
												<h3 className="text-lg font-medium text-school-primary-blue mb-2">
													No interactive content available
												</h3>
												<p className="text-gray-600">
													This interactive lesson hasn't been set up yet.
												</p>
											</div>
										)}
									</div>
								)}


                {/* Other Content Types */}
                {/* {(lessonData.lesson.type === 'INTERACTIVE') && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <div className="text-gray-500">
                      {getLessonIcon(lessonData.lesson.type)}
                      <p className="mt-4">
                        {lessonData.lesson.type} content will be implemented in a future update.
                      </p>
                    </div>
                  </div>
                )} */}

                {/* Mark Complete Button */}
                <div className="mt-8 flex justify-center">
                  {!isLessonCompleted(selectedLessonId!) ? (
                    <Button
                      onClick={handleMarkComplete}
                      disabled={markCompleteMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white px-8"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {markCompleteMutation.isPending ? 'Marking Complete...' : 'Mark as Complete'}
                    </Button>
                  ) : (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="font-medium">Lesson Completed</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Select a lesson to start learning</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}




