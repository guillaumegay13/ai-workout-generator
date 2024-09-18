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

let cachedEndpoint: string | null = null;

async function getEndpoint(): Promise<string> {
    if (cachedEndpoint) return cachedEndpoint;

    const response = await fetch('/api/workout-endpoint');
    if (!response.ok) {
        throw new Error('Failed to fetch workout endpoint');
    }
    const data = await response.json();
    cachedEndpoint = data.endpoint;
    if (!cachedEndpoint) {
        throw new Error('Invalid endpoint received');
    }
    return cachedEndpoint;
}

export async function generateWorkout(params: WorkoutParams): Promise<WorkoutData> {
    const endpoint = await getEndpoint();

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