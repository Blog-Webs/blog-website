import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';

const CategoryCard = ({ category }) => {
  const Icon = LucideIcons[category.icon] || LucideIcons.MessageCircle;

  return (
    <Link 
      to={`/forum/${category.slug}`}
      className="p-6 rounded-2xl border flex flex-col hover:border-primary transition-colors h-full"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
          <Icon size={24} />
        </div>
        <div>
          <h3 className="font-bold text-lg">{category.name}</h3>
          <p className="text-sm text-muted-foreground">{category.topicCount} topics</p>
        </div>
      </div>
      <p className="text-sm flex-1" style={{ color: 'var(--text-muted)' }}>
        {category.description}
      </p>
    </Link>
  );
};

export default CategoryCard;
