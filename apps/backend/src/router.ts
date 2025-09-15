import { router, publicProcedure } from './trpc';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

let db: PrismaClient | null = null;

const getDb = () => {
  if (!db) {
    db = new PrismaClient();
  }
  return db;
};

// Quiz scoring helper function
function calculateQuizScore(questions: any[], userAnswers: any) {
  let pointsEarned = 0;
  let totalPoints = 0;

  questions.forEach((question, index) => {
    totalPoints += question.points;
    const userAnswer = userAnswers[question.id] || userAnswers[index];
    
    if (isAnswerCorrect(question, userAnswer)) {
      pointsEarned += question.points;
    }
  });

  const score = totalPoints > 0 ? (pointsEarned / totalPoints) * 100 : 0;
  
  return {
    score: Math.round(score * 100) / 100, // Round to 2 decimal places
    pointsEarned,
    totalPoints
  };
}

function isAnswerCorrect(question: any, userAnswer: any): boolean {
  if (!userAnswer && userAnswer !== 0) return false;

  switch (question.type) {
    case 'MULTIPLE_CHOICE':
    case 'TRUE_FALSE':
      return userAnswer === question.correctAnswer;
      
    case 'MULTIPLE_SELECT':
      const correctAnswers = question.correctAnswer || [];
      const userAnswers = Array.isArray(userAnswer) ? userAnswer : [];
      return correctAnswers.length === userAnswers.length &&
             correctAnswers.every((answer: number) => userAnswers.includes(answer));
             
    case 'FILL_BLANK':
      const correctBlanks = question.correctAnswer || [];
      const userBlanks = Array.isArray(userAnswer) ? userAnswer : [];
      return correctBlanks.every((correct: string, index: number) => {
        const userResponse = userBlanks[index]?.toLowerCase().trim();
        const correctResponse = correct.toLowerCase().trim();
        return userResponse === correctResponse;
      });
      
    case 'SHORT_ANSWER':
      const correctAnswer = question.correctAnswer || '';
      const userResponse = userAnswer || '';
      const caseSensitive = question.content?.caseSensitive || false;
      const exactMatch = question.content?.exactMatch || false;
      
      if (!exactMatch) return true; // Manual grading required
      
      if (caseSensitive) {
        return userResponse.trim() === correctAnswer.trim();
      } else {
        return userResponse.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
      }
      
    default:
      return false;
  }
}
// Interactive content scoring helper function
function calculateInteractiveScore(interactiveContent: any, userResponses: any): number {
  const { type, content } = interactiveContent;
  
  switch (type) {
    case 'DRAG_DROP':
      return calculateDragDropScore(content, userResponses);
    case 'HOTSPOT':
      return calculateHotspotScore(content, userResponses);
    case 'SEQUENCE':
      return calculateSequenceScore(content, userResponses);
    case 'MATCHING':
      return calculateMatchingScore(content, userResponses);
    case 'TIMELINE':
      return calculateTimelineScore(content, userResponses);
    default:
      // For simulation and custom types, return based on completion
      return userResponses.completed ? 100 : 0;
  }
}

function calculateDragDropScore(content: any, responses: any): number {
  const items = content.items || [];
  const userPlacements = responses.placements || {};
  
  let correctCount = 0;
  
  items.forEach((item: any, index: number) => {
    const userTarget = userPlacements[item.id];
    const correctTarget = item.correctTarget;
    
    if (userTarget === correctTarget) {
      correctCount++;
    }
  });
  
  return items.length > 0 ? Math.round((correctCount / items.length) * 100) : 0;
}

function calculateHotspotScore(content: any, responses: any): number {
  const hotspots = content.hotspots || [];
  const hitHotspots = responses.hitHotspots || [];
  const clicks = responses.clicks || [];
  
  // Count correct hotspots found
  const correctHotspots = hotspots.filter((hotspot: any) => hotspot.isCorrect);
  const correctHotspotsFound = correctHotspots.filter((_: any, index: number) => 
    hitHotspots.includes(hotspots.indexOf(correctHotspots[index]))
  ).length;
  
  // Count incorrect clicks (clicks that don't hit any correct hotspot)
  const incorrectClicks = clicks.length - (responses.hitHotspots?.length || 0);
  
  // Calculate base score
  let score = correctHotspots.length > 0 ? (correctHotspotsFound / correctHotspots.length) * 100 : 0;
  
  // Penalty for incorrect clicks (max 20% penalty)
  const penalty = Math.min(incorrectClicks * 5, 20);
  score = Math.max(0, score - penalty);
  
  return Math.round(score);
}

