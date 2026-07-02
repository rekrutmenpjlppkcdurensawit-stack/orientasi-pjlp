'use client';

import { useEffect, useState } from 'react';
import { supabase } from "../../../utils/supabase";

export default function AdminDashboard() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [pjProfiles, setPjProfiles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'monitoring' | 'add-schedule' | 'manage-pj'>('monitoring');
  const [loadingPj, setLoadingPj] = useState(false);
  
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
    const { data } = await supabase.from('profiles').select('*').eq('role', 'pj_klaster').order('klaster_id', { ascending: true });
    if (data) setPjProfiles(data);
  };

  const handleGenerate5PJ = async () => {
    if (!confirm('Apakah Anda yakin ingin membuat otomatis 5 Akun PJ Klaster?')) return;
    setLoadingPj(true);

    for (let i = 1; i <= 5; i++) {
      const email = `pj.klaster${i}.pkcdurensawit@gmail.com`;
      const password = `Klaster${i}#2026`;
      const fullName = `Penanggung Jawab Klaster ${i}`;

      await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role: 'pj_klaster', klaster_id: i } },
      });
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
          <button onClick={() => setActiveTab('monitoring')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'monitoring' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Monitoring Jadwal</button>
          <button onClick={() => setActiveTab('add-schedule')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'add-schedule' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Buat Jadwal Baru</button>
          <button onClick={() => setActiveTab('manage-pj')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'manage-pj' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Kelola 5 PJ Klaster</button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {activeTab === 'monitoring' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Monitoring Seluruh Jadwal</h2>
            <div className="grid gap-4">
              {schedules.map((s) => (
                <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{s.title}</h3>
                    <p className="text-sm text-slate-400 font-mono">Waktu: {new Date(s.date_time).toLocaleString('id-ID')}</p>
                    <span className="inline-block text-xs bg-slate-800 px-2.5 py-1 rounded-full text-indigo-300 mt-2">Klaster {s.klaster_id}</span>
                  </div>
                  <div>
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${s.status === 'assigned' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {s.status === 'assigned' ? 'Selesai' : 'Menunggu'}
                    </span>
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
              <div>
                <label className="block text-sm font-medium mb-1.5">Nama Sesi Materi</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg bg-slate-950 border border-slate-800 p-3 text-white" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Waktu</label>
                  <input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} className="w-full rounded-lg bg-slate-950 border border-slate-800 p-3 text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Klaster</label>
                  <select value={klasterId} onChange={(e) => setKlasterId(e.target.value)} className="w-full rounded-lg bg-slate-950 border border-slate-800 p-3 text-white">
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>Klaster {n}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full rounded-lg bg-indigo-600 p-3 font-semibold mt-4 text-white">Simpan Jadwal</button>
            </form>
          </div>
        )}

        {activeTab === 'manage-pj' && (
          <div className="max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Manajemen Akun PJ Klaster</h2>
              </div>
              {pjProfiles.length < 5 && (
                <button onClick={handleGenerate5PJ} disabled={loadingPj} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-lg text-sm disabled:opacity-50">
                  {loadingPj ? 'Memproses...' : 'Generate 5 Akun PJ'}
                </button>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs border-b border-slate-800">
                  <tr>
                    <th className="p-4">Klaster</th>
                    <th className="p-4">Nama Lengkap</th>
                    <th className="p-4">Email Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {[1, 2, 3, 4, 5].map((num) => {
                    const profileData = pjProfiles.find((p) => p.klaster_id === num);
                    return (
                      <tr key={num} className="hover:bg-slate-850/50">
                        <td className="p-4 font-semibold text-indigo-400">Klaster {num}</td>
                        <td className="p-4">{profileData ? profileData.full_name : 'Belum Dibuat'}</td>
                        <td className="p-4 text-slate-400">{profileData ? profileData.email : `pj.klaster${num}.pkcdurensawit@gmail.com`}</td>
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
