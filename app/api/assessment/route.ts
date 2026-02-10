import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { assessmentDetails, questions, userId } = body

        console.log('Saving assessment:', {
            id: assessmentDetails.id,
            title: assessmentDetails.title,
            questionCount: questions.length,
            userId
        })

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        const assessmentData = {
            title: assessmentDetails.title || 'Untitled Assessment',
            filename: assessmentDetails.filename || 'Untitled Assessment',
            description: assessmentDetails.description || '',
            status: assessmentDetails.status || 'draft',
            type: assessmentDetails.type || 'mcq',
            mode: assessmentDetails.mode || 'formative',
            subject: assessmentDetails.subject || '',
            duration: assessmentDetails.duration || 45,
            instructions: assessmentDetails.instructions || '',
            questionCount: questions.length,
            difficulty: assessmentDetails.difficulty || 'medium',
            bloomLevel: assessmentDetails.bloomLevel || '',
            learningObjective: assessmentDetails.learningObjective || '',

            // Settings
            timerEnabled: true,
            allowNavigation: true,
            showResults: true,
            passingScore: assessmentDetails.passingScore || 70,
            allowRetakes: assessmentDetails.allowRetakes || false,
            maxRetries: assessmentDetails.maxRetakes || 3,
            showFeedback: assessmentDetails.showFeedback !== false,
            randomizeQuestions: assessmentDetails.randomizeQuestions || false,

            // Metadata
            isPublished: assessmentDetails.status === 'published',
            isTemplate: false,
            tags: [],
        }

        const questionData = questions.map((q: any, index: number) => ({
            type: q.type || 'mcq',
            stem: q.stem || '',
            order: index,

            // MCQ fields
            options: q.options || [],
            correctAnswers: q.correctAnswers || [],
            explanation: q.explanation || '',
            allowMultipleAnswers: q.allowMultipleAnswers || false,
            distractorFeedback: q.distractorFeedback || null,

            // Reordering fields
            items: q.items || null,
            correctOrder: q.correctOrder || [],
            orderingInstructions: q.instructions || '',

            // Hotspot fields
            zones: q.zones || null,
            imageUrl: q.imageUrl || '',
            imageAlt: '',
            hotspotInstructions: q.instructions || '',

            // Common metadata
            bloomLevel: q.bloomLevel || 'understand',
            difficulty: q.difficulty || 'medium',
            points: 1,
            timeLimit: null,
            tags: [],
        }))

        let assessment

        if (assessmentDetails.id) {
            // UPDATE existing assessment
            console.log('Updating existing assessment:', assessmentDetails.id)

            // Delete old questions first
            await prisma.question.deleteMany({
                where: { assessmentId: assessmentDetails.id }
            })

            // Update assessment with new questions
            assessment = await prisma.assessment.update({
                where: { id: assessmentDetails.id },
                data: {
                    ...assessmentData,
                    questions: {
                        create: questionData
                    }
                },
                include: {
                    questions: true
                }
            })
        } else {
            // CREATE new assessment
            console.log('Creating new assessment')

            assessment = await prisma.assessment.create({
                data: {
                    ...assessmentData,
                    authorId: userId,
                    questions: {
                        create: questionData
                    }
                },
                include: {
                    questions: true
                }
            })
        }

        console.log('Assessment saved successfully:', assessment.id)

        return NextResponse.json({
            success: true,
            assessmentId: assessment.id,
            message: assessmentDetails.status === 'published'
                ? 'Assessment published successfully!'
                : 'Draft saved successfully!'
        })
    } catch (error) {
        console.error('Detailed error saving assessment:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({
            error: 'Failed to save assessment',
            details: errorMessage
        }, { status: 500 })
    }
}

// GET endpoint to retrieve assessments
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get('userId')
        const assessmentId = searchParams.get('id')

        if (assessmentId) {
            // Fetch single assessment with questions
            const assessment = await prisma.assessment.findUnique({
                where: { id: assessmentId },
                include: {
                    questions: {
                        orderBy: {
                            order: 'asc'
                        }
                    }
                }
            })

            if (!assessment) {
                return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
            }

            return NextResponse.json({ assessment })
        } else if (userId) {
            // Fetch all assessments for user
            const assessments = await prisma.assessment.findMany({
                where: {
                    authorId: userId
                },
                include: {
                    questions: {
                        orderBy: {
                            order: 'asc'
                        }
                    }
                },
                orderBy: {
                    updatedAt: 'desc'
                }
            })

            return NextResponse.json({ assessments })
        } else {
            return NextResponse.json({ error: 'User ID or Assessment ID is required' }, { status: 400 })
        }
    } catch (error) {
        console.error('Error fetching assessments:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({
            error: 'Failed to fetch assessments',
            details: errorMessage
        }, { status: 500 })
    }
}
