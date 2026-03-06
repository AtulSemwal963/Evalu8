import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || ''); // Please set your actual key in .env

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        // Basic validation
        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }
        if (!password || password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'Email is already registered. Please sign in.' }, { status: 400 });
        }

        // Generate 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash the password securely to store in Redis temporarily
        const hashedPassword = await bcrypt.hash(password, 10);

        // Map it via Redis (Upstash)
        // Set an expiry of 10 minutes (600 seconds)
        await redis.set(email, { code, password: hashedPassword }, { ex: 600 });

        // Send email via SendGrid
        if (process.env.SENDGRID_API_KEY) {
            const msg = {
                to: email,
                from: process.env.SENDGRID_FROM_EMAIL || 'test@example.com', // Must be verified sender in SendGrid
                subject: 'Verify your Evalu8 Account',
                text: `Your verification code is ${code}`,
                html: `<strong>Your verification code is ${code}</strong>`,
            };
            await sgMail.send(msg);
        } else {
            console.log("No SendGrid key found. Printing code to console instead:", code);
        }

        return NextResponse.json({ success: true, message: 'Verification email sent' });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Failed to process signup' }, { status: 500 });
    }
}
