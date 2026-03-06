import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Check user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: 'user not found, please create an account and sign up first' }, { status: 404 });
        }

        if (user.loginMethod !== 'email') {
            return NextResponse.json({ error: `Please sign in with your ${user.loginMethod} account` }, { status: 400 });
        }

        if (!user.password) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            message: 'Signed in successfully!',
            user: {
                email: user.email,
                name: user.name,
                profilePicture: user.profilePicture,
                role: user.role,
                onboardingResponses: user.onboardingResponses
            }
        });

    } catch (error) {
        console.error('Sign-in error:', error);
        return NextResponse.json({ error: 'Failed to sign in' }, { status: 500 });
    }
}