function calculateSequenceScore(content: any, responses: any): number {
  const items = content.items || [];
  const userOrder = responses.order || [];
  const scoringMethod = content.scoringMethod || 'partial';
  
  if (items.length === 0 || userOrder.length !== items.length) {
    return 0;
  }

  switch (scoringMethod) {
    case 'exact':
      // All or nothing - must be perfect
      const isExact = userOrder.every((itemId: string, index: number) => {
        const item = items.find((i: any) => i.id === itemId);
        return item && item.order === index;
      });
      return isExact ? 100 : 0;
      
    case 'adjacent':
      // Points for correct adjacent pairs
      let adjacentScore = 0;
      for (let i = 0; i < userOrder.length - 1; i++) {
        const currentItem = items.find((item: any) => item.id === userOrder[i]);
        const nextItem = items.find((item: any) => item.id === userOrder[i + 1]);
        
        if (currentItem && nextItem && currentItem.order === nextItem.order - 1) {
          adjacentScore++;
        }
      }
      return items.length > 1 ? Math.round((adjacentScore / (items.length - 1)) * 100) : 100;
      
    case 'partial':
    default:
      // Partial credit for correct positions
      let correctPositions = 0;
      userOrder.forEach((itemId: string, index: number) => {
        const item = items.find((i: any) => i.id === itemId);
        if (item && item.order === index) {
          correctPositions++;
        }
      });
      return Math.round((correctPositions / items.length) * 100);
  }
}

function calculateMatchingScore(content: any, responses: any): number {
  const leftItems = content.leftItems || [];
  const userMatches = responses.matches || {};
  
  console.log('=== BACKEND MATCHING SCORE DEBUG ===');
  console.log('Left items:', leftItems);
  console.log('User matches:', userMatches);
  
  if (leftItems.length === 0) return 0;
  
  // Count correct matches
  let correctMatches = 0;
  let totalExpectedMatches = 0;
  
  leftItems.forEach((leftItem: any) => {
    if (leftItem.correctMatch) {
      totalExpectedMatches++;
      const userMatch = userMatches[leftItem.id];
      
      // Convert both to strings for comparison
      const isCorrect = String(leftItem.correctMatch) === String(userMatch);
      
      console.log(`Item "${leftItem.text}": expected ${leftItem.correctMatch}, got ${userMatch}, correct: ${isCorrect}`);
      
      if (isCorrect) {
        correctMatches++;
      }
    }
  });
  
  console.log(`Correct matches: ${correctMatches}/${totalExpectedMatches}`);
  
  // Calculate score as percentage of correct matches
  const score = totalExpectedMatches > 0 ? Math.round((correctMatches / totalExpectedMatches) * 100) : 0;
  console.log('Final score:', score);
  console.log('=====================================');
  
  return score;
}

function calculateTimelineScore(content: any, responses: any): number {
  const events = content.events || [];
  const userPlacements = responses.placements || {};
  const allowApproximate = content.allowApproximate !== false;
  
  if (events.length === 0) return 0;
  
  let correctPlacements = 0;
  
  events.forEach((event: any) => {
    const placement = userPlacements[event.id];
    if (!placement) return; // Event not placed
    
    const correctDate = new Date(event.date || `${event.year}-${String(event.month || 1).padStart(2, '0')}-${String(event.day || 1).padStart(2, '0')}`);
    const placedDate = new Date(placement.date);
    
    // Calculate difference in years
    const yearDifference = Math.abs(correctDate.getFullYear() - placedDate.getFullYear());
    
    // Determine if placement is correct based on tolerance
    const tolerance = allowApproximate ? 1 : 0; // 1 year tolerance if approximate allowed
    const isCorrect = yearDifference <= tolerance;
    
    if (isCorrect) {
      correctPlacements++;
    }
  });
  
  // Calculate score as percentage of correct placements
  return Math.round((correctPlacements / events.length) * 100);
}

function isPointInHotspot(point: { x: number; y: number }, hotspot: any): boolean {
  const { x, y } = point;
  const { x: hx, y: hy, width, height } = hotspot;
  
  return x >= hx && x <= hx + width && y >= hy && y <= hy + height;
}

