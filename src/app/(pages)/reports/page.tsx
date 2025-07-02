'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Download, 
  Filter,
  Calendar,
  PieChart,
  FileText
} from 'lucide-react';

const reportTypes = [
  {
    id: 'teacher-performance',
    title: 'Kinerja Guru',
    description: 'Laporan evaluasi kinerja dan kehadiran guru',
    icon: Users,
    color: 'bg-blue-500'
  },
  {
    id: 'subject-analysis',
    title: 'Analisis Mata Pelajaran',
    description: 'Statistik dan analisis per mata pelajaran',
    icon: BookOpen,
    color: 'bg-green-500'
  },
  {
    id: 'attendance',
    title: 'Kehadiran',
    description: 'Laporan kehadiran guru dan siswa',
    icon: Calendar,
    color: 'bg-purple-500'
  },
  {
    id: 'schedule-efficiency',
    title: 'Efisiensi Jadwal',
    description: 'Analisis utilisasi ruang dan waktu',
    icon: BarChart3,
    color: 'bg-orange-500'
  }
];

const quickStats = [
  { label: 'Laporan Bulan Ini', value: '24', trend: '+12%', color: 'text-blue-600' },
  { label: 'Rata-rata Kehadiran', value: '94%', trend: '+2%', color: 'text-green-600' },
  { label: 'Kinerja Guru', value: '8.5/10', trend: '+0.3', color: 'text-purple-600' },
  { label: 'Utilisasi Ruang', value: '87%', trend: '+5%', color: 'text-orange-600' },
];

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('this-month');
  // const [selectedReport, setSelectedReport] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan & Analitik</h1>
          <p className="text-gray-600 mt-2">Pantau kinerja sekolah dengan data yang akurat</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Periode Laporan</h2>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="this-week">Minggu Ini</option>
            <option value="this-month">Bulan Ini</option>
            <option value="this-semester">Semester Ini</option>
            <option value="this-year">Tahun Ini</option>
            <option value="custom">Periode Kustom</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">{stat.trend}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => (
          <div key={report.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-xl ${report.color} shadow-lg`}>
                <report.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                <p className="text-gray-600 mb-4">{report.description}</p>
                <div className="flex space-x-2">
                  <Button size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Lihat Laporan
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teacher Performance Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Kinerja Guru per Bulan</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-blue-400 mx-auto mb-2" />
              <p className="text-gray-500">Grafik Kinerja Guru</p>
              <p className="text-sm text-gray-400">Data akan ditampilkan di sini</p>
            </div>
          </div>
        </div>

        {/* Subject Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Distribusi Mata Pelajaran</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PieChart className="h-12 w-12 text-green-400 mx-auto mb-2" />
              <p className="text-gray-500">Diagram Mata Pelajaran</p>
              <p className="text-sm text-gray-400">Data akan ditampilkan di sini</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Laporan Terbaru</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { name: 'Laporan Kehadiran November 2024', date: '1 Nov 2024', type: 'Kehadiran', size: '2.3 MB' },
              { name: 'Analisis Kinerja Guru Q3 2024', date: '25 Oct 2024', type: 'Kinerja', size: '1.8 MB' },
              { name: 'Statistik Mata Pelajaran Oktober', date: '20 Oct 2024', type: 'Akademik', size: '1.2 MB' },
              { name: 'Laporan Utilisasi Ruang September', date: '15 Oct 2024', type: 'Fasilitas', size: '900 KB' },
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900">{report.name}</p>
                    <p className="text-sm text-gray-500">{report.type} • {report.date} • {report.size}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
