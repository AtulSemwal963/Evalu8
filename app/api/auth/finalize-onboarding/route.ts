import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { redis } from '@/lib/redis';

export async function POST(req: Request) {
    try {
        const { email, name, profilePicture, role, onboardingResponses, loginMethod, authToken } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        let password = null;
        if (loginMethod === 'email') {
            // Retrieve the temporarily stored hashed password from the verification step
            const storedData = await redis.get(`verified:${email}`);
            if (!storedData) {
                return NextResponse.json({ error: 'Session expired. Please sign up and verify your email again.' }, { status: 400 });
            }
            password = storedData as string;
        }

        // Upsert user so this works seamlessly whether they just created an account natively,
        // or just logged in via Google OAuth for the first time without an account.
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                name,
                profilePicture,
                role,
                onboardingResponses,
                authToken,
            },
            create: {
                email,
                name,
                password,
                profilePicture,
                role,
                onboardingResponses,
                loginMethod: loginMethod || 'email',
                authToken,
                isVerified: true // Auto true since they either passed email flow or OAuth flow
            }
        });

        // Cleanup the temporary password cache
        if (loginMethod === 'email') {
            await redis.del(`verified:${email}`);
        }

        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.error('Finalize onboarding error:', error);
        return NextResponse.json({ error: 'Failed to finalize profile' }, { status: 500 });
    }
}
