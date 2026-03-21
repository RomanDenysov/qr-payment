export function PageSpinner() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-none border-4 border-muted border-t-foreground" />
    </div>
  );
}
