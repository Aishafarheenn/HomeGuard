import React from 'react';

function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-600 text-sm mb-2">Total Properties</h3>
          <p className="text-4xl font-bold text-gray-900">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-600 text-sm mb-2">Inspections</h3>
          <p className="text-4xl font-bold text-gray-900">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-600 text-sm mb-2">Reports</h3>
          <p className="text-4xl font-bold text-gray-900">0</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
