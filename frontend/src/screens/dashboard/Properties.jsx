import React from "react";

function Properties() {

  const propertyFeatures = [
    {
      title: "Add Property",
      description: "Register a new property under an owner.",
      image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994"
    },
    {
      title: "View Properties",
      description: "See all registered properties.",
      image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be"
    },
    {
      title: "Update Property",
      description: "Modify property details and information.",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
    },
    {
      title: "Delete Property",
      description: "Remove property from the system.",
      image: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae"
    },
    {
      title: "Property Inspections",
      description: "View inspections scheduled for properties.",
      image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914"
    },
    {
      title: "Property Reports",
      description: "Access property inspection reports.",
      image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c"
    }
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <h1 className="text-2xl font-bold text-gray-700 mb-6">
        Property Management
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {propertyFeatures.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 cursor-pointer"
          >
            {/* Image */}
            <img
              src={item.image}
              alt={item.title}
              className="h-40 w-full object-cover"
            />

            {/* Content */}
            <div className="p-5">
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

          </div>
        ))}

      </div>
    </div>
  );
}

export default Properties;
