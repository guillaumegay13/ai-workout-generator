import { isRateLimited } from './rateLimit';

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

    // Check rate limit before making the API call
    const isLimited = await isRateLimited(params.email, 3);
    if (isLimited) {
        throw new Error('Rate limit exceeded. Please try again later.');
    }

    console.log(isLimited)


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