import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { email, code } = await req.json();

        if (!email || !code) {
            return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
        }

        const dataStr = await redis.get<any>(email);
        if (!dataStr) {
            return NextResponse.json({ error: 'Code expired or invalid' }, { status: 400 });
        }

        const data = typeof dataStr === 'string' ? JSON.parse(dataStr) : dataStr;
        if (data.code !== code) {
            return NextResponse.json({ error: 'Incorrect verification code' }, { status: 400 });
        }

        // Success! Set a verified flag in redis to persist the password for finalization
        await redis.set(`verified:${email}`, data.password, { ex: 3600 }); // Keep for 1 hour

        // Delete the original code from redis since it is verified
        await redis.del(email);

        return NextResponse.json({
            success: true,
            message: 'Account verified successfully!',
            user: { email }
        });

    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 });
    }
}
