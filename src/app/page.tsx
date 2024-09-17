'use client'

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { generateWorkout } from '@/utils/api';
import React, { useRef, useEffect, useState } from 'react';
import TagSelect from './components/TagSelect';
import AppPromoPopup from './components/AppPromoPopup';

// Update the schema for optional numeric fields
const schema = z.object({
  firstName: z.string().optional(),
  age: z.number().min(18, { message: "Age must be at least 18" }).max(120, { message: "Age must not exceed 120" }),
  gender: z.enum(["male", "female", "other"], { errorMap: () => ({ message: "Please select a gender" }) }),
  height: z.union([z.number(), z.string()]).optional().transform((val) => (val === '' ? undefined : Number(val))),
  heightUnit: z.enum(["cm", "ft"]).optional(),
  weight: z.union([z.number(), z.string()]).optional().transform((val) => (val === '' ? undefined : Number(val))),
  weightUnit: z.enum(["kg", "lbs"]).optional(),
  goal: z.enum(["Build muscles", "Lose weight", "Be more tonic and athletic"], { errorMap: () => ({ message: "Please select a goal" }) }),
  type: z.enum(["Bodyweight", "At the gym"], { errorMap: () => ({ message: "Please select a workout type" }) }),
  frequency: z.enum(["2", "3", "4", "5", "6"], { errorMap: () => ({ message: "Please select a workout frequency" }) }),
  trainingDays: z.array(z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])).optional(),
  level: z.enum(["beginner", "intermediate", "advanced"], { errorMap: () => ({ message: "Please select a fitness level" }) }),
  duration: z.union([z.number(), z.string()]).optional().transform((val) => (val === '' ? undefined : Number(val))),
  sessionDuration: z.union([z.number(), z.string()]).optional().transform((val) => (val === '' ? undefined : Number(val))),
  email: z.string().email({ message: "Invalid email address" }),
});

type FormData = z.infer<typeof schema>;

