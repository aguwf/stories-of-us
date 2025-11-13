import { toast } from "sonner";
import { logger } from "./logger";

/**
 * Centralized error handler for consistent error handling across the application
 */
export function handleError(error: unknown, userMessage?: string): void {
	// Extract error message
	const errorMessage =
		error instanceof Error ? error.message : "An unexpected error occurred";

	// Log the error for debugging
	logger.error(errorMessage, error);

	// Show user-friendly message
	toast.error(userMessage || errorMessage);
}

/**
 * Handle async errors with optional success callback
 */
export async function handleAsyncError<T>(
	asyncFn: () => Promise<T>,
	options?: {
		errorMessage?: string;
		onSuccess?: (result: T) => void;
		onError?: (error: unknown) => void;
	}
): Promise<T | null> {
	try {
		const result = await asyncFn();
		options?.onSuccess?.(result);
		return result;
	} catch (error) {
		handleError(error, options?.errorMessage);
		options?.onError?.(error);
		return null;
	}
}

/**
 * Error types for better error categorization
 */
export class AppError extends Error {
	constructor(
		message: string,
		public readonly code?: string,
		public readonly statusCode?: number
	) {
		super(message);
		this.name = "AppError";
	}
}

export class ValidationError extends AppError {
	constructor(message: string) {
		super(message, "VALIDATION_ERROR", 400);
		this.name = "ValidationError";
	}
}

export class AuthenticationError extends AppError {
	constructor(message = "Authentication required") {
		super(message, "AUTH_ERROR", 401);
		this.name = "AuthenticationError";
	}
}

export class NotFoundError extends AppError {
	constructor(message = "Resource not found") {
		super(message, "NOT_FOUND", 404);
		this.name = "NotFoundError";
	}
}
