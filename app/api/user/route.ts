import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const { name, email } = await req.json()

        console.log('Received user data:', { name, email })

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        console.log('Attempting to upsert user...')
        const user = await prisma.user.upsert({
            where: { email },
            update: { name },
            create: {
                email,
                name,
                role: 'user',
                isActive: true
            },
        })

        console.log('User created/updated successfully:', user.id)
        return NextResponse.json(user)
    } catch (error) {
        console.error('Detailed error creating user:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({
            error: 'Failed to create user',
            details: errorMessage
        }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const email = searchParams.get('email')

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json(user)
    } catch (error) {
        console.error('Error fetching user:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({
            error: 'Failed to fetch user',
            details: errorMessage
        }, { status: 500 })
    }
}
