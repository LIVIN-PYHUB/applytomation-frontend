import { Check } from 'lucide-react';
import React, { useState } from 'react';

interface IndustryProps {
    // : string;
}

const Industry: React.FC<IndustryProps> = ({  }) => {
    const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
   
  
    const industries = [
      'Technology',
      'Finance',
      'Healthcare',
      'Education',
      'Retail',
      'Manufacturing',
    ];
    const isAllIndustriesSelected = selectedIndustries.length === industries.length;

    const toggleIndustry = (industry: string) => {
        setSelectedIndustries((prev) => {
          if (industry === 'All Industries') {
            return prev.length === industries.length ? [] : [...industries];
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
              Select Industries
            </h2>
            <div className="!text-sm md:text-base font-normal text-[#768EA7] !mb-6">
              Choose industries you're interested in, or select "All Industries"
            </div>
            <div className="space-y-4">
              {/* All Industries Button */}
              <div
                onClick={() => toggleIndustry('All Industries')}
                className={`w-full px-6 py-2 h-10 rounded-xl font-medium text-center transition-all duration-200 cursor-pointer ${
                  isAllIndustriesSelected
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 border border-[#e5e7eb]  hover:border-blue-400  hover:bg-blue-500 hover:text-white '
                }`}
              >
                {isAllIndustriesSelected && (
                  <Check className="inline-block w-5 h-5 mr-2" />
                )}
                All Industries
              </div>

              {/* Industry Grid */}
              <div className="grid grid-cols-2 gap-4">
                {industries.map((industry) => (
                  <div
                    key={industry}
                    onClick={() => toggleIndustry(industry)}
                    className={`px-6 h-10 py-2 rounded-2xl font-medium text-center transition-all duration-200 cursor-pointer ${
                      selectedIndustries.includes(industry)
                        ? 'bg-blue-500 text-white text-xs md:text-sm'
                        : 'bg-white text-gray-700 border border-[#e5e7eb] hover:border-blue-400  hover:bg-blue-500 hover:text-white text-xs md:text-sm'
                    }`}
                  >
                    {selectedIndustries.includes(industry) && (
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

export default Industry;
