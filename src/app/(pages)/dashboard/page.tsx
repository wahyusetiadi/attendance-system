import { 
  Users, 
  BookOpen,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  BarChart3,
  UserCheck,
  ClockArrowUp,
  ClockAlert,
  ClockArrowDown
} from 'lucide-react';
import { MonthlyChart } from '@/components/charts/MonthlyChart';
import { AttendancePieChart } from '@/components/charts/AttendancePieChart';

const stats = [
  {
    title: 'Total Guru',
    value: '45',
    icon: Users,
    color: 'bg-blue-500',
    // change: '+2 bulan ini',
    changeType: 'positive'
  },
  {
    title: 'Kehadiran Hari Ini',
    value: '40',
    icon: ClockArrowUp,
    color: 'bg-green-500',
    // change: '+5 dari minggu lalu',
    changeType: 'positive'
  },
  {
    title: 'Guru Terlambat Hari Ini',
    value: '2',
    icon: ClockAlert,
    color: 'bg-orange-500',
    // change: 'Stabil',
    changeType: 'neutral'
  },
  {
    title: 'Tidak Hadir Hari Ini',
    value: '3',
    icon: ClockArrowDown,
    color: 'bg-red-500',
    // change: '+2% dari kemarin',
    changeType: 'positive'
  },
];

const recentActivities = [
  {
    id: 1,
    type: 'add',
    message: 'Guru baru ditambahkan: Budi Santoso',
    time: '2 jam yang lalu',
    icon: CheckCircle,
    color: 'text-green-500'
  },
  {
    id: 2,
    type: 'update',
    message: 'Data guru diperbarui: Siti Rahayu',
    time: '5 jam yang lalu',
    icon: AlertCircle,
    color: 'text-blue-500'
  },
  {
    id: 3,
    type: 'add',
    message: 'Mata pelajaran baru: Fisika Lanjutan',
    time: '1 hari yang lalu',
    icon: CheckCircle,
    color: 'text-green-500'
  },
  {
    id: 4,
    type: 'attendance',
    message: 'Kehadiran guru hari ini: 94%',
    time: '2 hari yang lalu',
    icon: AlertCircle,
    color: 'text-orange-500'
  },
];

const monthlyHighlights = [
  {
    title: 'Kehadiran Tertinggi',
    value: '96%',
    month: 'September',
    color: 'text-green-600'
  },
  {
    title: 'Guru Baru',
    value: '3 orang',
    month: 'November',
    color: 'text-blue-600'
  },
  {
    title: 'Mata Pelajaran Baru',
    value: '1 mata pelajaran',
    month: 'Agustus',
    color: 'text-purple-600'
  }
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Selamat datang kembali! Berikut adalah ringkasan sistem hari ini.
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {new Date().toLocaleTimeString('id-ID', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                {/* <div className="flex items-center">
                  <span className={`text-xs font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' :
                    stat.changeType === 'negative' ? 'text-red-600' :
                    'text-gray-500'
                  }`}>
                    {stat.change}
                  </span>
                </div> */}
              </div>
              <div className={`p-3 rounded-xl ${stat.color} shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Statistics */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Statistik Bulanan 2024
            </h2>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-sm text-green-600 font-medium">
                Trend positif
              </span>
            </div>
          </div>

          <MonthlyChart />
        </div>

        {/* Weekly Attendance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <AttendancePieChart />

          {/* Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Ringkasan Minggu Ini</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Rata-rata kehadiran:</span>
                <span className="font-medium text-green-600">93.5%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total keterlambatan:</span>
                <span className="font-medium text-yellow-600">13 kali</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tidak hadir:</span>
                <span className="font-medium text-red-600">8 kali</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Highlights & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Highlights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Sorotan Bulanan
            </h2>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {monthlyHighlights.map((highlight, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{highlight.title}</p>
                  <p className="text-sm text-gray-500">Bulan {highlight.month}</p>
                </div>
                <div className={`text-xl font-bold ${highlight.color}`}>
                  {highlight.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Aktivitas Terbaru
            </h2>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`p-1 rounded-full ${activity.color}`}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-medium">
                    {activity.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
            Lihat semua aktivitas
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hidden">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-blue-900">Tambah Guru</p>
              <p className="text-sm text-blue-600">Daftarkan guru baru</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <BookOpen className="h-8 w-8 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-green-900">Mata Pelajaran</p>
              <p className="text-sm text-green-600">Kelola kurikulum</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <div className="text-left">
              <p className="font-medium text-purple-900">Laporan</p>
              <p className="text-sm text-purple-600">Lihat statistik</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
