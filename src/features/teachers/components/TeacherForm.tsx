'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Loader2 } from 'lucide-react';
import { CreateTeacherRequest, Teacher } from '@/types/teacher';

interface TeacherFormProps {
  teacher?: Teacher;
  onSave: (teacher: CreateTeacherRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TeacherForm({ teacher, onSave, onCancel, isLoading = false }: TeacherFormProps) {
  const [formData, setFormData] = useState<CreateTeacherRequest>({
    nip: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    subject: '',
    rfidUid: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (teacher) {
      setFormData({
        nip: teacher.nip || '',
        name: teacher.name || '',
        email: teacher.email || '',
        phone: teacher.phone || '',
        address: teacher.address || '',
        subject: teacher.subject || '',
        rfidUid: teacher.rfidUid || '',
        isActive: teacher.isActive ?? (teacher.status === 'active'),
      });
    }
  }, [teacher]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama adalah wajib';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email tidak valid';
    }

    if (formData.phone && !/^\d+$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Nomor telepon hanya boleh berisi angka';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSave(formData);
  };

  const handleChange = (field: keyof CreateTeacherRequest, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-black">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {teacher ? 'Edit Guru' : 'Tambah Guru Baru'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={isLoading}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="NIP"
              value={formData.nip || ''}
              onChange={(e) => handleChange('nip', e.target.value)}
              error={errors.nip}
              placeholder="Nomor Induk Pegawai"
              disabled={isLoading}
            />
            <Input
              label="Nama Lengkap *"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              placeholder="contoh@sekolah.edu"
              disabled={isLoading}
            />
            <Input
              label="Nomor Telepon"
              value={formData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              error={errors.phone}
              placeholder="081234567890"
              disabled={isLoading}
            />
          </div>

          <Input
            label="Alamat"
            value={formData.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            error={errors.address}
            placeholder="Alamat lengkap"
            disabled={isLoading}
          />
           <Input
            label="RFID UID"
            value={formData.rfidUid || ''}
            onChange={(e) => handleChange('rfidUid', e.target.value)}
            error={errors.rfidUid}
            placeholder="Masukkan RFID UID (contoh: 1A2B3C4D)"
            disabled={isLoading}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Mata Pelajaran
              </label>
              <select
                value={formData.subject || ''}
                onChange={(e) => handleChange('subject', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.subject ? 'border-red-500' : 'border-gray-300'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading}
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
                <option value="Teknologi Informasi">Teknologi Informasi</option>
                <option value="Agama">Pendidikan Agama</option>
                <option value="PKN">Pendidikan Kewarganegaraan</option>
              </select>
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
              )}
            </div> */}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Status
              </label>
              <select
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => handleChange('isActive', e.target.value === 'active')}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isLoading}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </div>
          </div>

          {/* Form submission info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Informasi
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    • Field yang bertanda (*) adalah wajib diisi<br/>
                    • Email harus unik dan valid<br/>
                    • NIP harus unik jika diisi
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {teacher ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                teacher ? 'Update Guru' : 'Tambah Guru'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
