import React from "react";
import JobApplicationTracker from "./components/JobApplicationTracker";

interface HistoryProps {
  // : string;
}

const History: React.FC<HistoryProps> = ({}) => {
  return (
    <>
      <div className="flex flex-col lg:flex-col p-4">
        <div className="flex-1">
          <h2 className="!mt-6 md:!mt-0 text-2xl md:text-3xl !font-bold text-black !mb-2">
            Application History
          </h2>
          <p className="text-sm md:text-base text-[#768EA7] !mb-6">
            Track all your job applications and their status
          </p>
        </div>
        <div>
          <JobApplicationTracker />
        </div>
      </div>
    </>
  );
};

export default History;
