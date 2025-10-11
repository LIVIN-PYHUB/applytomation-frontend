import React, { useState } from "react";
import { Table, Segmented, Button,  Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeIcon, LucideBell } from "lucide-react";

interface JobApplication {
  key: string;
  jobTitle: string;
  company: string;
  date: string;
  status: "Applied" | "Reviewing" | "Interview" | "Rejected";
}

type SegmentOption = "All" | "Selected" | "Feedback" | "Reminders";

const JobApplicationTracker: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<SegmentOption>("All");

  const jobData: JobApplication[] = [
    {
      key: "1",
      jobTitle: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      date: "2024-01-15",
      status: "Applied",
    },
    {
      key: "2",
      jobTitle: "Product Manager",
      company: "Innovation Labs",
      date: "2024-01-14",
      status: "Reviewing",
    },
    {
      key: "3",
      jobTitle: "UX Designer",
      company: "Design Studio",
      date: "2024-01-13",
      status: "Interview",
    },
    {
      key: "4",
      jobTitle: "Backend Engineer",
      company: "CloudSystems",
      date: "2024-01-12",
      status: "Applied",
    },
    {
      key: "5",
      jobTitle: "Data Scientist",
      company: "Analytics Pro",
      date: "2024-01-11",
      status: "Rejected",
    },
    {
      key: "6",
      jobTitle: "DevOps Engineer",
      company: "Infrastructure Co",
      date: "2024-01-10",
      status: "Applied",
    },
    {
      key: "7",
      jobTitle: "Full Stack Developer",
      company: "StartupXYZ",
      date: "2024-01-09",
      status: "Interview",
    },
    {
      key: "8",
      jobTitle: "Software Architect",
      company: "Enterprise Corp",
      date: "2024-01-08",
      status: "Reviewing",
    },
  ];

  const statusColors: Record<JobApplication["status"], string> = {
    Applied: "default",
    Reviewing: "processing",
    Interview: "processing",
    Rejected: "error",
  };

  const handleView = (record: JobApplication): void => {
    console.log("View clicked:", record);
  };

  const handleRemind = (record: JobApplication): void => {
    console.log("Remind clicked:", record);
  };

  const columns: ColumnsType<JobApplication> = [
    {
      title: "Job Title",
      dataIndex: "jobTitle",
      key: "jobTitle",
      width: "25%",
      className: "font-medium text-sm",
    },
    {
      title: "Company",
      dataIndex: "company",
      key: "company",
      width: "20%",
      className: "text-gray-600",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: "15%",
      className: "text-gray-600",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "15%",
      render: (status: JobApplication["status"]) => (
        <span className="bg-[#EBF1F9] inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent   self-start">
          {status}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "25%",
      align: "right",
      render: (_: any, record: JobApplication) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeIcon className="h-4 w-4" />}
            className="!h-9 !border-2 !border-[#f0f0f0] !bg-white !text-black !text-sm 1font-medium !px-4 !py-2 !rounded-lg hover:!bg-[#009900] hover:!text-white"
            onClick={() => handleView(record)}
          >
            View
          </Button>
          <Button
            icon={<LucideBell className="w-4 h-4 md:mr-1" />}
            className="!h-9 !border-2 !border-[#f0f0f0] !bg-white !text-black !text-sm 1font-medium !px-4 !py-2 !rounded-lg hover:!bg-[#009900] hover:!text-white"
            onClick={() => handleRemind(record)}
          >
            Remind
          </Button>
        </Space>
      ),
    },
  ];

  const segmentOptions: SegmentOption[] = [
    "All",
    "Selected",
    "Feedback",
    "Reminders",
  ];

  return (
    <div className="">
      <div className="w-full border border-gray-200 rounded-lg">
        <div className="bg-white  rounded-lg shadow-sm p-4 md:p-6">
          <Segmented
            options={segmentOptions}
            value={selectedSegment}
            onChange={(value) => setSelectedSegment(value as SegmentOption)}
            block
            className="mb-6 !bg-[#E8EAF0] rounded-xl !p-1.5 flex item-center !text-[#768EA7] !text-xs font-medium md:!text-sm"
          />

          <Table<JobApplication>
            columns={columns}
            dataSource={jobData}
            pagination={false}
            className="mt-4"
            rowClassName="hover:bg-gray-50 transition-colors"
            scroll={{ x: 'max-content' }}
          />
        </div>
      </div>
    </div>
  );
};

export default JobApplicationTracker;
