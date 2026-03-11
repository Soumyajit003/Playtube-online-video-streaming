import { twMerge } from 'tailwind-merge';

export const Loader = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={twMerge('relative', className)}>
      <div className={twMerge(
        'animate-spin rounded-full border-white/20 border-t-primary',
        sizes[size]
      )} />
    </div>
  );
};

export const FullPageLoader = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
    <Loader size="lg" />
  </div>
);
