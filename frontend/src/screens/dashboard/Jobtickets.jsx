import React, { useEffect, useState } from "react";

function JobTickets() {

  const [tickets, setTickets] = useState([]);

  // 🔥 Dummy Data (Replace with API later)
  useEffect(() => {
    setTickets([
      {
        id: 1,
        property: "Villa - Kochi",
        owner: "Rahul",
        inspector: "Arjun",
        issue: "Electrical wiring check",
        priority: "High",
        status: "Open",
        date: "2026-02-16"
      },
      {
        id: 2,
        property: "Apartment - Calicut",
        owner: "Nisha",
        inspector: "Akhil",
        issue: "Water leakage inspection",
        priority: "Medium",
        status: "In Progress",
        date: "2026-02-14"
      }
    ]);
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-700">
          Job Tickets
        </h1>

        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          + Create Ticket
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">

        <table className="min-w-full">

          <thead className="bg-gray-200">
            <tr>
              <th className="py-3 px-4 text-left">Property</th>
              <th className="py-3 px-4 text-left">Owner</th>
              <th className="py-3 px-4 text-left">Inspector</th>
              <th className="py-3 px-4 text-left">Issue</th>
              <th className="py-3 px-4 text-left">Priority</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="border-b hover:bg-gray-50"
              >
                <td className="py-3 px-4">{ticket.property}</td>
                <td className="py-3 px-4">{ticket.owner}</td>
                <td className="py-3 px-4">{ticket.inspector}</td>
                <td className="py-3 px-4">{ticket.issue}</td>

                {/* Priority Badge */}
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      ticket.priority === "High"
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {ticket.priority}
                  </span>
                </td>

                {/* Status Badge */}
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      ticket.status === "Completed"
                        ? "bg-green-100 text-green-600"
                        : ticket.status === "In Progress"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </td>

                {/* Actions */}
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

export default JobTickets;
