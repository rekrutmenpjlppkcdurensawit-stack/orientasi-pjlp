'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Calendar, Plus, UserPlus, CheckCircle, ShieldAlert } from 'lucide-react';

export default function AdminDashboard() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [pjProfiles, setPjProfiles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'monitoring' | 'add-schedule' | 'manage-pj'>('monitoring');
  const [loadingPj, setLoadingPj] = useState(false);
  
  // State Form Jadwal
  const [title, setTitle] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [klasterId, setKlasterId] = useState('1');

  useEffect(() => {
    fetchSchedules();
    fetchPjProfiles();
  }, []);

  const fetchSchedules = async () => {
    const { data } = await supabase.from('schedules').select('*').order('date_time', { ascending: true });
    if (data) setSchedules(data);
  };

  const fetchPjProfiles = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'pj_klaster')
      .order('klaster_id', { ascending: true });
    if (data) setPjProfiles(data);
  };

  // KETOK PALU: Fungsi Otomatis Generate 5 Akun PJ Klaster
  const handleGenerate5PJ = async () => {
    if (!confirm('Apakah Anda yakin ingin membuat otomatis 5 Akun PJ Klaster?')) return;
    setLoadingPj(true);

    // Loop untuk membuat Klaster 1 sampai 5
    for (let i = 1; i <= 5; i++) {
      const email = `pj.klaster${i}.pkcdurensawit@gmail.com`;
      const password = `Klaster${i}#2026`; // Password default kuat & berpola
      const fullName = `Penanggung Jawab Klaster ${i}`;

      // Daftarkan ke Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'pj_klaster',
            klaster_id: i,
          },
        },
      });

      if (authError) {
        console.error(`Gagal membuat PJ Klaster ${i}:`, authError.message);
      }
    }

    alert('Proses pembuatan 5 Akun PJ Klaster Selesai!');
    fetchPjProfiles();
    setLoadingPj(false);
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('schedules').insert([
      { title, date_time: new Date(dateTime).toISOString(), klaster_id: parseInt(klasterId), status: 'available' }
    ]);
    if (error) alert(error.message);
    else {
      alert('Jadwal master berhasil dibuat!');
      setTitle(''); setDateTime(''); fetchSchedules(); setActiveTab('monitoring');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 p-6 space-y-6">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-indigo-400">Onboard DUWIT</h1>
          <p className="text-xs text-slate-400">Super Admin Panel</p>
        </div>
        
        <nav className="space-y-2">
          <button onClick={() => setActiveTab('monitoring')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'monitoring' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Calendar className="w-5 h-5" /> <span>Monitoring Jadwal</span>
          </button>
          <button onClick={() => setActiveTab('add-schedule')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'add-schedule' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Plus className="w-5 h-5" /> <span>Buat Jadwal Baru</span>
          </button>
          <button onClick={() => setActiveTab('manage-pj')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'manage-pj' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <UserPlus className="w-5 h-5" /> <span>Kelola 5 PJ Klaster</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'monitoring' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Monitoring Seluruh Jadwal</h2>
            <div className="grid gap-4">
              {schedules.map((s) => (
                <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{s.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">Waktu: {new Date(s.date_time).toLocaleString('id-ID')}</p>
                    <span className="inline-block text-xs bg-slate-800 px-2.5 py-1 rounded-full text-indigo-300 mt-2">Klaster {s.klaster_id}</span>
                  </div>
                  <div>
                    {s.status === 'assigned' ? (
                      <span className="flex items-center space-x-1.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full"><CheckCircle className="w-4 h-4" /> <span>Selesai</span></span>
                    ) : <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-full">Menunggu</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'add-schedule' && (
          <div className="max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">Buat Jadwal Narasumber Master</h2>
            <form onSubmit={handleCreateSchedule} className="space-y-5">
              {/* Form Input Sesuai Kode Sebelumnya */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Nama Sesi Materi</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg bg-slate-950 border border-slate-800 p-3" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Waktu</label>
                  <input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} className="w-full rounded-lg bg-slate-950 border border-slate-800 p-3" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Klaster</label>
                  <select value={klasterId} onChange={(e) => setKlasterId(e.target.value)} className="w-full rounded-lg bg-slate-950 border border-slate-800 p-3">
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>Klaster {n}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full rounded-lg bg-indigo-600 p-3 font-semibold mt-4">Simpan Jadwal</button>
            </form>
          </div>
        )}

        {/* TAB INTERAKTIF: KELOLA & GENERATE AKUN PJ KLASTER */}
        {activeTab === 'manage-pj' && (
          <div className="max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Manajemen Akun PJ Klaster</h2>
                <p className="text-sm text-slate-400 mt-1">Gunakan fitur ini untuk membuat 5 akun penanggung jawab secara instan.</p>
              </div>
              {pjProfiles.length < 5 && (
                <button
                  onClick={handleGenerate5PJ}
                  disabled={loadingPj}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-lg text-sm flex items-center space-x-2 transition disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{loadingPj ? 'Memproses Akun...' : 'Generate 5 Akun PJ'}</span>
                </button>
              )}
            </div>

            {/* Tabel List PJ Klaster */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs border-b border-slate-800">
                  <tr>
                    <th className="p-4">Klaster</th>
                    <th className="p-4">Nama Lengkap</th>
                    <th className="p-4">Email Login</th>
                    <th className="p-4">Password Default</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {[1, 2, 3, 4, 5].map((num) => {
                    const profileData = pjProfiles.find((p) => p.klaster_id === num);
                    return (
                      <tr key={num} className="hover:bg-slate-850/50">
                        <td className="p-4 font-semibold text-indigo-400">Klaster {num}</td>
                        <td className="p-4">{profileData ? profileData.full_name : <span className="text-amber-500 flex items-center gap-1"><ShieldAlert className="w-4 h-4"/> Belum Dibuat</span>}</td>
                        <td className="p-4 text-slate-400">{profileData ? profileData.email : `pj.klaster${num}.pkcdurensawit@gmail.com`}</td>
                        <td className="p-4 font-mono text-xs text-slate-500">{profileData ? '******* (Sudah Aktif)' : `Klaster${num}#2026`}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
