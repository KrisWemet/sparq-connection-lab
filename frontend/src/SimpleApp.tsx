import React from 'react';

function SimpleApp() {
  const [count, setCount] = React.useState(0);

  return (
    <div style={{ 
      maxWidth: '500px', 
      margin: '50px auto', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ color: '#111827' }}>Simple React App</h1>
      <p style={{ color: '#4b5563' }}>
        This is a minimal React application to test if rendering works correctly.
      </p>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => setCount(count + 1)}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Count: {count}
        </button>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#111827' }}>Debug Info</h3>
        <pre style={{ margin: 0, fontSize: '14px' }}>
          {`Window Location: ${window.location.href}
React Version: ${React.version}
User Agent: ${navigator.userAgent}
`}
        </pre>
      </div>
    </div>
  );
}

export default SimpleApp; 