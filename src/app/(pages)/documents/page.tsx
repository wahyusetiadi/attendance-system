'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Trash2, 
  Search,
  Filter,
  FolderOpen,
  File,
  Image,
  FileSpreadsheet
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'xlsx' | 'image' | 'other';
  category: string;
  size: string;
  uploadDate: string;
  uploadedBy: string;
  description?: string;
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Silabus Matematika 2024.pdf',
    type: 'pdf',
    category: 'Kurikulum',
    size: '2.3 MB',
    uploadDate: '2024-11-01',
    uploadedBy: 'Dr. Ahmad Wijaya',
    description: 'Silabus mata pelajaran matematika untuk tahun ajaran 2024'
  },
  {
    id: '2',
    name: 'Data Guru November 2024.xlsx',
    type: 'xlsx',
    category: 'Data Guru',
    size: '1.8 MB',
    uploadDate: '2024-11-15',
    uploadedBy: 'Admin Sekolah'
  },
  {
    id: '3',
    name: 'Surat Keputusan Kepala Sekolah.pdf',
    type: 'pdf',
    category: 'Surat Keputusan',
    size: '856 KB',
    uploadDate: '2024-10-20',
    uploadedBy: 'Kepala Sekolah'
  },
  {
    id: '4',
    name: 'Foto Kegiatan Sekolah.jpg',
    type: 'image',
    category: 'Dokumentasi',
    size: '3.2 MB',
    uploadDate: '2024-11-10',
    uploadedBy: 'Humas Sekolah'
  },
  {
    id: '5',
    name: 'Rencana Pembelajaran Fisika.doc',
    type: 'doc',
    category: 'RPP',
    size: '1.1 MB',
    uploadDate: '2024-11-05',
    uploadedBy: 'Budi Santoso, M.Pd'
  }
];

const categories = ['Semua Kategori', 'Kurikulum', 'Data Guru', 'Surat Keputusan', 'Dokumentasi', 'RPP', 'Laporan'];

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return <FileText className="h-8 w-8 text-red-500" />;
    case 'doc':
      return <FileText className="h-8 w-8 text-blue-500" />;
    case 'xlsx':
      return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
    case 'image':
      return <Image className="h-8 w-8 text-purple-500" />;
    default:
      return <File className="h-8 w-8 text-gray-500" />;
  }
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua Kategori' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) {
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Dokumen</h1>
          <p className="text-gray-600 mt-2">Kelola dan atur dokumen sekolah dengan mudah</p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Dokumen
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Cari dokumen, nama file, atau pengunggah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Dokumen</p>
              <p className="text-2xl font-bold text-blue-600">{documents.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Ukuran</p>
              <p className="text-2xl font-bold text-green-600">125 MB</p>
            </div>
            <FolderOpen className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upload Bulan Ini</p>
              <p className="text-2xl font-bold text-purple-600">23</p>
            </div>
            <Upload className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Kategori</p>
              <p className="text-2xl font-bold text-orange-600">{categories.length - 1}</p>
            </div>
            <Filter className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Documents List/Grid */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dokumen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ukuran
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diunggah Oleh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getFileIcon(doc.type)}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                          {doc.description && (
                            <div className="text-sm text-gray-500">{doc.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doc.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doc.uploadedBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.uploadDate).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                {getFileIcon(doc.type)}
                <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)}>
                  <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                </Button>
              </div>

              <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{doc.name}</h3>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Kategori:</span>
                  <span className="font-medium">{doc.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ukuran:</span>
                  <span className="font-medium">{doc.size}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Diunggah:</span>
                  <span className="font-medium">{new Date(doc.uploadDate).toLocaleDateString('id-ID')}</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-4">Oleh: {doc.uploadedBy}</p>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Lihat
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredDocuments.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada dokumen ditemukan</h3>
          <p className="text-gray-500">Coba ubah kata kunci pencarian atau filter kategori</p>
        </div>
      )}
    </div>
  );
}
