import React, { useState } from "react";
import Filter from "./components/Filter";
import CompanyCard from "./components/DetailCard";
import DetailModal from "./components/DetailModal";
import { useNavigate } from "react-router-dom";

interface CompaniesProps {
  // : string;
}

const Companies: React.FC<CompaniesProps> = ({}) => {
    const [open,setOpen] = useState<boolean>(false)
    const navigate = useNavigate();
  const companies = [
    {
      name: "TechCorp Inc.",
      industry: "Technology",
      location: "San Francisco, CA",
      employees: "1000-5000 employees",
      tier: "Tier 1",
    },
    {
      name: "Innovation Labs",
      industry: "Technology",
      location: "New York, NY",
      employees: "500-1000 employees",
      tier: "Tier 1",
    },
    {
      name: "Design Studio",
      industry: "Design",
      location: "Austin, TX",
      employees: "100-500 employees",
      tier: "Tier 2",
    },
    {
      name: "CloudSystems",
      industry: "Technology",
      location: "Seattle, WA",
      employees: "5000+ employees",
      tier: "Tier 1",
    },
    {
      name: "Analytics Pro",
      industry: "Data Science",
      location: "Boston, MA",
      employees: "500-1000 employees",
      tier: "Tier 2",
    },
    {
      name: "Infrastructure Co",
      industry: "Technology",
      location: "Remote",
      employees: "1000-5000 employees",
      tier: "Tier 1",
    },
    {
      name: "Finance Group",
      industry: "Finance",
      location: "Chicago, IL",
      employees: "5000+ employees",
      tier: "Tier 1",
    },
    {
      name: "Healthcare Plus",
      industry: "Healthcare",
      location: "Los Angeles, CA",
      employees: "1000-5000 employees",
      tier: "Tier 2",
    },
  ];
  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-col p-4 min-h-screen">
        <div className="flex flex-col md:flex-row justify-between w-full">
          <h1 className="text-2xl md:text-3xl !font-bold !text-black !mb-4">
            Companies
          </h1>
          <div>
            <button className="cursor-pointer border-2 border-[#f0f0f0] bg-white !text-black !text-sm !font-medium px-4 py-2 rounded-lg hover:bg-[#009900] hover:!text-white transition" onClick={()=>navigate("/home")}>
              Back to Dashboard
            </button>
          </div>
        </div>
        <Filter />
        <div className="">
          {/* Grid Layout - 1 column on mobile, 2 on tablet, 3 on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {companies.map((company, index) => (
              <CompanyCard key={index} {...company} setOpen={setOpen}/>
            ))}
          </div>
        </div>
        <DetailModal open={open} setOpen={setOpen}/>
      </div>
    </>
  );
};

export default Companies;
