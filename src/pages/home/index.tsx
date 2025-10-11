import React, { useState } from 'react';
import FilterSidebar from './components/FilterSidebar';
import JobCard from './components/JobCard';
import DetailModal from './components/DetailModal';


type Job = {
  title: string;
  company: string;
  location: string;
  salary: string;
  jobType: string;
};

const jobData: Job[] = [
    {
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      salary: '120k - 160k',
      jobType: 'Full-time'
    },
    {
      title: 'Product Manager',
      company: 'Innovation Labs',
      location: 'New York, NY',
      salary: '130k - 180k',
      jobType: 'Full-time'
    },
    {
      title: 'UX Designer',
      company: 'Design Studio',
      location: 'Austin, TX',
      salary: '$90k - $120k',
      jobType: 'Full-time'
    },
    {
      title: 'Backend Engineer',
      company: 'CloudSystems',
      location: 'Seattle, WA',
      salary: '$110k - $150k',
      jobType: 'Remote'
    },
    {
      title: 'Data Scientist',
      company: 'Analytics Pro',
      location: 'Boston, MA',
      salary: '$125k - $170k',
      jobType: 'Hybrid'
    },
    {
      title: 'DevOps Engineer',
      company: 'Infrastructure Co',
      location: 'Remote',
      salary: '$115k - $155k',
      jobType: 'Remote'
    }
  ];
  

const JobsPage: React.FC = () => {
    const [open,setOpen] = useState<boolean>(false)
  return (
    <div className="flex flex-col lg:flex-row p-4">
      <FilterSidebar />
      <div className="flex-1">
        <h2 className="!mt-6 md:!mt-0 text-2xl md:text-3xl !font-bold text-black !mb-2">Recommended Jobs for You</h2>
        <p className='text-sm md:text-base text-[#768EA7] !mb-6'>Based on your profile and preferences</p>
        {jobData.map((job, index) => (
          <JobCard key={index} job={job} setOpen={setOpen}/>
        ))}
      </div>
      <DetailModal open={open} setOpen={setOpen}/>
    </div>
  );
};

export default JobsPage;
