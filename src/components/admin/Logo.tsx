import React from 'react';

export const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
    <div style={{
      width: '36px', 
      height: '36px', 
      backgroundColor: '#2563eb', // blue-600
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 14px 0 rgba(37,99,235,0.39)',
    }}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
        <path d="M12 12v9"></path>
        <path d="m8 17 4 4 4-4"></path>
      </svg>
    </div>
    <span style={{ 
      fontSize: '22px', 
      fontWeight: '900', 
      letterSpacing: '-0.5px',
      color: 'var(--theme-text)', 
      fontFamily: 'Vazirmatn, sans-serif'
    }}>
      چاپخانه <span style={{ color: '#2563eb' }}>نگار</span>
    </span>
  </div>
);

export default Logo;
