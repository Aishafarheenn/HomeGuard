import React from "react";
import { Users, PlusCircle, Edit, Trash2, ClipboardList, FileText } from "lucide-react";

function Owners() {

  const ownerFeatures = [
    {
      title: "Add Owner",
      description: "Register a new property owner.",
      icon: <PlusCircle size={26} />,
    },
    {
      title: "View Owners",
      description: "See all registered property owners.",
      icon: <Users size={26} />,
    },
    {
      title: "Update Owner",
      description: "Edit existing owner details.",
      icon: <Edit size={26} />,
    },
    {
      title: "Delete Owner",
      description: "Remove an owner from the system.",
      icon: <Trash2 size={26} />,
    },
    {
      title: "Owner Inspections",
      description: "View inspections assigned to owners.",
      icon: <ClipboardList size={26} />,
    },
    {
      title: "Owner Reports",
      description: "Access inspection reports of owners.",
      icon: <FileText size={26} />,
    }
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <h1 className="text-2xl font-bold text-gray-700 mb-6">
        Owner Management
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {ownerFeatures.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition duration-300 cursor-pointer"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 text-green-600 mb-4">
              {item.icon}
            </div>

            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              {item.title}
            </h2>

            <p className="text-sm text-gray-500 mb-4">
              {item.description}
            </p>

            <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Open
            </button>
          </div>
        ))}

      </div>
    </div>
  );
}

export default Owners;
