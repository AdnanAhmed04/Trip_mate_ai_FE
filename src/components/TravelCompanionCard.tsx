import { Check } from 'lucide-react';

interface TravelCompanionCardProps {
  type: 'just-me' | 'couple' | 'friends' | 'family';
  title: string;
  description: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
}

const gradients: Record<string, string> = {
  'just-me': 'from-amber-400 to-orange-500',
  couple: 'from-pink-400 to-rose-500',
  family: 'from-green-400 to-emerald-500',
  friends: 'from-blue-400 to-cyan-500',
};

export function TravelCompanionCard({ type, title, description, icon, selected, onClick }: TravelCompanionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-2xl p-4 text-left transition-all duration-200 border ${
        selected
          ? `border-transparent bg-gradient-to-br ${gradients[type]} shadow-xl`
          : 'border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20'
      }`}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 bg-white/30 rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
      <div className="text-2xl mb-2">{icon}</div>
      <div className={`font-semibold text-sm mb-0.5 ${selected ? 'text-white' : 'text-white/70'}`}>{title}</div>
      <div className={`text-xs ${selected ? 'text-white/80' : 'text-white/35'}`}>{description}</div>
    </button>
  );
}
