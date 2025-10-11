import { Col, Form, Input, Row } from "antd";
import {
  LucideMail,
  LucideMapPin,
  LucidePhone,
  LucideUser,
} from "lucide-react";
import React from "react";

interface FormCardProps {
  // : string;
}

const FormCard: React.FC<FormCardProps> = ({}) => {
  const [form] = Form.useForm();
  return (
    <>
      <div className="bg-white mt-4 p-6 rounded-xl shadow border border-[#f0f0f0] mb-6   hover:border-[#f0f0f0] group cursor-pointer">
        <div className="flex flex-col">
          <h2 className="text-2xl font-semibold  text-black !mb-0">
            Personal Information
          </h2>
          <div className="!text-sm md:text-base font-normal text-[#768EA7] !mb-6">
            Update your personal details
          </div>
        </div>
        <Form
          form={form}
          name="profileForm"
          layout="vertical"
          requiredMark={false}
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label="Full Name"
                name={"fullName"}
                className="form-control !mb-2"
              >
                <Input
                  placeholder="John Doe"
                  prefix={
                    <LucideUser className="h-4 w-4 mr-2 text-[#768EA7]" />
                  }
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Email"
                name={"email"}
                className="form-control !mb-2"
              >
                {" "}
                <Input
                  placeholder="John@example.com"
                  prefix={
                    <LucideMail className="h-4 w-4 text-[#768EA7] mr-2" />
                  }
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Phone"
                name={"phone"}
                className="form-control !mb-2"
              >
                {" "}
                <Input
                  placeholder="(+1) (555) 000-0000 "
                  prefix={
                    <LucidePhone className="h-4 w-4 text-[#768EA7] mr-2" />
                  }
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Location"
                name={"fullName"}
                className="form-control !mb-2"
              >
                <Input
                  placeholder="USA"
                  prefix={
                    <LucideMapPin className="h-4 w-4 text-[#768EA7] mr-2" />
                  }
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </>
  );
};

export default FormCard;
