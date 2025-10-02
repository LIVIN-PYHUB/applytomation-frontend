import React from "react";
import LoginForm from "./components/LoginForm";

interface LoginProps {
  //: string;
}
const Login: React.FC<LoginProps> = ({}) => {
  return (
    <>
      <div>
       <LoginForm />
      </div>
    </>
  );
};

export default Login;