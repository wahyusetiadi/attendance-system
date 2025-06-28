'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Calendar, Clock, Users, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface ScheduleItem {
  id: string;
  subject: string;
  teacher: string;
  class: string;
  time: string;
  room: string;
  day: string;
}

const mockSchedule: ScheduleItem[] = [
  {
    id: '1',
    subject: 'Matematika',
    teacher: 'Dr. Ahmad Wijaya',
    class: 'X-1',
    time: '07:00 - 08:30',
    room: 'R.101',
    day: 'Senin'
  },
  {
    id: '2',
    subject: 'Bahasa Indonesia',
    teacher: 'Siti Nurhaliza, S.Pd',
    class: 'X-1',
    time: '08:30 - 10:00',
    room: 'R.102',
    day: 'Senin'
  },
  {
    id: '3',
    subject: 'Fisika',
    teacher: 'Budi Santoso, M.Pd',
    class: 'XI-IPA-1',
    time: '10:15 - 11:45',
    room: 'Lab Fisika',
    day: 'Senin'
  },
  {
    id: '4',
    subject: 'Kimia',
    teacher: 'Maya Sari, S.Pd',
    class: 'XI-IPA-2',
    time: '13:00 - 14:30',
    room: 'Lab Kimia',
    day: 'Senin'
  }
];

const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const timeSlots = [
  '07:00 - 08:30',
  '08:30 - 10:00',
  '10:15 - 11:45',
  '13:00 - 14:30',
  '14:30 - 16:00'
];

export default function SchedulePage() {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState('Semua Kelas');
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');

  const classes = ['Semua Kelas', 'X-1', 'X-2', 'XI-IPA-1', 'XI-IPA-2', 'XI-IPS-1', 'XII-IPA-1', 'XII-IPA-2'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jadwal Pelajaran</h1>
          <p className="text-gray-600 mt-2">Kelola jadwal pelajaran dan waktu mengajar</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Jadwal
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Minggu, {selectedWeek.toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </span>
            <Button variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {classes.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            Tabel
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Kalender
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Jadwal Hari Ini</p>
              <p className="text-2xl font-bold text-blue-600">24</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Jam Mengajar Aktif</p>
              <p className="text-2xl font-bold text-green-600">8</p>
            </div>
            <Clock className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Guru Mengajar</p>
              <p className="text-2xl font-bold text-purple-600">15</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Waktu
                  </th>
                  {days.map(day => (
                    <th key={day} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeSlots.map(timeSlot => (
                  <tr key={timeSlot} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                      {timeSlot}
                    </td>
                    {days.map(day => {
                      const scheduleForSlot = mockSchedule.find(
                        s => s.time === timeSlot && s.day === day
                      );
                      return (
                        <td key={`${day}-${timeSlot}`} className="px-6 py-4 text-sm">
                          {scheduleForSlot ? (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 hover:bg-blue-100 transition-colors cursor-pointer">
                              <div className="font-medium text-blue-900">{scheduleForSlot.subject}</div>
                              <div className="text-blue-700 text-xs">{scheduleForSlot.teacher}</div>
                              <div className="text-blue-600 text-xs">{scheduleForSlot.class} • {scheduleForSlot.room}</div>
                            </div>
                          ) : (
                            <div className="h-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center hover:border-gray-300 cursor-pointer">
                              <Plus className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-7 gap-4">
            {days.map(day => (
              <div key={day} className="text-center">
                <h3 className="font-semibold text-gray-900 mb-4">{day}</h3>
                <div className="space-y-2">
                  {mockSchedule
                    .filter(schedule => schedule.day === day)
                    .map(schedule => (
                      <div key={schedule.id} className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm">
                        <div className="font-medium text-blue-900">{schedule.subject}</div>
                        <div className="text-blue-700 text-xs">{schedule.time}</div>
                        <div className="text-blue-600 text-xs">{schedule.class}</div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
