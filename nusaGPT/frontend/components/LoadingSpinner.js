export default function LoadingSpinner({ size = 'md', color = 'indigo', fullScreen = false }) {
  // Size variants
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  // Color variants
  const colors = {
    indigo: 'border-indigo-600',
    white: 'border-white',
    gray: 'border-gray-600',
    blue: 'border-blue-600'
  };

  const spinnerSize = sizes[size] || sizes.md;
  const spinnerColor = colors[color] || colors.indigo;

  const Spinner = () => (
    <div className="flex flex-col items-center space-y-2">
      <div
        className={`animate-spin rounded-full border-2 border-t-transparent ${spinnerSize} ${spinnerColor}`}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <Spinner />
      </div>
    );
  }

  return <Spinner />;
}

// Example usage:
// <LoadingSpinner /> - Default medium size, indigo color
// <LoadingSpinner size="lg" color="white" /> - Large size, white color
// <LoadingSpinner fullScreen /> - Full screen overlay loading spinner