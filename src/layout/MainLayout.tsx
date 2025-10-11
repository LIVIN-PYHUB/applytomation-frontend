import React from "react";
import Header from "./Header";
import { Outlet } from "react-router-dom";



const MainLayout: React.FC = () => {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        {/* Content Area */}
        <div className="layout-container max-w-[1400px] mx-auto w-full overflow-x-auto py-4 md:py-8">
          <Outlet />
        </div>
      </div>
    );
  };

export default MainLayout;
