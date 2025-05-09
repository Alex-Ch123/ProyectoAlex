import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

const Logo: React.FC<LogoProps> = ({ size = 'medium' }) => {
  const getSizeStyles = () => {
    switch(size) {
      case 'small':
        return { width: '100px', height: '40px' };
      case 'large':
        return { width: '180px', height: '80px' };
      case 'medium':
      default:
        return { width: '140px', height: '60px' };
    }
  };

  return (
    <div 
      className="logo-placeholder" 
      style={getSizeStyles()}
    >
      LOGO
    </div>
  );
};

export default Logo;