import { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext({
  addToast: () => {},
  removeToast: () => {}
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 5000) => {
    const id = Date.now();
    setToasts(current => [...current, { id, message, type }]);
    
    // Auto remove toast after duration
    if (duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(current => current.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-0 right-0 z-50 p-4 space-y-4">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            show={true}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Custom hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Example usage:
// function MyComponent() {
//   const { addToast } = useToast();
//
//   const handleSuccess = () => {
//     addToast('Operation successful!', 'success');
//   };
//
//   const handleError = () => {
//     addToast('An error occurred', 'error');
//   };
//
//   const handleInfo = () => {
//     addToast('Please wait...', 'info');
//   };
//
//   const handleWarning = () => {
//     addToast('Warning message', 'warning');
//   };
//
//   return (
//     <button onClick={handleSuccess}>
//       Show Success Toast
//     </button>
//   );
// }