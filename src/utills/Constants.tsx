import { Building2, History, Home, Settings, User } from "lucide-react";

export const menus = [
    { name: "Home", icon:  <Home size={16} />, path: "/home" },
    { name: "Companies",icon:  <Building2 size={16} />, path: "/companies" },
    { name: "Configure",icon:  <Settings size={16} />, path: "/configure" },
    { name: "History",icon:  <History size={16} />, path: "/history" },
    { name: "Profile",icon:  <User size={16} />, path: "/profile" },
  ];
  export const getFileSize = (size: any) => {
    const kb = size / 1024;
    // Convert size to MB
    const mb = kb / 1024;
  
    // Show size in MB if it's larger than 1 MB, otherwise show in KB
    const FileSize = mb >= 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
    return FileSize;
  };