export const appRouter = router({
  // Public procedures
  healthCheck: publicProcedure.query(async () => {
    try {
      const database = getDb();
      await database.$queryRaw`SELECT 1`;
      
      const userCount = await database.user.count();
      const courseCount = await database.course.count();
      const categoryCount = await database.category.count();
      
      return { 
        status: 'tRPC is working!', 
        database: 'Connected',
        tables: {
          users: userCount,
          courses: courseCount,
          categories: categoryCount
        }
      };
    } catch (error) {
      return { 
        status: 'tRPC is working!', 
        database: 'Disconnected',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }),

  createSampleData: publicProcedure.mutation(async () => {
  try {
    const database = getDb();
    
    // Create multiple categories
    const categories = [
      {
        name: 'ECONOMICS & SOCIETY',
        slug: 'economics-society',
        description: 'Learn about economics, politics, and society',
        color: '#0b1320',
        order: 1
      },
      {
        name: 'Design',
        slug: 'design',
        description: 'Creative design skills',
        color: '#C9B7AD',
        order: 2
      },
      {
        name: 'Business',
        slug: 'business',
        description: 'Business and entrepreneurship',
        color: '#CC76A1',
        order: 3
      },
      {
        name: 'Marketing',
        slug: 'marketing',
        description: 'Digital marketing strategies',
        color: '#DD9296',
        order: 4
      }
    ];

    for (const categoryData of categories) {
      await database.category.upsert({
        where: { slug: categoryData.slug },
        update: {},
        create: categoryData
      });
    }

    return {
      success: true,
      message: 'Sample categories created successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}),

  // Category procedures
  getCategories: publicProcedure.query(async () => {
    const database = getDb();
    const categories = await database.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { courses: true }
        }
      }
    });
    return categories;
  }),

  // Course procedures - require userId to be passed from frontend
  getCourses: publicProcedure
  .input(z.object({
    search: z.string().optional(),
    categoryId: z.string().optional(),
    level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  }).transform(data => ({
    // Transform empty strings to undefined
    search: data.search && data.search.trim() !== '' ? data.search : undefined,
    categoryId: data.categoryId && data.categoryId.trim() !== '' ? data.categoryId : undefined,
    level: data.level && data.level.trim() !== '' ? data.level as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' : undefined,
  })))
  .query(async ({ input }) => {
    const database = getDb();
    
    const whereClause: any = {
      published: true,
    };

    if (input.search) {
      whereClause.OR = [
        { title: { contains: input.search, mode: 'insensitive' } },
        { description: { contains: input.search, mode: 'insensitive' } },
      ];
    }

    if (input.categoryId) {
      whereClause.categoryId = input.categoryId;
    }

    if (input.level) {
      whereClause.level = input.level;
    }

    const courses = await database.course.findMany({
      where: whereClause,
      include: {
        creator: {
          select: { name: true }
        },
        category: {
          select: { name: true, color: true }
        },
        _count: {
          select: { 
            enrollments: true,
            modules: true,
            reviews: true
          }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return courses;
  }),

  enrollInCourse: publicProcedure
    .input(z.object({
      courseId: z.string(),
      userId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const database = getDb();
      
      // Check if already enrolled
      const existingEnrollment = await database.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: input.userId,
            courseId: input.courseId
          }
        }
      });

      if (existingEnrollment) {
        throw new Error('Already enrolled in this course');
      }

      // Create enrollment
      const enrollment = await database.enrollment.create({
        data: {
          userId: input.userId,
          courseId: input.courseId,
        },
        include: {
          course: {
            select: { title: true }
          }
        }
      });

      // Update enrollment count
      await database.course.update({
        where: { id: input.courseId },
        data: {
          enrollmentCount: {
            increment: 1
          }
        }
      });

      return enrollment;
    }),

  getMyEnrollments: publicProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(async ({ input }) => {
      const database = getDb();
      
      const enrollments = await database.enrollment.findMany({
        where: { userId: input.userId },
        include: {
          course: {
            include: {
              category: {
                select: { name: true, color: true }
              },
              _count: {
                select: { modules: true }
              }
            }
          }
        },
        orderBy: { lastAccessedAt: 'desc' }
      });

      return enrollments;
    }),

  // Admin procedures - require userId and role validation from frontend
  createCourse: publicProcedure
  .input(z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    categoryId: z.string().nullish(), // Changed from optional to nullish
    level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
    creatorId: z.string(),
    userRole: z.string(),
  }))
  .mutation(async ({ input }) => {
    // Validate admin access
    if (input.userRole !== 'ADMIN') {
      throw new Error('Admin access required');
    }

    const database = getDb();
    
    // Generate slug from title
    const slug = input.title.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    
    // Prepare course data
    const courseData: any = {
      title: input.title,
      slug,
      level: input.level,
      creatorId: input.creatorId,
    };

    // Add optional fields only if they have values
    if (input.description) {
      courseData.description = input.description;
    }

    if (input.categoryId) {
      courseData.categoryId = input.categoryId;
    }
    
    const course = await database.course.create({
      data: courseData,
      include: {
        category: {
          select: { name: true }
        }
      }
    });
    
    return course;
  }),

  getAdminCourses: publicProcedure
    .input(z.object({
      creatorId: z.string(),
      userRole: z.string(),
    }))
    .query(async ({ input }) => {
      // Validate admin access
      if (input.userRole !== 'ADMIN') {
        throw new Error('Admin access required');
      }

      const database = getDb();
      
      const courses = await database.course.findMany({
        where: { creatorId: input.creatorId },
        include: {
          category: {
            select: { name: true, color: true }
          },
          _count: {
            select: { 
              enrollments: true,
              modules: true,
              reviews: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return courses;
    }),

		toggleCoursePublish: publicProcedure
		.input(z.object({
			courseId: z.string(),
			published: z.boolean(),
			creatorId: z.string(),
			userRole: z.string(),
		}))
		.mutation(async ({ input }) => {
			// Validate admin access
			if (input.userRole !== 'ADMIN') {
				throw new Error('Admin access required');
			}

			const database = getDb();
			
			const course = await database.course.update({
				where: { 
					id: input.courseId,
					creatorId: input.creatorId // Ensure user owns the course
				},
				data: {
					published: input.published
				},
				include: {
					category: {
						select: { name: true }
					}
				}
			});

			return course;
		}),

		// Module management procedures
createModule: publicProcedure
  .input(z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    courseId: z.string(),
    order: z.number().int().min(0),
    creatorId: z.string(),
    userRole: z.string(),
  }))
  .mutation(async ({ input }) => {
    if (input.userRole !== 'ADMIN') {
      throw new Error('Admin access required');
    }

    const database = getDb();
    
    // Verify user owns the course
    const course = await database.course.findFirst({
      where: { 
        id: input.courseId, 
        creatorId: input.creatorId 
      }
    });

    if (!course) {
      throw new Error('Course not found or access denied');
    }

    const module = await database.module.create({
      data: {
        title: input.title,
        description: input.description,
        courseId: input.courseId,
        order: input.order,
      },
      include: {
        _count: {
          select: { lessons: true }
        }
      }
    });

    return module;
  }),

getCourseModules: publicProcedure
  .input(z.object({
    courseId: z.string(),
  }))
  .query(async ({ input }) => {
    const database = getDb();
    
    const modules = await database.module.findMany({
      where: { courseId: input.courseId },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            type: true,
            order: true,
            estimatedDuration: true,
          }
        },
        _count: {
          select: { lessons: true }
        }
      },
      orderBy: { order: 'asc' }
    });

    return modules;
  }),

// Lesson management procedures
createLesson: publicProcedure
  .input(z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    content: z.string().optional(),
    type: z.enum(['TEXT', 'VIDEO', 'QUIZ', 'ASSIGNMENT', 'INTERACTIVE']).default('TEXT'),
    moduleId: z.string(),
    order: z.number().int().min(0),
    estimatedDuration: z.number().int().min(0).optional(),
    videoUrl: z.string().optional(),
    videoDuration: z.number().optional(), // Remove .int() - allow floats
    creatorId: z.string(),
    userRole: z.string(),
  }))
  .mutation(async ({ input }) => {
    if (input.userRole !== 'ADMIN') {
      throw new Error('Admin access required');
    }

    // DEBUG: Log what we received
    console.log('=== BACKEND CREATE LESSON DEBUG ===');
    console.log('Received input:', input);
    console.log('Video URL received:', input.videoUrl);
    console.log('Video Duration received:', input.videoDuration);
    console.log('===================================');

    const database = getDb();
    
    // Verify user owns the course that contains this module
    const module = await database.module.findFirst({
      where: { id: input.moduleId },
      include: {
        course: {
          select: { creatorId: true }
        }
      }
    });

    if (!module || module.course.creatorId !== input.creatorId) {
      throw new Error('Module not found or access denied');
    }

    const lessonData = {
      title: input.title,
      description: input.description,
      content: input.content,
      type: input.type,
      moduleId: input.moduleId,
      order: input.order,
      estimatedDuration: input.estimatedDuration,
      videoUrl: input.videoUrl,
      videoDuration: input.videoDuration ? Math.floor(input.videoDuration) : null, // Convert to int for database
    };

    // DEBUG: Log what we're saving to database
    console.log('Data being saved to database:', lessonData);

    const lesson = await database.lesson.create({
      data: lessonData
    });

    console.log('Created lesson:', lesson);
    console.log('==============================');

    return lesson;
  }),



getModuleLessons: publicProcedure
  .input(z.object({
    moduleId: z.string(),
  }))
  .query(async ({ input }) => {
    const database = getDb();
    
    const lessons = await database.lesson.findMany({
      where: { moduleId: input.moduleId },
      orderBy: { order: 'asc' }
    });

    return lessons;
  }),

updateModule: publicProcedure
  .input(z.object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    order: z.number().int().min(0).optional(),
    creatorId: z.string(),
    userRole: z.string(),
  }))
  .mutation(async ({ input }) => {
    if (input.userRole !== 'ADMIN') {
      throw new Error('Admin access required');
    }

    const database = getDb();
    
    const { id, creatorId, userRole, ...updateData } = input;
    
    // Verify ownership through course
    const module = await database.module.findFirst({
      where: { id },
      include: {
        course: { select: { creatorId: true } }
      }
    });

    if (!module || module.course.creatorId !== creatorId) {
      throw new Error('Module not found or access denied');
    }

    const updatedModule = await database.module.update({
      where: { id },
      data: updateData,
    });

    return updatedModule;
  }),

