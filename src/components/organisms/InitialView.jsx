import React, { useRef } from 'react';

const InitialView = ({ onFileSelect, isProcessing, error, isDragging, onDragEvents, onDrop }) => {
  const fileInputRef = useRef(null);

  return (
    <div className="initial-view">
      <div
        className={`mb-6 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer text-gray-400 flex flex-col ${isDragging ? 'bg-slate-800' : 'bg-slate-900'}`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={onDrop}
        onDragEnter={onDragEvents}
        onDragOver={onDragEvents}
        onDragLeave={onDragEvents}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <p>Drag & drop CSV here, or click to select file</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={onFileSelect}
          disabled={isProcessing}
          className="visually-hidden"
        />
      </div>
      {error && (
  <div className="mb-6 error mt-5 w-full max-w-[600px]">
          {error}
        </div>
      )}
    </div>
  );
};

export default InitialView;