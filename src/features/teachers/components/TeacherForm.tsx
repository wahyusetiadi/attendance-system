'use client';

import { useState, useEffect } from 'react';
import { Teacher } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X } from 'lucide-react';

interface TeacherFormProps {
  teacher?: Teacher;
  onSave: (teacher: Teacher) => void;
  onCancel: () => void;
}

export function TeacherForm({ teacher, onSave, onCancel }: TeacherFormProps) {
  const [formData, setFormData] = useState<Partial<Teacher>>({
    nip: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    subject: '',
    grade: '',
    status: 'active',
    joinDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (teacher) {
      setFormData(teacher);
    }
  }, [teacher]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Teacher);
  };

  const handleChange = (field: keyof Teacher, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-black">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {teacher ? 'Edit Guru' : 'Tambah Guru Baru'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="NIP"
              value={formData.nip || ''}
              onChange={(e) => handleChange('nip', e.target.value)}
              required
            />
            <Input
              label="Nama Lengkap"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
            <Input
              label="Nomor Telepon"
              value={formData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              required
            />
          </div>

          <Input
            label="Alamat"
            value={formData.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Mata Pelajaran
              </label>
              <select
                value={formData.subject || ''}
                onChange={(e) => handleChange('subject', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Pilih Mata Pelajaran</option>
                <option value="Matematika">Matematika</option>
                <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                <option value="Bahasa Inggris">Bahasa Inggris</option>
                <option value="Fisika">Fisika</option>
                <option value="Kimia">Kimia</option>
                <option value="Biologi">Biologi</option>
                <option value="Sejarah">Sejarah</option>
                <option value="Geografi">Geografi</option>
                <option value="Ekonomi">Ekonomi</option>
                <option value="Sosiologi">Sosiologi</option>
                <option value="Seni Budaya">Seni Budaya</option>
                <option value="Pendidikan Jasmani">Pendidikan Jasmani</option>
              </select>
            </div>

            <Input
              label="Kelas yang Diajar"
              placeholder="Contoh: X, XI, XII"
              value={formData.grade || ''}
              onChange={(e) => handleChange('grade', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tanggal Bergabung"
              type="date"
              value={formData.joinDate || ''}
              onChange={(e) => handleChange('joinDate', e.target.value)}
              required
            />
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Status
              </label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => handleChange('status', e.target.value as 'active' | 'inactive')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button variant="outline" onClick={onCancel}>
              Batal
            </Button>
            <Button type="submit">
              {teacher ? 'Update Guru' : 'Tambah Guru'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