deleteModule: publicProcedure
  .input(z.object({
    id: z.string(),
    creatorId: z.string(),
    userRole: z.string(),
  }))
  .mutation(async ({ input }) => {
    if (input.userRole !== 'ADMIN') {
      throw new Error('Admin access required');
    }

    const database = getDb();
    
    // Verify ownership through course
    const module = await database.module.findFirst({
      where: { id: input.id },
      include: {
        course: { select: { creatorId: true } }
      }
    });

    if (!module || module.course.creatorId !== input.creatorId) {
      throw new Error('Module not found or access denied');
    }

    const deletedModule = await database.module.delete({
      where: { id: input.id },
    });

    return deletedModule;
  }),

	// Student course access procedures
getCourseForStudent: publicProcedure
  .input(z.object({
    courseId: z.string(),
    userId: z.string().optional(),
  }))
  .query(async ({ input }) => {
    const database = getDb();
    
    // Get course with modules and lessons
    const course = await database.course.findUnique({
      where: { 
        id: input.courseId,
        published: true // Only published courses
      },
      include: {
        creator: {
          select: { name: true }
        },
        category: {
          select: { name: true, color: true }
        },
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                description: true,
                type: true,
                order: true,
                estimatedDuration: true,
                // Don't include content/videoUrl yet - we'll load that separately for security
              }
            }
          }
        }
      }
    });

    if (!course) {
      throw new Error('Course not found or not published');
    }

    // If user provided, check enrollment
    let enrollment = null;
    if (input.userId) {
      enrollment = await database.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: input.userId,
            courseId: input.courseId
          }
        }
      });
    }

    return {
      course,
      isEnrolled: !!enrollment,
      enrollment
    };
  }),

