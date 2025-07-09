// src/app/(pages)/layout.tsx
"use client";

import React, { useState } from "react";
// import { NotificationProvider } from "@/contexts/NotificationContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    // <NotificationProvider>
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={handleMenuClick} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
        <main className="flex-1 p-6 lg:ml-64">{children}</main>
      </div>
    </div>
    // </NotificationProvider>
  );
}
