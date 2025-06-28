"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  GraduationCap,
  Users,
  BarChart3,
  Shield,
  Zap,
  BookOpen,
  ArrowRight,
  CheckCircle,
  Star,
  Trophy,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Manajemen Guru",
    description:
      "Kelola data guru dengan sistem yang terintegrasi dan mudah digunakan.",
    color: "from-primary-500 to-primary-600",
  },
  {
    icon: BookOpen,
    title: "Mata Pelajaran",
    description:
      "Atur dan monitor mata pelajaran serta kurikulum dengan efisien.",
    color: "from-secondary-500 to-secondary-600",
  },
  {
    icon: BarChart3,
    title: "Laporan & Analitik",
    description: "Dapatkan insight mendalam dengan laporan yang komprehensif.",
    color: "from-accent-500 to-accent-600",
  },
  {
    icon: Shield,
    title: "Keamanan Data",
    description:
      "Data guru dan sekolah tersimpan aman dengan enkripsi tingkat tinggi.",
    color: "from-error-500 to-error-600",
  },
];

const stats = [
  { label: "Sekolah Terdaftar", value: "150+", icon: GraduationCap },
  { label: "Guru Terkelola", value: "5,000+", icon: Users },
  { label: "Tingkat Kepuasan", value: "98%", icon: Star },
  { label: "Penghargaan", value: "25+", icon: Trophy },
];

export default function HomePage() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-lg">
                  <GraduationCap className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">EduAdmin</h1>
                  <p className="text-xs text-gray-500">
                    Sistem Manajemen Sekolah
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    Masuk
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button className="cursor-pointer bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg text-black hover:text-white">
                    Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-8">
                <Zap className="h-4 w-4 mr-2" />
                Platform Terdepan untuk Manajemen Sekolah
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Kelola Sekolah dengan
                <span className="block bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  Lebih Efisien
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                EduAdmin adalah solusi komprehensif untuk manajemen guru, mata
                pelajaran, dan administrasi sekolah. Dirancang khusus untuk
                meningkatkan efisiensi dan produktivitas pendidikan di
                Indonesia.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-black hover:text-white px-8 py-3 text-lg shadow-xl shadow-primary-500/25 cursor-pointer"
                  >
                    Mulai Sekarang
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-3 text-lg border-2 hover:bg-gray-50 cursor-pointer"
                >
                  Pelajari Lebih Lanjut
                </Button>
              </div>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
            <div className="absolute top-20 left-20 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
            <div className="absolute top-40 right-20 w-72 h-72 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl mb-4">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Fitur Unggulan
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Dilengkapi dengan fitur-fitur modern yang dirancang khusus untuk
                kebutuhan manajemen sekolah
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group p-8 bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 border border-gray-100 hover:border-gray-200"
                >
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Siap Meningkatkan Efisiensi Sekolah Anda?
            </h2>
            <p className="text-xl text-primary-100 mb-10 leading-relaxed">
              Bergabunglah dengan ribuan sekolah lainnya yang telah merasakan
              manfaat EduAdmin
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="secondary"
                  className="px-8 py-3 text-lg bg-white text-primary-600 hover:bg-gray-50 shadow-xl cursor-pointer"
                >
                  Mulai Gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="ghost"
                className="px-8 py-3 text-lg text-black border-2 border-black/20 hover:bg-black/10 cursor-pointer"
              >
                Hubungi Tim Sales
              </Button>
            </div>

            <div className="flex items-center justify-center mt-8 space-x-6 text-primary-100">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>Setup dalam 5 menit</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>Support 24/7</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>Tanpa biaya tersembunyi</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <div className="p-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">EduAdmin</h3>
                  <p className="text-sm text-gray-400">
                    Sistem Manajemen Sekolah
                  </p>
                </div>
              </div>

              <div className="text-gray-400 text-sm">
                © 2024 EduAdmin. Semua hak dilindungi.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
