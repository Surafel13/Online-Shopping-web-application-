export function AdminLoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mb-3" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
