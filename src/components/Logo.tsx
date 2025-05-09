import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

const Logo: React.FC<LogoProps> = ({ size = 'medium' }) => {
  const getSizeStyles = () => {
    switch(size) {
      case 'small':
        return { width: '100px', height: '100px' };
      case 'large':
        return { width: '180px', height: '180px' };
      case 'medium':
      default:
        return { width: '140px', height: '140px' };
    }
  };

  return (
    <div 
      className="sound-therapy-logo" 
      style={getSizeStyles()}
    >
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="100" fill="#4A4799" />
        <text x="100" y="80" fontFamily="Arial" fontSize="24" fontWeight="bold" fill="white" textAnchor="middle">Sound</text>
        <text x="100" y="110" fontFamily="Arial" fontSize="24" fontWeight="bold" fill="white" textAnchor="middle">Therapy</text>
        
        {/* Sound wave graphic */}
        <g fill="white">
          <rect x="70" y="130" width="2" height="20" rx="1" />
          <rect x="80" y="125" width="2" height="30" rx="1" />
          <rect x="90" y="120" width="2" height="40" rx="1" />
          <rect x="100" y="115" width="2" height="50" rx="1" />
          <rect x="110" y="120" width="2" height="40" rx="1" />
          <rect x="120" y="125" width="2" height="30" rx="1" />
          <rect x="130" y="130" width="2" height="20" rx="1" />
          
          <rect x="60" y="135" width="2" height="10" rx="1" />
          <rect x="140" y="135" width="2" height="10" rx="1" />
        </g>
      </svg>
    </div>
  );
};

export default Logo;