import { Check } from "lucide-react";
import React, { useState } from "react";

interface LocationsProps {
  // : string;
}

const Locations: React.FC<LocationsProps> = ({}) => {
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  const locations = [
    "San Francisco",
    "New York",
    "Austin",
    "Seattle",
    "Boston",
    "Remote",
  ];

  const toggleLocation = (location: string) => {
    setSelectedLocations((prev) => {
      const newSelection = prev.includes(location)
        ? prev.filter((item) => item !== location)
        : [...prev, location];

      return newSelection;
    });
  };

  return (
    <>
      <div className="bg-white mt-4 p-6 rounded-xl shadow border border-[#f0f0f0] mb-6   hover:border-[#f0f0f0] group cursor-pointer">
        <h2 className="!text-2xl !font-semibold  !text-black !mb-0">
          Select Locations
        </h2>
        <div className="!text-sm md:text-base font-normal text-[#768EA7] !mb-6">
          Choose preferred job locations
        </div>
        <div className="grid grid-cols-2 gap-4">
          {locations.map((location) => (
            <div
              key={location}
              onClick={() => toggleLocation(location)}
              className={`px-6 py-2 rounded-2xl font-medium text-center transition-all duration-200 cursor-pointer ${
                selectedLocations.includes(location)
                  ? "bg-blue-500 text-white text-xs md:text-sm"
                  : "bg-white text-gray-700 border border-[#e5e7eb] hover:border-blue-400  hover:bg-blue-500 hover:text-white  text-xs md:text-sm"
              }`}
            >
              {selectedLocations.includes(location) && (
                <Check className="inline-block w-5 h-5 mr-2" />
              )}
              {location}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Locations;
