// API Constants

// Base URL for the workout generation API
export const API_BASE_URL = 'https://program-api-service-qqoaabgxbq-od.a.run.app/api';

// Endpoint for generating workouts
export const GENERATE_WORKOUT_ENDPOINT = `${API_BASE_URL}/generate_program_fast/`;

// HTTP methods
export const HTTP_METHODS = {
    POST: 'POST',
};

// Default headers for API requests
export const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
};

// Error messages
export const API_ERROR_MESSAGES = {
    FAILED_TO_GENERATE: 'Failed to generate workout',
    NETWORK_ERROR: 'Network error occurred',
    INVALID_RESPONSE: 'Invalid response from server',
};

// Timeout for API requests (in milliseconds)
export const API_TIMEOUT = 30000; // 30 seconds

// Maximum retries for failed requests
export const MAX_RETRIES = 3;
