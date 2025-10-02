import { Button, Card, Form, Input, message, Typography } from 'antd';
import React from 'react';
import { LoginImg } from '../../../utills/ImageConstants';
import { setToken } from '../../../utills/auth';
import { useNavigate } from 'react-router-dom';
const { Title, Text, Link } = Typography;

interface AppProps {
    // : string;
}

const LoginForm: React.FC<AppProps> = ({}) => {
    const navigate = useNavigate();
    const handleSubmit = (values:any) => {
        if(values?.username && values?.password){
            const token = "Test";
            setToken(token,"/");
            

            // Navigate to home/dashboard
            navigate("/");
            message.success("Login successful!");
        }
    }
    
    return (
        <>
            <div className="min-h-screen flex flex-col lg:flex-row w-full">
                {/* Left - Login Card */}
                <div className="flex justify-center items-center p-4 sm:p-6 md:p-8 lg:p-10 w-full lg:w-1/2 min-h-screen lg:h-screen">
                    <Card
                        className="flex flex-col items-stretch text-card-foreground rounded-xl bg-card border border-border shadow-xs black/5 w-full max-w-[400px]"
                        styles={{
                            body: { padding: "2rem" }, // Replace bodyStyle
                          }}
                    >
                        <div className="flex flex-col items-center text-center mb-6">
                            {/* <div className="">
                                <img src={LoginLogo} className="size-40 !h-12" />
                            </div> */}
                            <Text type="secondary" className="text-sm sm:text-base">
                                Welcome back! Log in with your credentials.
                            </Text>
                        </div>

                        <Form layout="vertical" name="loginForm" requiredMark={false} onFinish={handleSubmit}>
                            <Form.Item
                                label="Username"
                                name="username"
                                rules={[
                                    { required: true, message: "Please enter your username!" },
                                ]}
                            >
                                <Input
                                    autoComplete="off"
                                    placeholder="Enter your username"
                                    className="shadow-xs"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[
                                    { required: true, message: "Please input your password!" },
                                ]}
                            >
                                <Input.Password
                                    autoComplete="off"
                                    placeholder="Enter your password"
                                    className="shadow-xs"
                                    size="large"
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
                            </Form.Item>
                        </Form>
                    </Card>
                </div>

                {/* Right - Image */}
                <div className="hidden lg:block lg:w-1/2 h-screen p-5">
                    <img
                        src={LoginImg}
                        alt="img"
                        className="h-full w-full object-cover rounded-xl"
                    />
                </div>
            </div>    
        </>
    );
};

export default LoginForm;