interface Exercise {
  name: string;
  description: string;
  execution: string;
  sets: number;
  reps: number | string;
  rest_in_seconds: number;
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

export default function Home() {
  const { register, handleSubmit, formState: { errors }, control } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const [workout, setWorkout] = React.useState<WorkoutData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const workoutRef = useRef<HTMLDivElement>(null);
  const [isPromoPopupOpen, setIsPromoPopupOpen] = React.useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (workout && workoutRef.current) {
      const scrollOptions: ScrollIntoViewOptions = {
        behavior: 'smooth',
        block: 'start',
      };

      setTimeout(() => {
        workoutRef.current?.scrollIntoView(scrollOptions);
      }, 100);
    }
  }, [workout]);

  useEffect(() => {
    // Check if the user is on an iOS device
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
  }, []);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setIsPromoPopupOpen(true); // Open the popup as soon as generation starts

    try {
      const apiPayload = {
        type: data.type.toLowerCase(),
        gender: data.gender,
        level: data.level,
        frequency: parseInt(data.frequency),
        days: data.trainingDays && data.trainingDays.length > 0 ? data.trainingDays.join(',') : undefined,
        goal: data.goal.toLowerCase().replace(/\s+/g, '_'),
        height: data.height || undefined,
        weight: data.weight || undefined,
        age: data.age,
        duration: data.duration || undefined,
        weight_unit: data.weightUnit || undefined,
        height_unit: data.heightUnit || undefined,
        session_duration_minutes: data.sessionDuration || undefined,
        firstname: data.firstName || undefined,
        email: data.email
      };

      const result = await generateWorkout(apiPayload);
      setWorkout(result as WorkoutData);
    } catch (error) {
      console.error('Failed to generate workout:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setLoading(false);
      // Don't close the popup here, let the user close it manually
    }
  };

  const handleDownloadApp = () => {
    const iosAppStoreUrl = 'https://apps.apple.com/app/your-ios-app-id'; // Replace with your actual iOS App Store URL
    const androidPlayStoreUrl = 'https://play.google.com/store/apps/details?id=your.android.package.name'; // Replace with your actual Google Play Store URL

    window.open(isIOS ? iosAppStoreUrl : androidPlayStoreUrl, '_blank');
  };

  return (
    <main className="container mx-auto px-4 py-8 text-white">
      <h1 className="text-3xl font-bold mb-4">AI Workout Generator</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mb-4 space-y-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-white mb-2">First Name (optional)</label>
          <input
            id="firstName"
            {...register('firstName')}
            className="mt-1 block w-full px-3 py-2 bg-gray-600 text-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.firstName && <p className="mt-2 text-sm text-red-600">{errors.firstName.message}</p>}
        </div>

        <div>
          <label htmlFor="age" className="block text-sm font-medium text-white mb-2">Age *</label>
          <input
            id="age"
            type="number"
            {...register('age', { valueAsNumber: true, required: "Age is required" })}
            className="mt-1 block w-full px-3 py-2 bg-gray-600 text-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.age && <p className="mt-2 text-sm text-red-600">{errors.age.message}</p>}
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-white mb-2">Gender *</label>
          <Controller
            name="gender"
            control={control}
            rules={{ required: "Gender is required" }}
            render={({ field }) => (
              <TagSelect
                options={["male", "female", "other"]}
                value={field.value}
                onChange={field.onChange}
                error={errors.gender?.message}
              />
            )}
          />
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <label htmlFor="height" className="block text-sm font-medium text-white mb-2">Height (optional)</label>
            <input
              id="height"
              type="number"
              {...register('height', {
                setValueAs: (v: string) => v === "" ? undefined : parseFloat(v)
              })}
              className="mt-1 block w-full px-3 py-2 bg-gray-600 text-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.height && <p className="mt-2 text-sm text-red-600">{errors.height.message}</p>}
          </div>
          <div>
            <label htmlFor="heightUnit" className="block text-sm font-medium text-white mb-2">Unit</label>
            <select
              id="heightUnit"
              {...register('heightUnit')}
              className="mt-1 block w-full px-3 py-2 bg-gray-600 text-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="cm">cm</option>
              <option value="ft">ft</option>
            </select>
            {errors.heightUnit && <p className="mt-2 text-sm text-red-600">{errors.heightUnit.message}</p>}
          </div>
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <label htmlFor="weight" className="block text-sm font-medium text-white mb-2">Weight (optional)</label>
            <input
              id="weight"
              type="number"
              {...register('weight', {
                setValueAs: (v: string) => v === "" ? undefined : parseFloat(v)
              })}
              className="mt-1 block w-full px-3 py-2 bg-gray-600 text-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.weight && <p className="mt-2 text-sm text-red-600">{errors.weight.message}</p>}
          </div>
          <div>
            <label htmlFor="weightUnit" className="block text-sm font-medium text-white mb-2">Unit</label>
            <select
              id="weightUnit"
              {...register('weightUnit')}
              className="mt-1 block w-full px-3 py-2 bg-gray-600 text-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="kg">kg</option>
              <option value="lbs">lbs</option>
            </select>
            {errors.weightUnit && <p className="mt-2 text-sm text-red-600">{errors.weightUnit.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="goal" className="block text-sm font-medium text-white mb-2">Fitness Goal *</label>
          <Controller
            name="goal"
            control={control}
            rules={{ required: "Fitness goal is required" }}
            render={({ field }) => (
              <TagSelect
                options={["Build muscles", "Lose weight", "Be more tonic and athletic"]}
                value={field.value}
                onChange={field.onChange}
                error={errors.goal?.message}
              />
            )}
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-white mb-2">Workout Type *</label>
          <Controller
            name="type"
            control={control}
            rules={{ required: "Workout type is required" }}
            render={({ field }) => (
              <TagSelect
                options={["Bodyweight", "At the gym"]}
                value={field.value}
                onChange={field.onChange}
                error={errors.type?.message}
              />
            )}
          />
        </div>

        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-white mb-2">Workout Frequency (days per week) *</label>
          <Controller
            name="frequency"
            control={control}
            rules={{ required: "Workout frequency is required" }}
            render={({ field }) => (
              <TagSelect
                options={["2", "3", "4", "5", "6"]}
                value={field.value}
                onChange={field.onChange}
                error={errors.frequency?.message}
              />
            )}
          />
        </div>

        <div>
          <label htmlFor="trainingDays" className="block text-sm font-medium text-white mb-2">Training Days (optional)</label>
          <Controller
            name="trainingDays"
            control={control}
            render={({ field }) => (
              <TagSelect
                options={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]}
                value={field.value || []} // Provide an empty array if field.value is undefined
                onChange={field.onChange}
                error={errors.trainingDays?.message}
                multiple={true}
              />
            )}
          />
        </div>

        <div>
          <label htmlFor="level" className="block text-sm font-medium text-white mb-2">Fitness Level *</label>
          <Controller
            name="level"
            control={control}
            rules={{ required: "Fitness level is required" }}
            render={({ field }) => (
              <TagSelect
                options={["beginner", "intermediate", "advanced"]}
                value={field.value}
                onChange={field.onChange}
                error={errors.level?.message}
              />
            )}
          />
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-white mb-2">Program Duration (weeks) (optional)</label>
          <input
            id="duration"
            type="number"
            {...register('duration', {
              setValueAs: (v: string) => v === "" ? undefined : parseFloat(v)
            })}
            className="mt-1 block w-full px-3 py-2 bg-gray-600 text-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.duration && <p className="mt-2 text-sm text-red-600">{errors.duration.message}</p>}
        </div>

        <div>
          <label htmlFor="sessionDuration" className="block text-sm font-medium text-white mb-2">Session Duration (minutes) (optional)</label>
          <input
            id="sessionDuration"
            type="number"
            {...register('sessionDuration', {
              setValueAs: (v: string) => v === "" ? undefined : parseFloat(v)
            })}
            className="mt-1 block w-full px-3 py-2 bg-gray-600 text-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.sessionDuration && <p className="mt-2 text-sm text-red-600">{errors.sessionDuration.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white mb-2">Email Address *</label>
          <input
            id="email"
            type="email"
            {...register('email', { required: "Email is required" })}
            className="mt-1 block w-full px-3 py-2 bg-gray-600 text-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Workout'}
          {loading && <p className="text-xs mt-1 text-gray-300">It can take up to 30 seconds</p>}
        </button>
      </form>
      {workout && (
        <div ref={workoutRef} className="mt-8">
          <h2 className="text-2xl font-bold mb-4">{workout.program.programName}</h2>
          <p className="mb-4">{workout.program.programDescription}</p>
          <h3 className="text-xl font-semibold mb-2">Method Used:</h3>
          <p className="mb-4">{workout.program.methodUsed}</p>
          <h3 className="text-xl font-semibold mb-2">Scientific Evidence:</h3>
          <p className="mb-4">{workout.program.scientificEvidence}</p>

          {workout.program.weeks.flatMap((week) =>
            week.sessions.map((session, sessionIndex) => (
              <div key={sessionIndex} className="mb-6">
                <h4 className="text-lg font-semibold mb-2">Session {session.sessionNumber}: {session.sessionName}</h4>
                <p className="mb-2">{session.description}</p>

                <ul className="list-disc pl-5">
                  {session.exercises.map((exercise, exerciseIndex) => (
                    <li key={exerciseIndex} className="mb-2">
                      <strong>{exercise.name}</strong>: {exercise.sets} sets of {exercise.reps} reps
                      <p className="text-sm">{exercise.description}</p>
                      <p className="text-sm"><strong>Execution:</strong> {exercise.execution}</p>
                      <p className="text-sm"><strong>Rest:</strong> {exercise.rest_in_seconds} seconds</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}

          {/* Add this at the end of the workout display */}
          <div className="mt-8 text-center">
            <button
              onClick={handleDownloadApp}
              className="px-6 py-3 text-lg font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Download Mobile App
            </button>
          </div>
        </div>
      )}
      <AppPromoPopup
        isOpen={isPromoPopupOpen}
        onClose={() => setIsPromoPopupOpen(false)}
      />
    </main>
  );
}