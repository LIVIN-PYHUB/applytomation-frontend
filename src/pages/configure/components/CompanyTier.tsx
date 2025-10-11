import { Check } from "lucide-react";
import React, { useState } from "react";

interface CompanyTierProps {
  // : string;
}

const CompanyTier: React.FC<CompanyTierProps> = ({}) => {
  const [selectedCompanyTier, setSelectedCompanyTier] = useState<string[]>([]);

  const CompanyTier = ["Tier 1", "Tier 2"];
  const isAllCompanyTierSelected =
    selectedCompanyTier.length === CompanyTier.length;

  const toggleIndustry = (industry: string) => {
    setSelectedCompanyTier((prev) => {
      if (industry === "All CompanyTier") {
        return prev.length === CompanyTier.length ? [] : [...CompanyTier];
      }

      const newSelection = prev.includes(industry)
        ? prev.filter((item) => item !== industry)
        : [...prev, industry];

      return newSelection;
    });
  };
  return (
    <>
      <div className="bg-white mt-4 p-6 rounded-xl shadow border border-[#f0f0f0] mb-6   hover:border-[#f0f0f0] group cursor-pointer">
        <h2 className="!text-2xl !font-semibold  !text-black !mb-0">
          Select Company Tier
        </h2>
        <div className="!text-sm md:text-base font-normal text-[#768EA7] !mb-6">
          Select which company tiers to target
        </div>
        <div className="space-y-4">
          {/* All CompanyTier Button */}
          <div
            onClick={() => toggleIndustry("All CompanyTier")}
            className={`w-full px-6 py-2 h-10 rounded-xl font-medium text-center transition-all duration-200 cursor-pointer ${
              isAllCompanyTierSelected
                ? "bg-blue-500 text-white text-xs md:text-sm"
                : "bg-white text-gray-700 border border-[#e5e7eb]  hover:border-blue-400  hover:bg-blue-500 hover:text-white text-xs md:text-sm"
            }`}
          >
            {isAllCompanyTierSelected && (
              <Check className="inline-block w-5 h-5 mr-2" />
            )}
            All Tiers
          </div>

          {/* Industry Grid */}
          <div className="grid grid-cols-2 gap-4">
            {CompanyTier.map((industry) => (
              <div
                key={industry}
                onClick={() => toggleIndustry(industry)}
                className={`px-6 h-10 py-2 rounded-2xl font-medium text-center transition-all duration-200 cursor-pointer ${
                  selectedCompanyTier.includes(industry)
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 border border-[#e5e7eb] hover:border-blue-400  hover:bg-blue-500 hover:text-white "
                }`}
              >
                {selectedCompanyTier.includes(industry) && (
                  <Check className="inline-block w-5 h-5 mr-2" />
                )}
                {industry}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyTier;
