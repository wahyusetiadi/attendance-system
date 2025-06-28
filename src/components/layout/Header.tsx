'use client';

import { Button } from '@/components/ui/Button';
import { Bell, User, Search, Menu, MessageSquare } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden md:block">
            <h1 className="text-2xl font-bold text-gray-900">
              Sistem Manajemen Guru
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola data guru dengan mudah dan efisien
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="hidden md:block relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Search..."
              className="pl-10 pr-4 py-2.5 w-80 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            {/* Messages */}
            <Button variant="ghost" size="sm" className="relative hover:bg-blue-50">
              <MessageSquare className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
                2
              </span>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative hover:bg-blue-50">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
                5
              </span>
            </Button>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-xl p-2 transition-colors">
            <div className="h-9 w-9 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-700">
                Admin User
              </p>
              <p className="text-xs text-gray-500">
                Administrator
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