getLessonContent: publicProcedure
  .input(z.object({
    lessonId: z.string(),
    userId: z.string(),
  }))
  .query(async ({ input }) => {
    const database = getDb();
    
    // Verify user is enrolled in the course containing this lesson
    const lesson = await database.lesson.findUnique({
      where: { id: input.lessonId },
      include: {
        module: {
          include: {
            course: true
          }
        },
        quizzes: {
          include: {
            questions: {
              orderBy: { order: 'asc' }
            }
          }
        },
        assignments: true,
				interactiveContents: true,
      }
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const enrollment = await database.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: input.userId,
          courseId: lesson.module.course.id
        }
      }
    });

    if (!enrollment) {
      throw new Error('Not enrolled in this course');
    }

    // Get or create lesson progress
    const progress = await database.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: input.userId,
          lessonId: input.lessonId
        }
      },
      update: {},
      create: {
        userId: input.userId,
        lessonId: input.lessonId,
        completed: false,
        watchTime: 0
      }
    });

    return {
      lesson,
      progress
    };
  }),

markLessonComplete: publicProcedure
  .input(z.object({
    lessonId: z.string(),
    userId: z.string(),
    watchTime: z.number().int().min(0).optional(),
  }))
  .mutation(async ({ input }) => {
    const database = getDb();
    
    // Update lesson progress
    const progress = await database.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: input.userId,
          lessonId: input.lessonId
        }
      },
      update: {
        completed: true,
        completedAt: new Date(),
        watchTime: input.watchTime || 0
      },
      create: {
        userId: input.userId,
        lessonId: input.lessonId,
        completed: true,
        completedAt: new Date(),
        watchTime: input.watchTime || 0
      }
    });

    // Update enrollment progress
    const lesson = await database.lesson.findUnique({
      where: { id: input.lessonId },
      include: {
        module: {
          include: {
            course: {
              include: {
                modules: {
                  include: {
                    lessons: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (lesson) {
      const totalLessons = lesson.module.course.modules.reduce(
        (total, module) => total + module.lessons.length, 0
      );

      const completedLessons = await database.lessonProgress.count({
        where: {
          userId: input.userId,
          completed: true,
          lesson: {
            module: {
              courseId: lesson.module.course.id
            }
          }
        }
      });

      const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

      await database.enrollment.update({
        where: {
          userId_courseId: {
            userId: input.userId,
            courseId: lesson.module.course.id
          }
        },
        data: {
          progress: progressPercentage,
          lastAccessedAt: new Date(),
          completedAt: progressPercentage >= 100 ? new Date() : null
        }
      });
    }

    return progress;
  }),

	// Quiz management procedures
createQuiz: publicProcedure
  .input(z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    lessonId: z.string(),
    timeLimit: z.number().int().nullable().optional(), // Changed: allow null/undefined
    maxAttempts: z.number().int().min(1).default(1),
    passingScore: z.number().min(0).max(100).default(70),
    shuffleQuestions: z.boolean().default(false),
    showResults: z.boolean().default(true),
    showCorrectAnswers: z.boolean().default(true),
    questions: z.array(z.object({
      type: z.enum(['MULTIPLE_CHOICE', 'MULTIPLE_SELECT', 'TRUE_FALSE', 'FILL_BLANK', 'SHORT_ANSWER']),
      question: z.string().min(1),
      content: z.any(),
      correctAnswer: z.any(),
      explanation: z.string().optional(),
      points: z.number().int().min(1).default(1),
      order: z.number().int().min(0),
    })),
    creatorId: z.string(),
    userRole: z.string(),
  }))
  .mutation(async ({ input }) => {
    if (input.userRole !== 'ADMIN') {
      throw new Error('Admin access required');
    }

    const database = getDb();
    
    // Verify user owns the lesson
    const lesson = await database.lesson.findFirst({
      where: { id: input.lessonId },
      include: {
        module: {
          include: {
            course: { select: { creatorId: true } }
          }
        }
      }
    });

    if (!lesson || lesson.module.course.creatorId !== input.creatorId) {
      throw new Error('Lesson not found or access denied');
    }

    const { questions, creatorId, userRole, ...quizData } = input;

    // Debug: Log what we're creating
    console.log('=== BACKEND CREATE QUIZ DEBUG ===');
    console.log('Quiz data received:', quizData);
    console.log('Questions received:', questions);
    console.log('Time limit value:', input.timeLimit);
    console.log('Time limit type:', typeof input.timeLimit);

    const quiz = await database.quiz.create({
      data: {
        ...quizData,
        timeLimit: input.timeLimit || null, // Ensure null if undefined
        questions: {
          create: questions.map(q => ({
            type: q.type,
            question: q.question,
            content: q.content,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            points: q.points,
            order: q.order,
          }))
        }
      },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    });

    console.log('Quiz created successfully:', quiz);
    console.log('===================================');

    return quiz;
  }),

getQuiz: publicProcedure
  .input(z.object({
    quizId: z.string(),
    userId: z.string().optional(),
  }))
  .query(async ({ input }) => {
    const database = getDb();
    
    const quiz = await database.quiz.findUnique({
      where: { id: input.quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        },
        lesson: {
          include: {
            module: {
              include: {
                course: true
              }
            }
          }
        }
      }
    });

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Check if user is enrolled (if userId provided)
    if (input.userId) {
      const enrollment = await database.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: input.userId,
            courseId: quiz.lesson.module.course.id
          }
        }
      });

      if (!enrollment) {
        throw new Error('Not enrolled in this course');
      }
    }

    return quiz;
  }),

