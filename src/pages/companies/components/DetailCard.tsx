import React from "react";
import { Building2, MapPin, Users } from "lucide-react";

interface CompanyCardProps {
  name: string;
  industry: string;
  location: string;
  employees: string;
  tier: string;
  icon?: React.ReactNode;
  setOpen:any;
}

const CompanyCard: React.FC<CompanyCardProps> = ({
  name,
  industry,
  location,
  employees,
  tier,
  icon,setOpen,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 h-full cursor-pointer" onClick={()=>setOpen(true)}>
      {/* Icon and Tier Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
          {icon || <Building2 className="w-6 h-6 text-blue-600" />}
        </div>
        <span className="bg-[#EBF1F9] inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent   self-start">
          {tier}
        </span>
      </div>

      {/* Company Name and Industry */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900  line-clamp-1 !mb-0 ">
          {name}
        </h3>
        <p className="text-sm text-[#768EA7] font-base !mb-0 ">
          {industry}
        </p>
      </div>

      {/* Location and Employees */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[#768EA7]">
          <MapPin className="w-4 h-4 text-[#768EA7] flex-shrink-0" />
          <span className="text-sm line-clamp-1">{location}</span>
        </div>
        <div className="flex items-center gap-2 text-[#768EA7]">
          <Users className="w-4 h-4 font-base text-[#768EA7] flex-shrink-0" />
          <span className="text-sm font-base text-[#768EA7] line-clamp-1">{employees}</span>
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;
