import { useState, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { StudySheetForm, FormState, AppError } from '@/types';
import { formatErrorMessage } from '@/utils/errorHandling';

interface UseFormStateProps {
  form: UseFormReturn<StudySheetForm>;
  onSubmit: (data: StudySheetForm) => Promise<void>;
}

interface UseFormStateReturn extends FormState {
  handleSubmit: () => Promise<void>;
  setError: (field: keyof StudySheetForm, message: string) => void;
  clearErrors: () => void;
  reset: () => void;
  globalError: string | null;
  setGlobalError: (error: string | null) => void;
}

export const useFormState = ({ form, onSubmit }: UseFormStateProps): UseFormStateReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    handleSubmit: rhfHandleSubmit,
    formState: { isValid, isDirty, errors },
    setError: rhfSetError,
    clearErrors: rhfClearErrors,
    reset: rhfReset
  } = form;

  const handleSubmit = useCallback(async () => {
    setGlobalError(null);
    setIsSubmitting(true);
    setSubmitCount(prev => prev + 1);

    try {
      await rhfHandleSubmit(onSubmit)();
    } catch (error) {
      const errorMessage = formatErrorMessage(error as AppError);
      setGlobalError(errorMessage);
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [rhfHandleSubmit, onSubmit]);

  const setError = useCallback((field: keyof StudySheetForm, message: string) => {
    rhfSetError(field, { type: 'manual', message });
  }, [rhfSetError]);

  const clearErrors = useCallback(() => {
    rhfClearErrors();
    setGlobalError(null);
  }, [rhfClearErrors]);

  const reset = useCallback(() => {
    rhfReset();
    setSubmitCount(0);
    setGlobalError(null);
    setIsSubmitting(false);
  }, [rhfReset]);

  // Convert react-hook-form errors to our format
  const formattedErrors = Object.entries(errors).reduce(
    (acc, [field, error]) => ({
      ...acc,
      [field]: error?.message || 'ข้อมูลไม่ถูกต้อง'
    }),
    {} as Record<string, string>
  );

  return {
    isSubmitting,
    isValid,
    isDirty,
    errors: formattedErrors,
    submitCount,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    globalError,
    setGlobalError
  };
};