submitQuizAttempt: publicProcedure
  .input(z.object({
    quizId: z.string(),
    userId: z.string(),
    answers: z.any(), // User's answers
    timeSpent: z.number().int().optional(),
  }))
  .mutation(async ({ input }) => {
    const database = getDb();
    
    // Get quiz with questions
    const quiz = await database.quiz.findUnique({
      where: { id: input.quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        },
        lesson: {
          include: {
            module: {
              include: {
                course: true
              }
            }
          }
        }
      }
    });

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Check enrollment
    const enrollment = await database.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: input.userId,
          courseId: quiz.lesson.module.course.id
        }
      }
    });

    if (!enrollment) {
      throw new Error('Not enrolled in this course');
    }

    // Check if user has attempts remaining
    const existingAttempts = await database.quizAttempt.count({
      where: {
        userId: input.userId,
        quizId: input.quizId
      }
    });

    if (existingAttempts >= quiz.maxAttempts) {
      throw new Error('Maximum attempts exceeded');
    }

    // Calculate score
    const { score, pointsEarned, totalPoints } = calculateQuizScore(quiz.questions, input.answers);
    const passed = score >= quiz.passingScore;

    // Create attempt
    const attempt = await database.quizAttempt.create({
      data: {
        userId: input.userId,
        quizId: input.quizId,
        answers: input.answers,
        score,
        pointsEarned,
        totalPoints,
        passed,
        timeSpent: input.timeSpent,
        completedAt: new Date(),
        submittedAt: new Date(),
      }
    });

    return {
      attempt,
      score,
      passed,
      totalPoints,
      pointsEarned,
    };
  }),

getUserQuizAttempts: publicProcedure
  .input(z.object({
    quizId: z.string(),
    userId: z.string(),
  }))
  .query(async ({ input }) => {
    const database = getDb();
    
    const attempts = await database.quizAttempt.findMany({
      where: {
        quizId: input.quizId,
        userId: input.userId,
      },
      orderBy: { startedAt: 'desc' }
    });

    return attempts;
  }),


