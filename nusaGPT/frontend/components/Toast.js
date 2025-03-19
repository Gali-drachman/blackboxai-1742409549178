import { Fragment, useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';

export default function Toast({ 
  message, 
  type = 'success', 
  show = false, 
  onClose,
  duration = 5000 // Duration in milliseconds
}) {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
    if (show) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const icons = {
    success: (
      <i className="fas fa-check-circle text-green-400 text-xl"></i>
    ),
    error: (
      <i className="fas fa-exclamation-circle text-red-400 text-xl"></i>
    ),
    info: (
      <i className="fas fa-info-circle text-blue-400 text-xl"></i>
    ),
    warning: (
      <i className="fas fa-exclamation-triangle text-yellow-400 text-xl"></i>
    )
  };

  const colors = {
    success: 'bg-green-50 text-green-800',
    error: 'bg-red-50 text-red-800',
    info: 'bg-blue-50 text-blue-800',
    warning: 'bg-yellow-50 text-yellow-800'
  };

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        <Transition
          show={isVisible}
          as={Fragment}
          enter="transform ease-out duration-300 transition"
          enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          enterTo="translate-y-0 opacity-100 sm:translate-x-0"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className={`max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ${colors[type] || colors.info}`}>
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {icons[type] || icons.info}
                </div>
                <div className="ml-3 w-0 flex-1">
                  <p className="text-sm font-medium">
                    {message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className={`rounded-md inline-flex text-${type}-400 hover:text-${type}-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${type}-500`}
                    onClick={() => {
                      setIsVisible(false);
                      onClose?.();
                    }}
                  >
                    <span className="sr-only">Close</span>
                    <i className="fas fa-times text-lg"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
}

// Create a ToastContainer component to manage multiple toasts
export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 5000) => {
    const id = Date.now();
    setToasts(current => [...current, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(current => current.filter(toast => toast.id !== id));
  };

  return (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          show={true}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
}

// Example usage:
// const { addToast } = useToast();
// addToast('Operation successful!', 'success');
// addToast('An error occurred', 'error');
// addToast('Please wait...', 'info');
// addToast('Warning message', 'warning');