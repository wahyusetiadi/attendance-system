'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Edit2, Trash2, BookOpen, Users, Clock } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  credits: number;
  teacherCount: number;
  grade: string[];
  status: 'active' | 'inactive';
}

const mockSubjects: Subject[] = [
  {
    id: '1',
    name: 'Matematika',
    code: 'MTK',
    description: 'Mata pelajaran matematika untuk tingkat SMA',
    credits: 4,
    teacherCount: 3,
    grade: ['X', 'XI', 'XII'],
    status: 'active'
  },
  {
    id: '2',
    name: 'Bahasa Indonesia',
    code: 'BIN',
    description: 'Mata pelajaran bahasa dan sastra Indonesia',
    credits: 4,
    teacherCount: 2,
    grade: ['X', 'XI', 'XII'],
    status: 'active'
  },
  {
    id: '3',
    name: 'Fisika',
    code: 'FIS',
    description: 'Mata pelajaran fisika untuk jurusan IPA',
    credits: 3,
    teacherCount: 2,
    grade: ['XI', 'XII'],
    status: 'active'
  },
  {
    id: '4',
    name: 'Kimia',
    code: 'KIM',
    description: 'Mata pelajaran kimia untuk jurusan IPA',
    credits: 3,
    teacherCount: 1,
    grade: ['XI', 'XII'],
    status: 'inactive'
  }
];

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mata Pelajaran</h1>
          <p className="text-gray-600 mt-2">Kelola kurikulum dan mata pelajaran sekolah</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Mata Pelajaran
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md">
          <Input
            type="search"
            placeholder="Cari mata pelajaran..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          Filter
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Mata Pelajaran</p>
              <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mata Pelajaran Aktif</p>
              <p className="text-2xl font-bold text-green-600">
                {subjects.filter(s => s.status === 'active').length}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total SKS</p>
              <p className="text-2xl font-bold text-purple-600">
                {subjects.reduce((total, subject) => total + subject.credits, 0)}
              </p>
            </div>
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Guru</p>
              <p className="text-2xl font-bold text-orange-600">
                {subjects.reduce((total, subject) => total + subject.teacherCount, 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((subject) => (
          <div key={subject.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                  <p className="text-sm text-gray-500">Kode: {subject.code}</p>
                </div>
              </div>
              <span className={`
                px-2 py-1 text-xs font-medium rounded-full
                ${subject.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
                }
              `}>
                {subject.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-4">{subject.description}</p>

            <div className="space-y-2 mb-4 text-black">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">SKS:</span>
                <span className="font-medium">{subject.credits}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Guru:</span>
                <span className="font-medium">{subject.teacherCount} orang</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Kelas:</span>
                <span className="font-medium">{subject.grade.join(', ')}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="ghost" size="sm">
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
