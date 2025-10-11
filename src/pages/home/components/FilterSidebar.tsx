import React from "react";

const FilterSidebar: React.FC = () => {
  const filterMenu = [
    {
      title: "Industry",
      subMenu: [
       
        {
          title: "Technology",
        },
        {
          title: "Finance",
        },
        {
          title: "Healthcare",
        },
        {
          title: "Education",
        },
      ],
    },

    {
      title: "Location",
      subMenu: [
        {
          title: "Remote",
        },
        {
          title: "On-site",
        },
        {
          title: "Hybrid",
        },
      ],
    },
    {
      title: "Salary Range",
      subMenu: [
        {
          title: "$80k - $100k",
        },
        {
          title: "$100k - $150k",
        },
        {
          title: "$150k+",
        },
      ],
    },
  ];
  return (
    <div className="w-full md:w-64 bg-white p-6 rounded-xl shadow-sm border border-[#f0f0f0] h-max mr-6">
      <h3 className="font-semibold tracking-tight text-base md:text-lg">
        Filters
      </h3>
      {filterMenu?.map((item, i) => {
        return (
          <div className="mb-3" key={i}>
            <h4 className="text-sm font-base text-black mb-2">
              {item?.title}
            </h4>
            <ul className="text-sm font-base text-[#768EA7] cursor-pointer">
              {item?.subMenu?.map((x, i) => {
                return (
                  <li className="mb-2" key={i}>
                    {x.title}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default FilterSidebar;
