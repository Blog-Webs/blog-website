import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const LearnHome = () => {
  const tracks = [
    {
      id: 'java',
      title: 'Java Ecosystem',
      description: 'Master the foundation of enterprise computing. From JVM internals and Concurrency to the...',
      icon: 'local_cafe',
      iconColor: 'text-[#E07A5F]',
      iconBg: 'bg-[#E07A5F]/10',
      courses: '45 Courses',
      articles: '120 Articles',
      link: '/learn/java'
    },
    {
      id: 'spring',
      title: 'Spring Boot',
      description: 'Build production-ready microservices with Spring Framework. Security, Data, Cloud,...',
      icon: 'bolt',
      iconColor: 'text-[#4ADE80]',
      iconBg: 'bg-[#4ADE80]/10',
      courses: '38 Courses',
      articles: '85 Articles',
      link: '/learn/spring-boot'
    },
    {
      id: 'ai',
      title: 'AI & Machine Learning',
      description: 'Explore the frontier of LLMs, Neural Networks, and Predictive Analytics. Dive into Python,...',
      icon: 'psychology',
      iconColor: 'text-[#D946EF]',
      iconBg: 'bg-[#D946EF]/10',
      courses: '25 Courses',
      articles: '80 Articles',
      link: '/learn/ai'
    },
    {
      id: 'system-design',
      title: 'System Design',
      description: 'Learn to architect scalable, resilient distributed systems. High availability, database sharding, an...',
      icon: 'account_tree',
      iconColor: 'text-[#60A5FA]',
      iconBg: 'bg-[#60A5FA]/10',
      courses: '20 Courses',
      articles: '40 Articles',
      link: '/learn/system-design'
    },
    {
      id: 'dsa',
      title: 'DSA Mastery',
      description: 'Ace your technical interviews. Comprehensive coverage of algorithms, advanced data...',
      icon: 'code_blocks',
      iconColor: 'text-[#F43F5E]',
      iconBg: 'bg-[#F43F5E]/10',
      courses: '30 Courses',
      articles: '150 Articles',
      link: '/learn/dsa'
    },
    {
      id: 'react',
      title: 'Modern React',
      description: 'Build dynamic user interfaces with React, Next.js, and TypeScript. State management, hooks, and...',
      icon: 'javascript',
      iconColor: 'text-[#38BDF8]',
      iconBg: 'bg-[#38BDF8]/10',
      courses: '35 Courses',
      articles: '90 Articles',
      link: '/learn/react'
    },
    {
      id: 'cloud',
      title: 'Cloud Infrastructure',
      description: 'Expertise in AWS, GCP, and Azure. Serverless computing, VPCs, and global content delivery networks.',
      icon: 'cloud',
      iconColor: 'text-[#38BDF8]',
      iconBg: 'bg-[#38BDF8]/10',
      courses: '28 Courses',
      articles: '75 Articles',
      link: '/learn/cloud'
    },
    {
      id: 'devops',
      title: 'DevOps & SRE',
      description: 'Automate everything. CI/CD pipelines, Kubernetes orchestration, Docker, and...',
      icon: 'settings',
      iconColor: 'text-[#FBBF24]',
      iconBg: 'bg-[#FBBF24]/10',
      courses: '22 Courses',
      articles: '55 Articles',
      link: '/learn/devops'
    }
  ];

  return (
    <div className="w-full bg-[#0E1015] min-h-screen">
      <div className="pt-20 pb-32 px-6 max-w-[1280px] mx-auto w-full">
        {/* Header */}
        <div className="mb-16 text-center w-full max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
          Master the Modern Tech Stack
        </h1>
        <p className="text-[#8B949E] text-[17px] leading-relaxed mb-8 max-w-2xl mx-auto">
          From enterprise backends to generative AI, explore curated learning paths designed by industry experts to accelerate your engineering career.
        </p>
        <div className="flex items-center justify-center gap-4">
          <div className="px-5 py-2 rounded-full bg-[#3B82F6] text-white text-xs font-bold tracking-wide">
            8 LEARNING DOMAINS
          </div>
          <div className="px-5 py-2 rounded-full bg-[#8B5CF6] text-white text-xs font-bold tracking-wide">
            300+ EXPERT COURSES
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-24 w-full">
        {tracks.map((track) => (
          <Link 
            key={track.id} 
            to={track.link}
            className="flex flex-col bg-[#161B22] border border-[#2D3342] rounded-2xl p-6 hover:border-[#4375FF] hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${track.iconBg}`}>
              <span className={`material-symbols-outlined text-[24px] ${track.iconColor}`}>{track.icon}</span>
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-3">
              {track.title}
            </h3>
            
            <p className="text-[#8B949E] text-[13px] leading-[1.6] mb-8 flex-grow">
              {track.description}
            </p>

            <div className="flex items-center justify-between mt-auto pt-5 text-[11px] text-[#8B949E] border-t border-[#2D3342]">
              <span>{track.courses}</span>
              <span>{track.articles}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="bg-[#1C202B] border border-[#2D3342] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10 w-full">
        <div className="flex-1 w-full max-w-xl">
          <h2 className="text-3xl font-bold text-white mb-4">
            Can't decide where to start?
          </h2>
          <p className="text-[#8B949E] text-[15px] leading-relaxed mb-8">
            Take our personalized skills assessment to get a custom learning roadmap tailored to your experience level and career goals.
          </p>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#a5b4fc] text-[#1e1b4b] font-semibold rounded-xl hover:bg-[#c7d2fe] transition-colors">
            Start Assessment
            <ArrowRight size={18} />
          </button>
        </div>
        <div className="w-full md:w-[350px] h-[250px] bg-[#2D3342] rounded-2xl flex items-center justify-center flex-shrink-0">
           <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
             <circle cx="6" cy="19" r="3" />
             <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
             <circle cx="18" cy="5" r="3" />
           </svg>
        </div>
      </div>
      </div>
    </div>
  );
};

export default LearnHome;
