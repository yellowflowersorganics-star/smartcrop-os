import { FileText, Plus } from 'lucide-react';

const EmptyState = ({
  icon: Icon = FileText,
  title = 'No data found',
  description = 'Get started by creating your first item',
  actionLabel = 'Create New',
  onAction,
  showAction = true
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-12 text-center">
      <div className="flex justify-center mb-4">
        <div className="bg-gray-100 p-4 rounded-full">
          <Icon className="w-12 h-12 text-gray-400" />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      
      {showAction && onAction && (
        <button
          onClick={onAction}
          className="btn-primary inline-flex items-center gap-2 px-6 py-3"
        >
          <Plus className="w-5 h-5" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

