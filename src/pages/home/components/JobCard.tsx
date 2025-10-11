import { Building2, LucideDollarSign, LucideMapPin } from "lucide-react";
import React from "react";

type Job = {
  title: string;
  company: string;
  location: string;
  salary: string;
  jobType: string;
 
};

interface JobCardProps {
  job: Job;
  setOpen:any;
}

const JobCard: React.FC<JobCardProps> = ({ job ,setOpen}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow border border-[#f0f0f0] mb-6 transition-all duration-300 hover:shadow-lg hover:border-[#f0f0f0] group cursor-pointer">
      <div className="flex justify-between items-center">
        <div className="font-semibold text-black text-lg md:text-xl">
          {job?.title}
        </div>
        <span className="hidden sm:inline-flex bg-[#EBF1F9] items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent   self-start">
          {job?.jobType}
        </span>
      </div>
      <div className="flex items-center gap-2 mb-2 md:mb-6">
        <Building2 className="h-4 w-4 text-[#768EA7]" />
        <div className="text-[#768EA7] flex items-center gap-4 text-sm md:text-base !mb-0">
          {job.company}
        </div>
      </div>
      <span className=" inline-flex sm:hidden bg-[#EBF1F9] items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent mb-6  self-start">
          {job?.jobType}
      </span>
      <div className="flex flex-col items-start gap-2 md:flex-row md:items-start md:gap-2 sm:gap-6 mb-4">
        <div className="flex items-center gap-2">
          <LucideMapPin className="h-4 w-4 text-[#768EA7]" />
          <div className="text-sm font-base text-[#768EA7] !mb-0">
            {job.location}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LucideDollarSign className="h-4 w-4 text-[#768EA7]" />
          <div className="text-sm font-base text-[#768EA7] !mb-0">
            ${job.salary}
          </div>
        </div>
      </div>

      <button className="w-full md:w-auto cursor-pointer bg-blue-500 !text-white !text-sm !font-medium px-4 py-2 rounded-lg hover:bg-blue-500 transition" onClick={()=>setOpen(true)}>
        View Details
      </button>
    </div>
  );
};

export default JobCard;
