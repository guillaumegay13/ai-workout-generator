import { RateLimitStatus, checkRateLimit } from './rateLimit';

const emailLimit = 3; // 3 emails per day
const globalLimit = 1000; // 1000 total requests per day

interface WorkoutParams {
    type: string;
    gender: string;
    level: string;
    frequency: number;
    days?: string;
    goal: string;
    height?: string;
    weight?: string;
    age: number;
    duration?: number;
    weight_unit?: string;
    height_unit?: string;
    session_duration_minutes?: number;
    firstname?: string;
    email: string;
    equipment?: string;
}

interface Exercise {
    name: string;
    sets: number;
    reps: number;
}

interface Session {
    sessionNumber: number;
    sessionName: string;
    description: string;
    exercises: Exercise[];
}

interface Week {
    weekNumber: number;
    weekDescription: string;
    sessions: Session[];
}

interface WorkoutData {
    program: {
        programName: string;
        programDescription: string;
        methodUsed: string;
        scientificEvidence: string;
        personalization: {
            age: number;
            height_cm: number;
            weight_kg: number;
            fitness_level: string;
            goals: string;
        };
        weeks: Week[];
    };
}

export async function generateWorkout(params: WorkoutParams): Promise<WorkoutData> {
    const endpoint = process.env.GENERATE_WORKOUT_ENDPOINT;

    if (!endpoint) {
        throw new Error('Workout generation endpoint is not configured.');
    }

    const status = await checkRateLimit(params.email, emailLimit, globalLimit);

    switch (status) {
        case RateLimitStatus.OK:
            // Proceed with the request
            break;
        case RateLimitStatus.EMAIL_LIMIT_EXCEEDED:
            throw new Error('You have exceeded your daily request limit. Please try again tomorrow.');
        case RateLimitStatus.GLOBAL_LIMIT_EXCEEDED:
            throw new Error('Our system is currently experiencing high demand. Please try again later.');
    }


    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        throw new Error(`Failed to generate workout: ${response.status} ${response.statusText}`);
    }

    return response.json();
}