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
  const [isPromoPopupOpen, setIsPromoPopupOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [appStoreUrls, setAppStoreUrls] = useState({ ios: '', android: '' });
  const [isGenerating, setIsGenerating] = useState(false);

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

  useEffect(() => {
    // Fetch the URLs from an API route
    fetch('/api/app-store-urls')
      .then(response => response.json())
      .then(data => setAppStoreUrls(data))
      .catch(error => console.error('Failed to fetch app store URLs:', error));
  }, []);

  const handleDownloadApp = () => {
    const url = isIOS ? appStoreUrls.ios : appStoreUrls.android;
    if (url) {
      window.open(url, '_blank');
    } else {
      console.error('App store URL not available');
    }
  };

  const onSubmit = async (data: FormData) => {
    console.log('onSubmit function called with data:', data);
    setLoading(true);
    setIsGenerating(true);

    try {
      const apiPayload = {
        type: data.type.map(t => t.toLowerCase()).join(','),
        gender: data.gender,
        level: data.level,
        frequency: parseInt(data.frequency),
        days: data.trainingDays && data.trainingDays.length > 0 ? data.trainingDays.join(',') : undefined,
        goal: data.goal.map(g => g.toLowerCase().replace(/\s+/g, '_')).join(','),
        height: data.height ? String(data.height) : undefined,
        weight: data.weight ? String(data.weight) : undefined,
        age: Number(data.age),
        duration: data.duration ? Number(data.duration) : undefined,
        weight_unit: data.weightUnit || undefined,
        height_unit: data.heightUnit || undefined,
        session_duration_minutes: data.sessionDuration ? Number(data.sessionDuration) : undefined,
        firstname: data.firstName || undefined,
        email: data.email,
        equipment: data.equipment && data.equipment.length > 0 ? data.equipment.join(',') : undefined,
      };

      const result = await generateWorkout(apiPayload);
      setWorkout(result as WorkoutData);
      setIsPromoPopupOpen(true);
    } catch (error) {
      console.error('Failed to generate workout:', error);
      // Handle rate limit error specifically
      if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
        // Show a user-friendly message about rate limiting
        alert("You've reached the daily limit for workout generation.Please try again tomorrow.");
      } else {
        // Handle other errors
        alert('An error occurred while generating your workout. Please try again later.');
      }
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">AI Workout Generator</h1>
        <div className="flex items-center space-x-4">
          <a href="https://x.com/GuillaumeGay_" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a href="https://github.com/guillaumegay13/ai-workout-generator" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          <a href="https://traincoach.app" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300">
            <img src="/appicon.png" alt="TrainCoach App" width="24" height="24" className="rounded-md" />
          </a>
          <a href="https://www.producthunt.com/posts/ai-workout-generator?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-ai&#0045;workout&#0045;generator" target="_blank" rel="noopener noreferrer">
            <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=490238&theme=dark" alt="AI Workout Generator - Free and fast AI tailored workout generator | Product Hunt" style={{ width: '250px', height: '54px' }} width="250" height="54" />
          </a>
        </div>
      </div>

      {/* App promotion banner */}
      {/* <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 mb-8 shadow-lg flex items-center">
              <div className="flex-1 pr-6">
                <h2 className="text-2xl font-bold mb-4">Get Our Mobile App for a Better Workout Experience!</h2>
                <p className="mb-4">
                  Take your workouts to the next level with our mobile app.
                </p>
                <button
                  onClick={handleDownloadApp}
                  className="px-6 py-3 text-lg font-medium text-indigo-600 bg-white rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Download Now
                </button>
              </div>
              <div className="flex-1">
                <video
                  className="w-full h-auto rounded-lg shadow-lg"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src="/dynamic.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div> */}

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
          <label htmlFor="goal" className="block text-sm font-medium text-white mb-2">Fitness Goal(s) *</label>
          <Controller
            name="goal"
            control={control}
            rules={{ required: "At least one fitness goal is required" }}
            render={({ field }) => (
              <TagSelect
                options={[
                  "Build muscles",
                  "Lose weight",
                  "Be more tonic and athletic",
                  "Improve mental health",
                  "Sleep better at night",
                  "Increase flexibility",
                  "Enhance cardiovascular health",
                  "Boost energy levels"
                ]}
                value={field.value || []}
                onChange={field.onChange}
                error={errors.goal?.message}
                multiple={true}
              />
            )}
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-white mb-2">Workout Type(s) *</label>
          <Controller
            name="type"
            control={control}
            rules={{ required: "At least one workout type is required" }}
            render={({ field }) => (
              <TagSelect
                options={[
                  "Bodyweight",
                  "At the gym",
                  "Cardiovascular Workouts",
                  "Strength Training",
                  "Flexibility and Balance Workouts",
                  "High-Intensity Interval Training (HIIT)",
                  "Circuit Training",
                  "Functional Training"
                ]}
                value={field.value || []}
                onChange={field.onChange}
                error={errors.type?.message}
                multiple={true}
              />
            )}
          />
        </div>

        <div>
          <label htmlFor="equipment" className="block text-sm font-medium text-white mb-2">Available Equipment (optional)</label>
          <Controller
            name="equipment"
            control={control}
            render={({ field }) => (
              <TagSelect
                options={[
                  "Barbells",
                  "Dumbbells",
                  "Kettlebells",
                  "Resistance bands",
                  "Cable machine",
                  "Treadmill",
                  "Stationary bike",
                  "Weight machines"
                ]}
                value={field.value || []}
                onChange={field.onChange}
                error={errors.equipment?.message}
                multiple={true}
              />
            )}
          />
        </div>

        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-white mb-2">Workout Frequency (per week) *</label>
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
                value={field.value || []}
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
      {/* Add this new section for the generation process promo */}
      {isGenerating && (
        <div className="mt-8 bg-gray-800 rounded-lg p-6 shadow-lg animate-pulse">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="md:w-1/2">
              <h2 className="text-2xl font-bold mb-4">Generating Your Perfect Workout...</h2>
              <p className="mb-4">
                Why not explore our mobile app?
              </p>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <ul className="list-disc pl-5 py-2">
                    <li className="py-1">Access your trainings from everywhere</li>
                    <li className="py-1">Schedule your sessions in the calendar</li>
                    <li className="py-1">Increase your streak to stay motivated</li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                <a
                  href="https://traincoach.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 inline-block"
                >
                  Visit Website
                </a>
                <a
                  href={appStoreUrls.ios}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-block"
                >
                  Download iOS
                </a>
                <a
                  href={appStoreUrls.android}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 inline-block"
                >
                  Download Android
                </a>
              </div>
            </div>
            <div className="md:w-1/2">
              <video
                className="w-full h-auto rounded-2xl shadow-lg"
                autoPlay
                muted
                loop
                playsInline
              >
                <source src="/dynamic.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}

      {workout && (
        <div ref={workoutRef} className="mt-8">
          <h2 className="text-2xl font-bold mb-4">{workout.program.programName}</h2>
          <p className="mb-4">{workout.program.programDescription}</p>

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
          <div className="mt-8 text-center flex justify-center space-x-4">
            <button
              onClick={handleDownloadApp}
              className="px-6 py-3 text-lg font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Download Mobile App
            </button>

            {/* Buy Me a Coffee button */}
            <a
              href="https://buymeacoffee.com/guillaumegay"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 text-lg font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Buy Me a Coffee
            </a>
          </div>
        </div>
      )}

      {/* Move AppPromoPopup here, after the workout display */}
      <AppPromoPopup
        isOpen={isPromoPopupOpen}
        onClose={() => setIsPromoPopupOpen(false)}
        iosAppStoreUrl={appStoreUrls.ios}
        androidPlayStoreUrl={appStoreUrls.android}
      />
    </main>
  );
}