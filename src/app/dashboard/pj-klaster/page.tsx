'use client';

import { useEffect, useState } from 'react';
import { supabase } from "../../../utils/supabase";

export default function PjKlasterDashboard() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'pilih-jadwal' | 'ganti-password'>('pilih-jadwal');
  
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [narasumberName, setNarasumberName] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUserAndSchedules();
  }, []);

  const fetchUserAndSchedules = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setUserProfile(profile);

      if (profile) {
        const { data: scheduleData } = await supabase.from('schedules').select('*').eq('klaster_id', profile.klaster_id).order('date_time', { ascending: true });
        if (scheduleData) setSchedules(scheduleData);
      }
    }
  };

  const handleAssignNarasumber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheduleId) return;

    const { error } = await supabase.from('schedules').update({ narasumber_name: narasumberName, status: 'assigned' }).eq('id', selectedScheduleId);

    if (error) {
      alert('Gagal menyimpan: ' + error.message);
    } else {
      alert('Narasumber berhasil ditunjuk!');
      setNarasumberName('');
      setSelectedScheduleId(null);
      fetchUserAndSchedules();
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) alert('Gagal ganti password: ' + error.message);
    else {
      alert('Password berhasil diperbarui!');
      setNewPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <div className="w-64 bg-slate-900 border-r border-slate-800 p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-indigo-400">Onboard DUWIT</h1>
          <p className="text-xs text-slate-400">{userProfile?.full_name || 'PJ Klaster Panel'}</p>
        </div>
        <nav className="space-y-2">
          <button onClick={() => setActiveTab('pilih-jadwal')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'pilih-jadwal' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Jadwal Klaster Saya</button>
          <button onClick={() => setActiveTab('ganti-password')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'ganti-password' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Ubah Password</button>
        </nav>
      </div>

      <div className="flex-1 p-8">
        {activeTab === 'pilih-jadwal' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Manajemen Jadwal Klaster {userProfile?.klaster_id}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                {schedules.map((s) => (
                  <div key={s.id} onClick={() => setSelectedScheduleId(s.id)} className={`bg-slate-900 border rounded-xl p-5 cursor-pointer transition ${selectedScheduleId === s.id ? 'border-indigo-500 bg-slate-900/80' : 'border-slate-800'}`}>
                    <h3 className="font-semibold text-lg">{s.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">Waktu: {new Date(s.date_time).toLocaleString('id-ID')}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Narasumber: <strong className="text-indigo-300">{s.narasumber_name || 'Belum diisi'}</strong></span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
                <h3 className="font-semibold text-lg mb-4 text-indigo-400">Tunjuk Narasumber</h3>
                {selectedScheduleId ? (
                  <form onSubmit={handleAssignNarasumber} className="space-y-4">
                    <input type="text" value={narasumberName} onChange={(e) => setNarasumberName(e.target.value)} className="w-full rounded-lg bg-slate-950 border border-slate-800 p-3 text-sm text-white" placeholder="Nama narasumber" required />
                    <button type="submit" className="w-full bg-indigo-600 p-2.5 font-semibold text-sm rounded-lg text-white">Simpan</button>
                  </form>
                ) : <p className="text-sm text-slate-500 text-center">Pilih jadwal di kiri.</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ganti-password' && (
          <div className="max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">Ubah Password Akun</h2>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-lg bg-slate-950 border border-slate-800 p-3 text-white" placeholder="Minimal 6 Karakter" minLength={6} required />
              <button type="submit" className="w-full rounded-lg bg-indigo-600 p-3 font-semibold text-sm text-white">Simpan Password</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
