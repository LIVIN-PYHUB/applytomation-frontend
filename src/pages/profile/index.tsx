import React from "react";
import FormCard from "./FormCard";

interface ProfileProps {
  // : string;
}

const Profile: React.FC<ProfileProps> = ({}) => {
  return (
    <>
      <div className="flex flex-col lg:flex-col m-auto p-4 w-full md:max-w-4xl">
        <div>
          <h2 className="!text-2xl md:text-3xl !font-bold text-black !mb-2">
            Profile
          </h2>
          <div className="!text-sm md:text-base text-[#768EA7]">
            Manage your account settings and preferences
          </div>
        </div>

        <FormCard />
        <div className="bg-white mt-4 p-6 rounded-xl shadow border border-[#f0f0f0] mb-6   hover:border-[#f0f0f0] group cursor-pointer">
          <h2 className="!text-2xl !font-semibold  !text-black !mb-0">
            Accounts
          </h2>
          <div className="!text-sm md:text-base font-normal text-[#768EA7] !mb-6">
            Manage your account settings and preferences
          </div>
          <div className="!text-sm md:text-base font-normal text-[#768EA7] !mb-0">
            Additional account settings and preferences would appear here.
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-2 w-full">
          <button className="w-full md:w-auto cursor-pointer bg-blue-500 !text-white !text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-600 transition">
            Save Changes
          </button>
          <button className="w-full md:w-auto cursor-pointer border-2 border-[#f0f0f0] bg-white text-black !text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#009900] hover:!text-white transition">
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default Profile;
