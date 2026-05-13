import React from 'react';

export const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-12 min-h-[60vh] flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
        <div className="w-12 h-12 bg-orange-100 rounded-2xl animate-pulse" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
      <p className="text-gray-500 max-w-md mx-auto">
        This module is currently being optimized for your role. Please check back shortly for the full production interface.
      </p>
      <button className="mt-8 bg-orange-500 text-white px-8 py-3 rounded-2xl font-bold hover:bg-orange-600 transition-colors">
        Notify development team
      </button>
    </div>
  );
};
