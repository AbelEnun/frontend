import React from 'react';
import DotGrid from './DotGrid';

const Background = ({ isDark }) => {
  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden pointer-events-none transition-colors duration-700 ${isDark ? 'bg-[#000000]' : 'bg-[#ffffff]'}`}>
      {/* 
          All background decorative elements (DotGrid, Gradients, Orbs) 
          have been removed for a pure, minimalist look. 
      */}
    </div>
  );
};

export default Background;
