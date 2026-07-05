import { Link } from 'react-router-dom';

const LearnHome = () => {
  const tracks = [
    {
      id: 'java',
      title: 'Java',
      description: 'Core language fundamentals, JVM internals, and modern concurrency patterns.',
      icon: 'local_cafe',
      iconColor: 'text-orange-400',
      iconBg: 'bg-orange-400/10',
      count: '42 RESOURCES',
      link: '/learn/java'
    },
    {
      id: 'spring',
      title: 'Spring Boot',
      description: 'Enterprise-grade microservices, security, and cloud-native development.',
      icon: 'energy_savings_leaf',
      iconColor: 'text-green-400',
      iconBg: 'bg-green-400/10',
      count: '28 COURSES',
      link: '/learn/spring-boot'
    },
    {
      id: 'ai',
      title: 'Artificial Intelligence',
      description: 'LLM fine-tuning, neural networks, and deploying generative models at scale.',
      icon: 'smart_toy',
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-400/10',
      tags: ['PyTorch', 'Transformers'],
      count: '56 MODULES',
      link: '/learn/ai',
      large: true
    },
    {
      id: 'system-design',
      title: 'System Design',
      description: 'Scalability patterns, database sharding, and high-availability architecture.',
      icon: 'account_tree',
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-400/10',
      tags: ['L4/L7 Load Balancing'],
      count: '34 CASE STUDIES',
      link: '/learn/system-design',
      large: true
    },
    {
      id: 'dsa',
      title: 'DSA',
      description: 'Master algorithmic thinking and complex data structure implementation.',
      icon: 'data_object',
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-500/10',
      count: '120 CHALLENGES',
      link: '/learn/dsa'
    },
    {
      id: 'react',
      title: 'React',
      description: 'Next.js, Server Components, and sophisticated state management.',
      icon: 'design_services',
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-400/10',
      count: '45 GUIDES',
      link: '/learn/react'
    },
    {
      id: 'cloud',
      title: 'Cloud',
      description: 'AWS, Azure, and Google Cloud platform engineering strategies.',
      icon: 'cloud',
      iconColor: 'text-gray-300',
      iconBg: 'bg-gray-300/10',
      count: '10 PATHWAYS',
      link: '/learn/cloud'
    },
    {
      id: 'devops',
      title: 'DevOps',
      description: 'CI/CD pipelines, Kubernetes orchestration, and Infrastructure as Code.',
      icon: 'all_inclusive',
      iconColor: 'text-gray-300',
      iconBg: 'bg-gray-300/10',
      count: '31 PROJECTS',
      link: '/learn/devops'
    }
  ];

  return (
    <div className="pt-24 pb-32 px-gutter max-w-max-width mx-auto">
      {/* Header */}
      <div className="mb-16 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-highest border border-outline-variant/30 mb-6">
          <span className="material-symbols-outlined text-[16px] text-primary">explore</span>
          <span className="text-label-sm text-on-surface-variant font-medium">Domain Exploration</span>
        </div>
        <h1 className="font-display text-display text-on-surface mb-6 leading-tight">
          Master the <span className="gradient-heading-accent">Ecosystem</span>.
        </h1>
        <p className="font-body-lg text-on-surface-variant leading-relaxed">
          Dive deep into specialized tech tracks designed for the modern engineer.<br className="hidden md:block"/> From low-level systems to high-level cloud architecture, explore our curated knowledge graph.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
        {tracks.map((track) => (
          <Link 
            key={track.id} 
            to={track.link}
            className={`card-hover bg-[#111113] border border-outline-variant/20 rounded-2xl p-8 flex flex-col group ${track.large ? 'lg:col-span-2' : ''}`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 ${track.iconBg}`}>
              <span className={`material-symbols-outlined ${track.iconColor}`}>{track.icon}</span>
            </div>
            
            <h3 className="font-display text-headline-md text-on-surface mb-3 group-hover:text-primary transition-colors">{track.title}</h3>
            
            <p className="text-on-surface-variant text-sm mb-6 flex-grow">
              {track.description}
            </p>

            {track.tags && (
              <div className="flex flex-wrap gap-2 mb-8">
                {track.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-surface-container border border-outline-variant/20 text-xs text-on-surface-variant">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className={`flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/10 ${track.tags ? '' : 'mt-8'}`}>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/70">{track.count}</span>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all">arrow_forward</span>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA Bottom */}
      <div className="bg-[#1c1b1d] border border-outline-variant/20 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h2 className="font-display text-headline-lg text-on-surface mb-2">Ready to accelerate your career?</h2>
          <p className="text-on-surface-variant">Join 50k+ developers mastering these technologies today.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto shrink-0">
          <button className="flex-1 md:flex-none px-6 py-3 bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 transition-all text-sm">
            Start Learning
          </button>
          <button className="flex-1 md:flex-none px-6 py-3 bg-transparent border border-outline-variant text-on-surface font-bold rounded-lg hover:bg-white/5 transition-all text-sm">
            View All Tracks
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearnHome;
