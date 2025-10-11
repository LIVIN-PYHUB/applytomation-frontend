import { Select } from "antd";
import { ChevronDown } from "lucide-react";
import React, { useState } from "react";


interface FilterProps {
  // : string;
}

const Filter: React.FC<FilterProps> = ({}) => {
  const [filters, setFilters] = useState({
    country: null,
    city: null,
    industry: null,
    size: null,
    tier: null,
  });
  const handleChange = (key: any, value: any) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <div className="bg-white shadow-sm rounded-xl  border border-gray-200 mb-4 p-6 ">
        <div>
          <div className="mb-6 text-base md:text-lg font-semibold">Filters</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 w-full">
            <Select
              placeholder="Country"
              value={filters.country}
              onChange={(value) => handleChange("country", value)}
              className={"w-full !h-10"}
              
              suffixIcon={<ChevronDown size={16} />}
              options={[
                {
                  value: "us",
                  label: "United States",
                },
                {
                  value: "uk",
                  label: "United Kingdom",
                },
                {
                  value: "ca",
                  label: "Canada",
                },
              ]}
            />

            <Select
              placeholder="City"
              value={filters.city}
              onChange={(value) => handleChange("city", value)}
              className={"w-full !h-10"}
              suffixIcon={<ChevronDown size={16} />}
              options={[
                {
                  value: "austin",
                  label: "Austin",
                },
                {
                  value: "ny",
                  label: "New York",
                },
                {
                  value: "sf",
                  label: "San Francisco",
                },
              ]}
            />

            <Select
              placeholder="Industry"
              value={filters.industry}
              onChange={(value) => handleChange("industry", value)}
              className={"w-full !h-10"}
              suffixIcon={<ChevronDown size={16} />}
              options={[
                {
                  value: "tech",
                  label: "Tech",
                },
                {
                  value: "finance",
                  label: "Finance",
                },
                {
                  value: "health",
                  label: "Healthcare",
                },
              ]}
            />

            <Select
              placeholder="Company Size"
              value={filters.size}
              onChange={(value) => handleChange("size", value)}
              className={"w-full !h-10"}
              suffixIcon={<ChevronDown size={16} />}
              options={[
                {
                  value: "small",
                  label: "1-50",
                },
                {
                  value: "medium",
                  label: "51-500",
                },
                {
                  value: "large",
                  label: "500+",
                },
              ]}
            />

            <Select
              placeholder="Tier"
              value={filters.tier}
              onChange={(value) => handleChange("tier", value)}
              className={"w-full !h-10"}
              suffixIcon={<ChevronDown size={16} />}
              options={[
                {
                  label: "Tier 1",
                  value: "tier1",
                },
                {
                  label: "Tier 2",
                  value: "tier2",
                },
                {
                  label: "Tier 3",
                  value: "tier3",
                },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Filter;
