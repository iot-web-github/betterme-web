import { toast } from 'sonner';

type ErrorContext = 'fetch' | 'save' | 'delete' | 'auth' | 'general';

const contextMessages: Record<ErrorContext, string> = {
  fetch: 'Failed to load data',
  save: 'Failed to save changes',
  delete: 'Failed to delete',
  auth: 'Authentication error',
  general: 'Something went wrong',
};

export const handleError = (error: unknown, context: ErrorContext = 'general') => {
  const message = error instanceof Error ? error.message : contextMessages[context];
  console.error(`[${context}]`, error);
  toast.error(contextMessages[context], {
    description: message !== contextMessages[context] ? message : undefined,
  });
};

export const withErrorHandler = async <T>(
  fn: () => Promise<T>,
  context: ErrorContext = 'general'
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    handleError(error, context);
    return null;
  }
};
