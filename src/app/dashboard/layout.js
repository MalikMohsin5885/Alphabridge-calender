import React from "react";
import Header from "../../components/Header";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex flex-col h-screen">
      <div className="sticky top-0 z-50">
        <Header />
      </div>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
