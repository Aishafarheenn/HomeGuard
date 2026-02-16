import React, { useEffect, useState } from "react";

function Inspection() {

  const [inspections, setInspections] = useState([]);

  // 🔥 Dummy Data (Replace with API later)
  useEffect(() => {
    setInspections([
      {
        id: 1,
        property: "Villa - Kochi",
        owner: "Rahul",
        inspector: "Arjun",
        date: "2026-02-20",
        status: "Scheduled"
      },
      {
        id: 2,
        property: "Apartment - Calicut",
        owner: "Nisha",
        inspector: "Akhil",
        date: "2026-02-15",
        status: "Completed"
      }
    ]);
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-700">
          Inspection Management
        </h1>

        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          + Schedule Inspection
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">

        <table className="min-w-full">

          <thead className="bg-gray-200">
            <tr>
              <th className="py-3 px-4 text-left">Property</th>
              <th className="py-3 px-4 text-left">Owner</th>
              <th className="py-3 px-4 text-left">Inspector</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {inspections.map((inspection) => (
              <tr
                key={inspection.id}
                className="border-b hover:bg-gray-50"
              >
                <td className="py-3 px-4">{inspection.property}</td>
                <td className="py-3 px-4">{inspection.owner}</td>
                <td className="py-3 px-4">{inspection.inspector}</td>
                <td className="py-3 px-4">{inspection.date}</td>

                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      inspection.status === "Completed"
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {inspection.status}
                  </span>
                </td>

                <td className="py-3 px-4 space-x-2">
                  <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                    View
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

export default Inspection;
