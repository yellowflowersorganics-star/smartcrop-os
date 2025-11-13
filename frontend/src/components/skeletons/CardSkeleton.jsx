import { Skeleton, SkeletonCircle, SkeletonText } from './Skeleton';

// Generic Card Skeleton
export const CardSkeleton = ({ hasImage = false, hasActions = true }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      {hasImage && <Skeleton height="12rem" className="mb-4" />}
      
      <div className="flex items-start gap-3">
        <SkeletonCircle size="3rem" />
        <div className="flex-1">
          <Skeleton height="1.25rem" width="60%" className="mb-2" />
          <SkeletonText lines={2} />
        </div>
      </div>

      {hasActions && (
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <Skeleton height="2.5rem" width="5rem" />
          <Skeleton height="2.5rem" width="5rem" />
        </div>
      )}
    </div>
  );
};

// Stats Card Skeleton
export const StatsCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Skeleton height="0.875rem" width="50%" className="mb-3" />
      <Skeleton height="2rem" width="40%" className="mb-2" />
      <Skeleton height="0.75rem" width="30%" />
    </div>
  );
};

// List Item Skeleton
export const ListItemSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4">
      <SkeletonCircle size="3rem" />
      <div className="flex-1">
        <Skeleton height="1.125rem" width="40%" className="mb-2" />
        <SkeletonText lines={1} />
      </div>
      <div className="flex gap-2">
        <Skeleton height="2rem" width="2rem" />
        <Skeleton height="2rem" width="2rem" />
      </div>
    </div>
  );
};

// Table Row Skeleton
export const TableRowSkeleton = ({ columns = 4 }) => {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton height="1rem" width={i === 0 ? '80%' : '60%'} />
        </td>
      ))}
    </tr>
  );
};

// Grid of Cards Skeleton
export const CardsGridSkeleton = ({ count = 6, columns = 3 }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};

export default CardSkeleton;