getUserCourseProgress: publicProcedure
  .input(z.object({
    courseId: z.string(),
    userId: z.string(),
  }))
  .query(async ({ input }) => {
    const database = getDb();
    
    const lessonProgress = await database.lessonProgress.findMany({
      where: {
        userId: input.userId,
        lesson: {
          module: {
            courseId: input.courseId
          }
        }
      },
      include: {
        lesson: {
          select: { id: true, moduleId: true }
        }
      }
    });

    return lessonProgress;
  }),	

	// Add these assignment procedures
createAssignment: publicProcedure
  .input(z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    instructions: z.string().min(1, 'Instructions are required'),
    lessonId: z.string(),
    dueDate: z.string().optional(), // ISO date string
    maxPoints: z.number().int().min(1).default(100),
    allowLateSubmission: z.boolean().default(false),
    maxFileSize: z.number().int().min(1).max(100).default(10), // MB
    allowedFileTypes: z.array(z.string()).default(['pdf', 'doc', 'docx']),
    creatorId: z.string(),
    userRole: z.string(),
  }))
  .mutation(async ({ input }) => {
    if (input.userRole !== 'ADMIN') {
      throw new Error('Admin access required');
    }

    const database = getDb();
    
    // Verify user owns the lesson
    const lesson = await database.lesson.findFirst({
      where: { id: input.lessonId },
      include: {
        module: {
          include: {
            course: { select: { creatorId: true } }
          }
        }
      }
    });

    if (!lesson || lesson.module.course.creatorId !== input.creatorId) {
      throw new Error('Lesson not found or access denied');
    }

    const { creatorId, userRole, ...assignmentData } = input;

    console.log('=== BACKEND CREATE ASSIGNMENT DEBUG ===');
    console.log('Assignment data received:', assignmentData);

    const assignment = await database.assignment.create({
      data: {
        ...assignmentData,
        dueDate: assignmentData.dueDate ? new Date(assignmentData.dueDate) : null,
      }
    });

    console.log('Assignment created successfully:', assignment);
    console.log('=========================================');

    return assignment;
  }),

getAssignment: publicProcedure
  .input(z.object({
    assignmentId: z.string(),
    userId: z.string().optional(),
  }))
  .query(async ({ input }) => {
    const database = getDb();
    
    const assignment = await database.assignment.findUnique({
      where: { id: input.assignmentId },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: true
              }
            }
          }
        },
        submissions: input.userId ? {
          where: { userId: input.userId }
        } : false
      }
    });

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    // Check if user is enrolled (if userId provided)
    if (input.userId) {
      const enrollment = await database.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: input.userId,
            courseId: assignment.lesson.module.course.id
          }
        }
      });

      if (!enrollment) {
        throw new Error('Not enrolled in this course');
      }
    }

    return assignment;
  }),

submitAssignment: publicProcedure
  .input(z.object({
    assignmentId: z.string(),
    userId: z.string(),
    content: z.string().optional(), // Text submission
    fileUrl: z.string().optional(), // File submission URL
    fileName: z.string().optional(), // Original file name
  }))
  .mutation(async ({ input }) => {
    const database = getDb();
    
    // Get assignment details
    const assignment = await database.assignment.findUnique({
      where: { id: input.assignmentId },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: true
              }
            }
          }
        }
      }
    });

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    // Check enrollment
    const enrollment = await database.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: input.userId,
          courseId: assignment.lesson.module.course.id
        }
      }
    });

    if (!enrollment) {
      throw new Error('Not enrolled in this course');
    }

    // Check if submission already exists
    const existingSubmission = await database.assignmentSubmission.findUnique({
      where: {
        userId_assignmentId: {
          userId: input.userId,
          assignmentId: input.assignmentId
        }
      }
    });

    // Check if due date has passed (if not allowing late submissions)
    const now = new Date();
    const isLate = assignment.dueDate && now > assignment.dueDate;
    
    if (isLate && !assignment.allowLateSubmission) {
      throw new Error('Assignment deadline has passed and late submissions are not allowed');
    }

    const submissionData = {
      userId: input.userId,
      assignmentId: input.assignmentId,
      content: input.content,
      fileUrl: input.fileUrl,
      fileName: input.fileName,
      isLate: isLate || false,
      status: 'SUBMITTED' as const,
      submittedAt: new Date(),
    };

    let submission;
    if (existingSubmission) {
      // Update existing submission
      submission = await database.assignmentSubmission.update({
        where: { id: existingSubmission.id },
        data: submissionData
      });
    } else {
      // Create new submission
      submission = await database.assignmentSubmission.create({
        data: submissionData
      });
    }

    return submission;
  }),

getUserAssignmentSubmission: publicProcedure
  .input(z.object({
    assignmentId: z.string(),
    userId: z.string(),
  }))
  .query(async ({ input }) => {
    const database = getDb();
    
    const submission = await database.assignmentSubmission.findUnique({
      where: {
        userId_assignmentId: {
          userId: input.userId,
          assignmentId: input.assignmentId
        }
      },
      include: {
        assignment: true
      }
    });

    return submission;
  }),

	// Interactive content procedures
