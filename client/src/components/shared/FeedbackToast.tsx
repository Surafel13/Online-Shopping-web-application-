import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../redux/store';
import { clearMessage } from '../../redux/slices/uiSlice';
import { cn } from '../../lib/utils';

export function FeedbackToast() {
  const dispatch = useDispatch<AppDispatch>();
  const { message, messageType } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => dispatch(clearMessage()), 4000);
    return () => window.clearTimeout(timer);
  }, [message, dispatch]);

  if (!message) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-[100] max-w-sm rounded-lg border px-4 py-3 text-sm shadow-lg',
        messageType === 'success' && 'border-green-200 bg-green-50 text-green-800',
        messageType === 'error' && 'border-red-200 bg-red-50 text-red-800',
        messageType === 'info' && 'border-blue-200 bg-blue-50 text-blue-800',
      )}
    >
      {message}
    </div>
  );
}
