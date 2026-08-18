import React from 'react';

export const Icon = () => (
  <div style={{
    width: '32px', 
    height: '32px', 
    backgroundColor: '#2563eb',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
      <path d="M12 12v9"></path>
      <path d="m8 17 4 4 4-4"></path>
    </svg>
  </div>
);

export default Icon;
