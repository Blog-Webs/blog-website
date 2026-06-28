import { Link } from 'react-router-dom';
import { ArrowRight, Binary, Coffee, Calculator, Network, Database, Cpu, Globe, Layers } from 'lucide-react';

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
  const Icon = ICONS[subject.icon] || Binary;

  return (
    <Link
      to={`/learn/${subject.slug}`}
      className="group p-6 rounded-2xl border card-hover"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        // Override the shared hover-shadow tint with this subject's own
        // accent color, so each subject card glows its own color on
        // hover instead of one global teal for every card.
        '--accent-soft': `${subject.color}1F`,
        '--accent': subject.color,
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
        style={{ backgroundColor: `${subject.color}1A`, color: subject.color }}
      >
        <Icon size={22} />
      </div>
      <h3 className="text-lg font-semibold mb-1.5">{subject.name}</h3>
      <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{subject.description}</p>
      <div className="flex items-center gap-1 text-sm font-medium" style={{ color: subject.color }}>
        Start learning
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
};

export default SubjectCard;