createInteractiveContent: publicProcedure
  .input(z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    type: z.enum(['DRAG_DROP', 'HOTSPOT', 'SEQUENCE', 'MATCHING', 'TIMELINE', 'SIMULATION', 'WIDGET', 'H5P']),
    config: z.any(), // JSON configuration
    content: z.any(), // JSON content data
    lessonId: z.string(),
    maxAttempts: z.number().int().min(1).default(1),
    passingScore: z.number().min(0).max(100).nullable().optional(),
    showFeedback: z.boolean().default(true),
    allowReplay: z.boolean().default(true),
    timeLimit: z.number().int().nullable().optional(),
    creatorId: z.string(),
    userRole: z.string(),
  }))
  .mutation(async ({ input }) => {
    if (input.userRole !== 'ADMIN') {
      throw new Error('Admin access required');
    }

    const database = getDb();
    
    // Verify user owns the lesson
    const lesson = await database.lesson.findFirst({
      where: { id: input.lessonId },
      include: {
        module: {
          include: {
            course: { select: { creatorId: true } }
          }
        }
      }
    });

    if (!lesson || lesson.module.course.creatorId !== input.creatorId) {
      throw new Error('Lesson not found or access denied');
    }

    const { creatorId, userRole, ...interactiveData } = input;

    console.log('=== BACKEND CREATE INTERACTIVE CONTENT DEBUG ===');
    console.log('Interactive data received:', interactiveData);

    const interactiveContent = await database.interactiveContent.create({
      data: interactiveData
    });

    console.log('Interactive content created successfully:', interactiveContent);
    console.log('=================================================');

    return interactiveContent;
  }),

getInteractiveContent: publicProcedure
  .input(z.object({
    contentId: z.string(),
    userId: z.string().optional(),
  }))
  .query(async ({ input }) => {
    const database = getDb();
    
    const interactiveContent = await database.interactiveContent.findUnique({
      where: { id: input.contentId },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: true
              }
            }
          }
        },
        attempts: input.userId ? {
          where: { userId: input.userId },
          orderBy: { startedAt: 'desc' }
        } : false
      }
    });

    if (!interactiveContent) {
      throw new Error('Interactive content not found');
    }

    // Check if user is enrolled (if userId provided)
    if (input.userId) {
      const enrollment = await database.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: input.userId,
            courseId: interactiveContent.lesson.module.course.id
          }
        }
      });

      if (!enrollment) {
        throw new Error('Not enrolled in this course');
      }
    }

    return interactiveContent;
  }),

submitInteractiveAttempt: publicProcedure
  .input(z.object({
    contentId: z.string(),
    userId: z.string(),
    responses: z.any(), // User's interaction responses
    timeSpent: z.number().int().optional(),
    completed: z.boolean().default(true),
  }))
  .mutation(async ({ input }) => {
    const database = getDb();
    
    // Get interactive content details
    const interactiveContent = await database.interactiveContent.findUnique({
      where: { id: input.contentId },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: true
              }
            }
          }
        }
      }
    });

    if (!interactiveContent) {
      throw new Error('Interactive content not found');
    }

    // Check enrollment
    const enrollment = await database.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: input.userId,
          courseId: interactiveContent.lesson.module.course.id
        }
      }
    });

    if (!enrollment) {
      throw new Error('Not enrolled in this course');
    }

    // Check attempt limits
    const existingAttempts = await database.interactiveAttempt.count({
      where: {
        userId: input.userId,
        contentId: input.contentId
      }
    });

    if (existingAttempts >= interactiveContent.maxAttempts) {
      throw new Error('Maximum attempts exceeded');
    }

    // Calculate score based on interactive type and responses
    const score = calculateInteractiveScore(interactiveContent, input.responses);

    // Create attempt
    const attempt = await database.interactiveAttempt.create({
      data: {
        userId: input.userId,
        contentId: input.contentId,
        responses: input.responses,
        score,
        completed: input.completed,
        timeSpent: input.timeSpent,
        completedAt: input.completed ? new Date() : null,
      }
    });

    return {
      attempt,
      score,
      passed: interactiveContent.passingScore ? score >= interactiveContent.passingScore : true,
    };
  }),

getUserInteractiveAttempts: publicProcedure
  .input(z.object({
    contentId: z.string(),
    userId: z.string(),
  }))
  .query(async ({ input }) => {
    const database = getDb();
    
    const attempts = await database.interactiveAttempt.findMany({
      where: {
        contentId: input.contentId,
        userId: input.userId,
      },
      orderBy: { startedAt: 'desc' }
    });

    return attempts;
  }),






















});


	
export type AppRouter = typeof appRouter;