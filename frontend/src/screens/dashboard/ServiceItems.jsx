import React from "react";
import { ShieldCheck, FileText, Users, ClipboardList } from "lucide-react";

function ServiceItems() {

  const services = [
    {
      title: "Inspection Service",
      description: "Schedule and manage home safety inspections.",
      icon: <ClipboardList size={28} />,
      price: "₹999"
    },
    {
      title: "Owner Management",
      description: "Manage property owners and their details.",
      icon: <Users size={28} />,
      price: "₹499"
    },
    {
      title: "Reports & Documents",
      description: "Access inspection reports and evidence files.",
      icon: <FileText size={28} />,
      price: "₹799"
    },
    {
      title: "Security Package",
      description: "Complete home protection and monitoring.",
      icon: <ShieldCheck size={28} />,
      price: "₹1499"
    }
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      
      <h1 className="text-2xl font-bold mb-6 text-gray-700">
        Our Services
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {services.map((service, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition duration-300"
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-600 mb-4">
              {service.icon}
            </div>

            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              {service.title}
            </h2>

            <p className="text-sm text-gray-500 mb-4">
              {service.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-600">
                {service.price}
              </span>

              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                View
              </button>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}

export default ServiceItems;
