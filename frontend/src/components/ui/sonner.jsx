import { Toaster as Sonner, toast } from 'sonner';

const Toaster = ({ ...props }) => {
  // Default to dark theme for this app
  const theme = 'dark';

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            'group toast bg-gray-900 text-white border border-white/10 shadow-lg',
          description: 'text-gray-400',
          actionButton: 'bg-purple-600 text-white',
          cancelButton: 'bg-gray-700 text-gray-300',
          success: 'bg-green-900/90 border-green-500/30 text-green-100',
          error: 'bg-red-900/90 border-red-500/30 text-red-100',
          warning: 'bg-yellow-900/90 border-yellow-500/30 text-yellow-100',
          info: 'bg-blue-900/90 border-blue-500/30 text-blue-100',
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
