import React, { useState } from "react";
import { menus } from "../utills/Constants";
import { useLocation, useNavigate } from "react-router-dom";
import { LucideX, Menu, X } from "lucide-react";

interface HeaderProps {
  // : string;
}

const Header: React.FC<HeaderProps> = ({}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const location = useLocation();
  const pathArray = location.pathname.split("/").filter(Boolean);
  const navigate = useNavigate();
  const firstPath =
    pathArray?.[0]?.charAt(0)?.toUpperCase() +
    pathArray?.[0]?.slice(1)?.toLowerCase();

  const handleClick = (item: any) => {
    console.log("item", item);
    navigate(`${item?.path}`);
    setIsMenuOpen(false); // close menu when navigating
  };

  return (
    <>
      <header className=" px-8 py-3 shadow-sm bg-white sticky top-0 z-40">
        <div className="layout-container max-w-[1400px] flex items-center justify-between">
          {/* Logo + App Name */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center bg-blue-500 w-8 h-8 text-white p-2 rounded-lg">
              <div>A</div>
            </div>
            <span className="text-xl font-bold text-gray-800">
            APPLYTOMATION
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1 text-sm text-[#768EA7]">
            {menus?.map((item) => {
              return (
                <div
                  className={`gap-2 px-3 cursor-pointer  lg:px-4 py-2 flex items-center space-x-1 ${
                    firstPath == item?.name
                      ? "bg-blue-500 text-white hover:bg-blue-500 hover:text-white hover:rounded-xl rounded-xl "
                      : "hover:bg-[#EBF1F9] hover:text-black hover:rounded-xl"
                  }`}
                  onClick={() => handleClick(item)}
                >
                  {item?.icon}
                  <span className="font-medium text-sm lg:text-base ">
                    {item?.name}
                  </span>
                </div>
              );
            })}
          
          </nav>
          <button
            className="md:hidden flex items-center justify-center p-2 rounded-lg hover:bg-[#EBF1F9]"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </header>
    {/* Overlay + Slide Menu */}
    <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          isMenuOpen ? "visible bg-black/30" : "invisible bg-transparent"
        }`}
      >
        {/* Slide Panel */}
        <div
          className={`fixed top-0 right-0 h-full w-3/4 max-w-xs bg-white shadow-lg p-5 flex flex-col transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header inside menu */}
          <div className="flex justify-end items-center mb-5">
           
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-1  rounded-md hover:bg-gray-100"
            >
              <LucideX className="h-4 w-4" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex flex-col gap-2 text-sm text-[#768EA7]">
            {menus?.map((item) => (
              <div
                key={item?.name}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer ${
                  firstPath === item?.name
                    ? "bg-blue-500 text-white"
                    : "hover:bg-[#EBF1F9] hover:text-black"
                }`}
                onClick={() => handleClick(item)}
              >
                {item?.icon}
                <span className="font-medium text-base">{item?.name}</span>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header;
