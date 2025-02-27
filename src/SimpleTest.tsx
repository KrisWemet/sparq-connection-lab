import React from 'react';

export default function SimpleTest() {
  console.log("SimpleTest component rendering");
  
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'system-ui', 
      maxWidth: '500px', 
      margin: '40px auto',
      border: '2px solid #3b82f6',
      borderRadius: '8px',
      backgroundColor: '#f8fafc'
    }}>
      <h1 style={{ color: '#3b82f6' }}>React is Working!</h1>
      <p>If you can see this message, React is rendering correctly.</p>
      <p>The problem might be with the main application components, not with React itself.</p>
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => alert('Button clicked!')}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Click Me
        </button>
      </div>
    </div>
  );
} 