import { Button, Card, Form, Input, message, Typography } from "antd";
import React from "react";
import { LoginImg } from "../../../utills/ImageConstants";
import { setToken } from "../../../utills/auth";
import { useNavigate } from "react-router-dom";
const { Text } = Typography;

interface AppProps {
  // : string;
}

const LoginForm: React.FC<AppProps> = ({}) => {
  const navigate = useNavigate();
  const handleSubmit = (values: any) => {
    if (values?.username && values?.password) {
      const token = "Test";
      setToken(token, "/");

      // Navigate to home/dashboard
      navigate("/");
      message.success("Login successful!");
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col lg:flex-row w-full bg-gradient-to-br from-primary/5 via-background to-accent/5 ">
        {/* Left - Login Card */}
        <div className="flex justify-center items-center p-4 sm:p-6 md:p-8 lg:p-10 w-full lg:w-full min-h-screen lg:h-screen">
          <Card
            className="flex flex-col items-stretch text-card-foreground !rounded-2xl bg-card border border-[#f0f0f0] shadow-lg black/5 w-full max-w-md !p-8 !pb-3"
            
          >
            <div className="flex items-center flex-col space-x-2">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 bg-blue-500  p-2 ">
                <div className="font-bold text-white text-2xl">A</div>
              </div>
              <span className="text-3xl font-bold text-gray-800 mb-2">
              APPLYTOMATION
              </span>
              <div className="text-base font-normal text-[#768EA7] !mb-6">
                Automate your job search
              </div>
            </div>

            <Form
              layout="vertical"
              name="loginForm"
              requiredMark={false}
              onFinish={handleSubmit}
            >
              <Form.Item
                label="Email"
                name="username"
                rules={[
                  { required: true, message: "Please enter your Email" },
                ]}
                
        
              >
                <Input
                  autoComplete="off"
                  placeholder="your@email.com"
                  className="shadow-xs !h-[44px] !rounded-xl border border-[#f0f0f0] !mb-0"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
                 className="form-control"
              >
                <Input.Password
                  autoComplete="off"
                  placeholder="Enter your password"
                 className="shadow-xs  !rounded-xl !h-[44px] border border-[#f0f0f0] !mb-0"
                  size="large"
                  iconRender={() => null} // ✅ Removes the eye icon

                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  className="!h-10 sm:!h-11 !rounded-md !text-sm sm:!text-base !px-3 gap-1.5"
                  loading={false}
                >
                  Login
                </Button>
                <a className="text-sm text-primary hover:underline flex items-center justify-center mt-4">Don't have an account? Sign up</a>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
