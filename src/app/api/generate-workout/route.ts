import { NextRequest, NextResponse } from 'next/server';
import { isRateLimited } from '@/utils/rateLimit';
import { generateWorkout } from '@/utils/api';
import { initDatabase } from '@/utils/database';
import * as z from 'zod';

const USER_DAILY_LIMIT = 3;

const schema = z.object({
    firstName: z.string().optional(),
    age: z.number().min(18, { message: "Age must be at least 18" }).max(120, { message: "Age must not exceed 120" }),
    gender: z.enum(["male", "female", "other"], { errorMap: () => ({ message: "Please select a gender" }) }),
    height: z.union([z.number(), z.string()]).optional().transform((val) => (val === '' ? undefined : Number(val))),
    heightUnit: z.enum(["cm", "ft"]).optional(),
    weight: z.union([z.number(), z.string()]).optional().transform((val) => (val === '' ? undefined : Number(val))),
    weightUnit: z.enum(["kg", "lbs"]).optional(),
    goal: z.array(z.enum([
        "Build muscles",
        "Lose weight",
        "Be more tonic and athletic",
        "Improve mental health",
        "Sleep better at night",
        "Increase flexibility",
        "Enhance cardiovascular health",
        "Boost energy levels"
    ])).min(1, { message: "Please select at least one fitness goal" }),
    type: z.array(z.enum([
        "Bodyweight",
        "At the gym",
        "Cardiovascular Workouts",
        "Strength Training",
        "Flexibility and Balance Workouts",
        "High-Intensity Interval Training (HIIT)",
        "Circuit Training",
        "Functional Training"
    ])).min(1, { message: "Please select at least one workout type" }),
    equipment: z.array(z.enum([
        "Barbells",
        "Dumbbells",
        "Kettlebells",
        "Resistance bands",
        "Cable machine",
        "Treadmill",
        "Stationary bike",
        "Weight machines"
    ])).optional(),
    frequency: z.enum(["2", "3", "4", "5", "6"], { errorMap: () => ({ message: "Please select a workout frequency" }) }),
    trainingDays: z.array(z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])).optional(),
    level: z.enum(["beginner", "intermediate", "advanced"], { errorMap: () => ({ message: "Please select a fitness level" }) }),
    duration: z.union([z.number(), z.string()]).optional().transform((val) => (val === '' ? undefined : Number(val))),
    sessionDuration: z.union([z.number(), z.string()]).optional().transform((val) => (val === '' ? undefined : Number(val))),
    email: z.string().email({ message: "Invalid email address" }),
});

// Initialize the database
initDatabase().catch(console.error);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const validationResult = schema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({ error: validationResult.error.issues[0].message }, { status: 400 });
        }

        const {
            type,
            goal,
            frequency,
            equipment,
            trainingDays,
            height,
            weight,
            heightUnit,
            weightUnit,
            duration,
            sessionDuration,
            ...otherData
        } = validationResult.data;

        const workoutParams = {
            ...otherData,
            type: type.join(', '),
            goal: goal.join(', '),
            frequency: parseInt(frequency, 10),
            equipment: equipment?.join(', '),
            days: trainingDays?.join(', '),
            height: height ? `${height} ${heightUnit || ''}`.trim() : undefined,
            weight: weight ? `${weight} ${weightUnit || ''}`.trim() : undefined,
            duration: duration,
            session_duration_minutes: sessionDuration
        };

        const rateLimited = await isRateLimited(workoutParams.email, USER_DAILY_LIMIT);
        if (rateLimited) {
            return NextResponse.json({ error: 'Daily limit reached. Please try again tomorrow.' }, { status: 429 });
        }

        const result = await generateWorkout(workoutParams);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to generate workout:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}