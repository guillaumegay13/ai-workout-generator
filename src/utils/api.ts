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
    const response = await fetch('/api/generate-workout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        throw new Error('Failed to generate workout');
    }

    return response.json();
}