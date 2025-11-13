// Base Skeleton Component
export const Skeleton = ({ className = '', width, height }) => {
  const style = {
    width: width || '100%',
    height: height || '1rem'
  };

  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={style}
    />
  );
};

// Skeleton for circular elements (avatars, icons)
export const SkeletonCircle = ({ size = '3rem' }) => {
  return (
    <div
      className="animate-pulse bg-gray-200 rounded-full"
      style={{ width: size, height: size }}
    />
  );
};

// Skeleton for text lines
export const SkeletonText = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="0.875rem"
          width={i === lines - 1 ? '80%' : '100%'}
        />
      ))}
    </div>
  );
};

export default Skeleton;

