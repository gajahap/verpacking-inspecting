import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 w-100 bg-burgundy-gradient bg-pattern-container">
      <div className="spinner-border text-white" style={{ width: '2rem', height: '2rem' }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
