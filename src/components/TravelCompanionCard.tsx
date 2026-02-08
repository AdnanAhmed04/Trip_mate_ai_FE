import { Check } from 'lucide-react';

interface TravelCompanionCardProps {
  type: 'just-me' | 'couple' | 'friends' | 'family';
  title: string;
  description: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
}

export function TravelCompanionCard({ title, description, icon, selected, onClick }: TravelCompanionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`relative border-2 rounded-2xl p-5 text-left transition-all duration-200 hover:scale-105 ${
        selected
          ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-200'
          : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
      }`}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl mb-3">
        {icon}
      </div>
      
      <div className="mb-1">{title}</div>
      <div className="text-xs text-gray-600">{description}</div>
    </button>
  );
}
