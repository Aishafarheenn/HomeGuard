import React, { useEffect, useState } from "react";

function Inspector() {

  const [inspectors, setInspectors] = useState([]);

  // 🔥 Dummy Data (Replace with API later)
  useEffect(() => {
    setInspectors([
      {
        id: 1,
        name: "Arjun",
        email: "arjun@gmail.com",
        phone: "9876543210",
        experience: "5 Years",
        properties: 4,
        status: "Active"
      },
      {
        id: 2,
        name: "Akhil",
        email: "akhil@gmail.com",
        phone: "9123456780",
        experience: "3 Years",
        properties: 2,
        status: "Inactive"
      }
    ]);
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-700">
          Inspector Management
        </h1>

        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          + Add Inspector
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">

        <table className="min-w-full">

          <thead className="bg-gray-200">
            <tr>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Phone</th>
              <th className="py-3 px-4 text-left">Experience</th>
              <th className="py-3 px-4 text-left">Assigned Properties</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {inspectors.map((inspector) => (
              <tr
                key={inspector.id}
                className="border-b hover:bg-gray-50"
              >
                <td className="py-3 px-4 font-medium">{inspector.name}</td>
                <td className="py-3 px-4">{inspector.email}</td>
                <td className="py-3 px-4">{inspector.phone}</td>
                <td className="py-3 px-4">{inspector.experience}</td>
                <td className="py-3 px-4">{inspector.properties}</td>

                {/* Status Badge */}
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      inspector.status === "Active"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {inspector.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-3 px-4 space-x-2">
                  <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                    View
                  </button>

                  <button className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                    Edit
                  </button>

                  <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                    Delete
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Inspector;
