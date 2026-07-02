'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Calendar, UserCheck, Key, CheckCircle } from 'lucide-react';

export default function PjKlasterDashboard() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'pilih-jadwal' | 'ganti-password'>('pilih-jadwal');
  
  // State Input Narasumber & Password
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [narasumberName, setNarasumberName] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUserAndSchedules();
  }, []);

  const fetchUserAndSchedules = async () => {
    // 1. Ambil data user login saat ini
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setUserProfile(profile);

      // 2. Ambil jadwal khusus untuk nomor klaster PJ yang bersangkutan
      if (profile) {
        const { data: scheduleData } = await supabase
          .from('schedules')
          .select('*')
          .eq('klaster_id', profile.klaster_id)
          .order('date_time', { ascending: true });
        if (scheduleData) setSchedules(scheduleData);
      }
    }
  };

  // KETOK PALU: Fungsi PJ Klaster Menunjuk Narasumber
  const handleAssignNarasumber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheduleId) return;

    const { error } = await supabase
      .from('schedules')
      .update({
        narasumber_name: narasumberName,
        status: 'assigned' // Mengubah status menjadi terisi narasumber
      })
      .eq('id', selectedScheduleId);

    if (error) {
      alert('Gagal menyimpan narasumber: ' + error.message);
    } else {
      alert('Narasumber berhasil ditunjuk!');
      setNarasumberName('');
      setSelectedScheduleId(null);
      fetchUserAndSchedules(); // Refresh data
    }
  };

  // KETOK PALU: Fitur Ganti Password Mandiri untuk PJ
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) alert('Gagal ganti password: ' + error.message);
    else {
      alert('Password Anda berhasil diperbarui!');
      setNewPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-indigo-400">Onboard DUWIT</h1>
          <p className="text-xs text-slate-400">{userProfile?.full_name || 'PJ Klaster Panel'}</p>
        </div>
        
        <nav className="space-y-2">
          <button onClick={() => setActiveTab('pilih-jadwal')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'pilih-jadwal' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Calendar className="w-5 h-5" /> <span>Jadwal Klaster Saya</span>
          </button>
          <button onClick={() => setActiveTab('ganti-password')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'ganti-password' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Key className="w-5 h-5" /> <span>Ubah Password</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'pilih-jadwal' && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Manajemen Jadwal Klaster {userProfile?.klaster_id}</h2>
            <p className="text-sm text-slate-400 mb-6">Pilih jadwal dari admin dan tentukan nama narasumbernya.</p>

            <div className="grid md:grid-cols-3 gap-6">
              {/* List Jadwal */}
              <div className="md:col-span-2 space-y-4">
                {schedules.map((s) => (
                  <div 
                    key={s.id} 
                    onClick={() => setSelectedScheduleId(s.id)}
                    className={`bg-slate-900 border rounded-xl p-5 cursor-pointer transition ${selectedScheduleId === s.id ? 'border-indigo-500 bg-slate-900/80 shadow-lg' : 'border-slate-800 hover:border-slate-700'}`}
                  >
                    <h3 className="font-semibold text-lg text-white">{s.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">Waktu: {new Date(s.date_time).toLocaleString('id-ID')}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Narasumber: <strong className="text-indigo-300">{s.narasumber_name || 'Belum diisi'}</strong></span>
                      {s.status === 'assigned' && (
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5"/> Siap</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Form Input Narasumber Side-Panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit sticky top-8">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-indigo-400"><UserCheck className="w-5 h-5"/> Tunjuk Narasumber</h3>
                {selectedScheduleId ? (
                  <form onSubmit={handleAssignNarasumber} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Nama Narasumber</label>
                      <input 
                        type="text" 
                        value={narasumberName} 
                        onChange={(e) => setNarasumberName(e.target.value)} 
                        className="w-full rounded-lg bg-slate-950 border border-slate-800 p-3 text-sm text-white" 
                        placeholder="Ketik nama narasumber sesi ini" 
                        required 
                      />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 p-2.5 font-semibold text-sm rounded-lg text-white transition">
                      Simpan Narasumber
                    </button>
                  </form>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">Silakan klik salah satu kartu jadwal di sebelah kiri terlebih dahulu.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ganti-password' && (
          <div className="max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-2">Ubah Password Akun</h2>
            <p className="text-sm text-slate-400 mb-6">Demi keamanan, ganti password default Anda secara berkala.</p>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-300">Password Baru</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-lg bg-slate-950 border border-slate-800 p-3" placeholder="Minimal 6 Karakter" minLength={6} required />
              </div>
              <button type="submit" className="w-full rounded-lg bg-indigo-600 p-3 font-semibold text-sm">Simpan Password Baru</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
