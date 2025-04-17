import React from 'react';

const LoaderOverlay = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <img
        src="/loader.jpeg" // Replace this with your actual loading gif
        alt="Loading..."
        style={{ width: '100px', height: '100px' }}
      />
    </div>
  );
};

export default LoaderOverlay;
