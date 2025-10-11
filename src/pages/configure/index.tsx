import { Col, Form, Input, message } from "antd";
import UploadComponent from "../../components/UploadComponent";
import Industry from "./components/Industry";
import Locations from "./components/Locations";
import CompanyTier from "./components/CompanyTier";
import { LucidePlus } from "lucide-react";
import DailyApplication from "./components/DailyApplication";

interface configureProps {
  // : string;
}

const configure: React.FC<configureProps> = ({}) => {
  const [form] = Form.useForm();
  const handleSumbit = () => {};
  const handleFileChange = (info: any) => {
    if (info?.file?.name) {
      info.file = {
        ...info.file,
        name: info.file.name.replace(/\.[^.]+$/, (ext: any) =>
          ext.toLowerCase()
        ),
      };
    }
    const fileType = info?.fileList[0]?.originFileObj?.type;

    // Allowed file types
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
      "application/vnd.ms-excel", // XLS
      "text/csv", // CSV
    ];

    // Check if the uploaded file is valid
    if (info?.fileList?.length > 0 && !allowedTypes.includes(fileType)) {
      // Reset the file input field in the form
      form.resetFields(["file"]);

      // Show an error message to the user
      message.error("You can only upload XLSX, XLS, CSV  files!");
    } else {
      // Optional: Add additional logic for handling valid files here
    }
  };
  return (
    <>
      <div className="flex flex-col lg:flex-col m-auto p-4 w-full md:max-w-4xl">
        <Form
          form={form}
          name={"importForm"}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSumbit}
        >
          <div>
            <h2 className="!text-2xl md:text-3xl !font-bold text-black !mb-2">
              Configure Automation
            </h2>
            <div className="!text-sm md:text-base text-[#768EA7]">
              Set up your automated job application preferences
            </div>
          </div>
          <div className="bg-white mt-4 p-6 rounded-xl shadow border border-[#f0f0f0] mb-6   hover:border-[#f0f0f0] group cursor-pointer">
            <h2 className="!text-2xl !font-semibold  !text-black !mb-0">
              Upload Resume
            </h2>
            <div className="!text-sm md:text-base font-normal text-[#768EA7] !mb-6">
              Upload your resume to use for automated applications
            </div>
            <Col span={24}>
              <UploadComponent
                fieldName="file"
                maxCount={1}
                multiple={true}
                accept=".xlsx,.xls,.csv,"
                onChange={handleFileChange}
              />
            </Col>
          </div>
          <DailyApplication />
          <Industry />
          <Locations />
          <CompanyTier />
          <div className="bg-white mt-4 p-6 rounded-xl shadow border border-[#f0f0f0] mb-6   hover:border-[#f0f0f0] group cursor-pointer">
            <h2 className="!text-2xl !font-semibold  !text-black !mb-0">
              Upload Resume
            </h2>
            <div className="!text-sm md:text-base font-normal text-[#768EA7] !mb-6">
              Add specific career sites to target for job applications
            </div>
            <div className="flex flex-row gap-2 flex-1">
              <Form.Item
                name={"phone"}
                className="form-control !h-10 !mb-2 w-full !rounded-2xl"
              >
                {" "}
                <Input placeholder="carrers.google.com" className="!h-10" />
              </Form.Item>
              <div className="w-10 h-10 p-3 bg-blue-500 text-white cursor-pointer rounded-xl ">
                <LucidePlus className="w-4 h-4" />
              </div>
            </div>
          </div>
        </Form>
        <div className="flex flex-row md:flex-row gap-4 w-full">
          <button className="w-full md:w-full cursor-pointer bg-blue-500 !text-white !text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-600 transition">
            Save Changes
          </button>
          <button className="w-auto md:w-auto cursor-pointer border-2 border-[#f0f0f0] bg-white text-black !text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#009900] hover:!text-white transition">
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default configure;
