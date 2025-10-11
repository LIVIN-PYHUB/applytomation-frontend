import { Check } from "lucide-react";
import React, { useState } from "react";

interface DailyApplicationProps {}

const DailyApplication: React.FC<DailyApplicationProps> = ({}) => {
  const [selectedDailyApps, setSelectedDailyApps] = useState<string[]>([]);

  const DailyApps = ["10 Applications", "20 Applications", "50 Applications"];

  const toggleDailyApp = (DailyApp: string) => {
    setSelectedDailyApps((prev) => {
      const newSelection = prev.includes(DailyApp)
        ? prev.filter((item) => item !== DailyApp)
        : [...prev, DailyApp];

      return newSelection;
    });
  };
  return (
    <>
      <div className="bg-white mt-4 p-6 rounded-xl shadow border border-[#f0f0f0] mb-6   hover:border-[#f0f0f0] group cursor-pointer">
        <h2 className="!text-2xl !font-semibold  !text-black !mb-0">
          Daily Application Limit
        </h2>
        <div className="!text-sm md:text-base font-normal text-[#768EA7] !mb-6">
          Set the maximum number of applications to send per day
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DailyApps.map((DailyApp) => (
            <div
              key={DailyApp}
              onClick={() => toggleDailyApp(DailyApp)}
              className={`px-6 py-2 rounded-xl font-medium text-center transition-all duration-200 cursor-pointer   ${
                selectedDailyApps.includes(DailyApp)
                  ? "bg-blue-500 text-white text-xs md:text-sm"
                  : "bg-white text-gray-700 border border-[#e5e7eb] hover:border-[#009900]  hover:bg-[#009900] hover:text-white text-xs md:text-sm"
              }`}
            >
              {DailyApp}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default DailyApplication;
