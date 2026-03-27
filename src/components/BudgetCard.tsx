import { Check } from 'lucide-react';

interface BudgetCardProps {
  type: 'cheap' | 'moderate' | 'luxury';
  title: string;
  description: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
}

export function BudgetCard({ type, title, description, icon, selected, onClick }: BudgetCardProps) {
  const colorClasses = {
    cheap: selected ? 'w-full border-green-500 bg-green-50 shadow-lg shadow-green-200' : 'border-gray-200 hover:border-green-300',
    moderate: selected ? 'w-full border-blue-500 bg-blue-50 shadow-lg shadow-blue-200' : 'border-gray-200 hover:border-blue-300',
    luxury: selected ? 'w-full border-blue-500 bg-blue-50 shadow-lg shadow-blue-200' : 'border-gray-200 hover:border-blue-300',
  };

  const iconBgClasses = {
    cheap: 'bg-green-100',
    moderate: 'bg-blue-100',
    luxury: 'bg-blue-100',
  };

  return (
    <button
      onClick={onClick}
      className={`relative cursor-pointer border-2 rounded-2xl p-6 text-left transition-all duration-200 hover:scale-105 ${colorClasses[type]}`}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-gradient-to-br from-blue-600 to-blue-600 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`w-14 h-14 ${iconBgClasses[type]} rounded-xl flex items-center justify-center text-3xl mb-4`}>
        {icon}
      </div>

      <div className="mb-1 text-lg">{title}</div>
      <div className="text-sm text-gray-600">{description}</div>
    </button>
  );
}