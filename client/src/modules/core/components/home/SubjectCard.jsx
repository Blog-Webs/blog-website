import { Link } from 'react-router-dom';
import { ArrowRight, Binary, Coffee, Calculator, Network, Database, Cpu, Globe, Layers } from 'lucide-react';

import FeatureCard from '../ui/FeatureCard';

const ICONS = {
  'binary-tree': Binary,
  coffee: Coffee,
  calculator: Calculator,
  network: Network,
  database: Database,
  cpu: Cpu,
  globe: Globe,
  layers: Layers,
};

const SubjectCard = ({ subject }) => {
  const isCustomIcon = subject.icon?.startsWith('http') || subject.icon?.startsWith('/');
  
  return (
    <FeatureCard 
      title={subject.name}
      description={subject.description}
      icon={isCustomIcon ? subject.icon : (ICONS[subject.icon] || Binary)}
      image={subject.coverImage}
      color={subject.color}
      to={`/learn/${subject.slug}`}
      badge={subject.badge || null}
    />
  );
};

export default SubjectCard;
