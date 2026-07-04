import { Link } from 'react-router-dom';

const FeatureCard = ({ title, description, badge, icon: Icon, image, to, onClick, color = 'var(--accent)' }) => {
  const content = (
    <>
      {/* Visual/preview area */}
      <div 
        className="w-full h-32 rounded-xl mb-5 flex items-center justify-center relative overflow-hidden shrink-0 border"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.4)', 
          borderColor: 'rgba(255, 255, 255, 0.04)',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
        }}
      >
        {badge && (
          <div 
            className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full z-10 shadow-sm"
            style={{ backgroundColor: 'var(--danger)', color: '#fff' }}
          >
            {badge}
          </div>
        )}

        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover opacity-80" />
        ) : typeof Icon === 'string' ? (
          <img src={Icon} alt={title} className="w-12 h-12 object-contain opacity-90 drop-shadow-md" />
        ) : Icon ? (
          <Icon size={40} style={{ color }} className="opacity-80 drop-shadow-md" />
        ) : null}
      </div>

      {/* Text content */}
      <h3 className="text-[19px] font-semibold mb-2 leading-tight" style={{ color: 'var(--text)' }}>
        {title}
      </h3>
      <p className="text-[14px] leading-relaxed line-clamp-3" style={{ color: 'var(--text-muted)' }}>
        {description}
      </p>
    </>
  );

  const wrapperClass = "feature-card block w-full text-left transition-all duration-200 ease-out";
  
  if (to) {
    return (
      <Link to={to} className={wrapperClass} style={{ '--hover-color': color }}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={wrapperClass} style={{ '--hover-color': color }}>
      {content}
    </button>
  );
};

export default FeatureCard;
