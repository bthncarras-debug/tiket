/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Phone, 
  Calendar, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  QrCode, 
  Ticket as TicketIcon,
  Download,
  AlertCircle,
  Lock,
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  Table as TableIcon
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// --- Types ---
interface Registration {
  id: string;
  name: string;
  phone: string;
  dob: string;
  totalPeople: number;
  totalPrice: number;
  queueNumber: string;
  createdAt: string;
}

interface FormData {
  name: string;
  phone: string;
  dob: string;
  totalPeople: string;
}

enum Step {
  LOBBY = 'lobby',
  REGISTRATION = 'registration',
  PAYMENT = 'payment',
  SUCCESS = 'success',
  ADMIN_LOGIN = 'admin_login',
  ADMIN_DASHBOARD = 'admin_dashboard'
}

const TICKET_PRICE = 5000;

// --- Components ---

const InputField = ({ 
  label, 
  icon: Icon, 
  name, 
  value, 
  onChange, 
  placeholder, 
  type = 'text',
  error 
}: { 
  label: string; 
  icon: any; 
  name: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  error?: string;
}) => (
  <div className="space-y-1.5">
    <label className="text-[10px] uppercase tracking-[0.15em] text-white/50 font-medium ml-1">
      {label}
    </label>
    <div className="relative group">
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-red-400' : 'text-white/30 group-focus-within:text-white'}`}>
        <Icon size={18} strokeWidth={1.5} />
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-white/5 border ${error ? 'border-red-400/50' : 'border-white/10 focus:border-white/30'} rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all duration-300`}
      />
    </div>
    {error && (
      <p className="text-[10px] text-red-400 flex items-center gap-1 ml-1">
        <AlertCircle size={10} /> {error}
      </p>
    )}
  </div>
);

export default function App() {
  const [step, setStep] = useState<Step>(Step.LOBBY);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    dob: '',
    totalPeople: '1'
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  
  // Persisted data
  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    const saved = localStorage.getItem('gallery_registrations');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentRegistration, setCurrentRegistration] = useState<Registration | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    localStorage.setItem('gallery_registrations', JSON.stringify(registrations));
  }, [registrations]);

  const validate = () => {
    const newErrors: Partial<FormData> = {};
    if (!formData.name.trim()) newErrors.name = 'Nama lengkap wajib diisi';
    if (!formData.phone.trim()) newErrors.phone = 'Nomor telepon wajib diisi';
    else if (!/^[0-9+]{10,14}$/.test(formData.phone)) newErrors.phone = 'Format nomor telepon tidak valid';
    if (!formData.dob) newErrors.dob = 'Tanggal lahir wajib diisi';
    if (!formData.totalPeople || parseInt(formData.totalPeople) < 1) newErrors.totalPeople = 'Minimal 1 orang';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === '12345') {
      setStep(Step.ADMIN_DASHBOARD);
      setAdminPassword('');
      setAdminError('');
    } else {
      setAdminError('Password salah. Gunakan 12345');
    }
  };

  const processRegistration = () => {
    const totalPeople = parseInt(formData.totalPeople);
    const newReg: Registration = {
      id: `GT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      name: formData.name,
      phone: formData.phone,
      dob: formData.dob,
      totalPeople: totalPeople,
      totalPrice: totalPeople * TICKET_PRICE,
      queueNumber: (registrations.length + 1).toString().padStart(3, '0'),
      createdAt: new Date().toISOString()
    };
    
    setCurrentRegistration(newReg);
    setStep(Step.PAYMENT);
  };

  const finalizePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      if (currentRegistration) {
        setRegistrations(prev => [currentRegistration, ...prev]);
      }
      setIsProcessing(false);
      setStep(Step.SUCCESS);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
      </div>

      <main className={`relative z-10 mx-auto px-6 py-12 md:py-16 min-h-screen flex flex-col ${step === Step.ADMIN_DASHBOARD ? 'max-w-6xl' : 'max-w-lg'}`}>
        
        {/* Navigation & Header */}
        <header className="mb-10 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-white/20" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-semibold">
                Grand Gallery System
              </span>
            </div>
            {step === Step.ADMIN_DASHBOARD && (
              <button 
                onClick={() => setStep(Step.LOBBY)}
                className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
              >
                <LogOut size={14} /> Exit Admin
              </button>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight leading-[1.1]">
            {step === Step.ADMIN_DASHBOARD ? 'Management' : 'Digital'}<br />
            <span className="italic font-serif">{step === Step.ADMIN_DASHBOARD ? 'Dashboard.' : 'Ticket Hub.'}</span>
          </h1>
        </header>

        <div className="flex-grow">
          <AnimatePresence mode="wait">
            {/* LOBBY: Choice between Buyer or Admin */}
            {step === Step.LOBBY && (
              <motion.div
                key="lobby"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid gap-4 mt-12"
              >
                <button
                  onClick={() => setStep(Step.REGISTRATION)}
                  className="group relative p-8 bg-white/5 border border-white/10 rounded-3xl text-left hover:bg-white/10 transition-all overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <QrCode size={80} />
                  </div>
                  <TicketIcon className="text-white/40 mb-4" size={32} />
                  <h3 className="text-xl font-medium mb-1">Portal Pembeli</h3>
                  <p className="text-white/40 text-sm">Daftar & beli tiket gallery secara instan.</p>
                </button>

                <button
                  onClick={() => setStep(Step.ADMIN_LOGIN)}
                  className="group relative p-8 bg-white/5 border border-white/10 rounded-3xl text-left hover:bg-white/10 transition-all overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TableIcon size={80} />
                  </div>
                  <Lock className="text-white/40 mb-4" size={32} />
                  <h3 className="text-xl font-medium mb-1">Portal Admin</h3>
                  <p className="text-white/40 text-sm">Kelola data pendaftar & laporan penjualan.</p>
                </button>
              </motion.div>
            )}

            {/* ADMIN LOGIN */}
            {step === Step.ADMIN_LOGIN && (
              <motion.div
                key="admin-login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-sm mx-auto w-full pt-12 text-center"
              >
                <div className="mb-8 flex justify-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                    <Lock className="text-white/60" size={24} />
                  </div>
                </div>
                <h3 className="text-xl font-light mb-6">Restricted Access</h3>
                <div className="space-y-4 text-left">
                  <InputField
                    label="Admin Password"
                    icon={Lock}
                    name="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    type="password"
                    placeholder="Enter password"
                  />
                  {adminError && <p className="text-[10px] text-red-400 mt-2 text-center">{adminError}</p>}
                  <button
                    onClick={handleAdminLogin}
                    className="w-full bg-white text-black py-4 rounded-xl font-bold text-sm tracking-widest uppercase mt-4"
                  >
                    Login to Dashboard
                  </button>
                  <button 
                    onClick={() => setStep(Step.LOBBY)}
                    className="w-full text-[10px] uppercase tracking-widest text-white/30 py-4"
                  >
                    Back to Lobby
                  </button>
                </div>
              </motion.div>
            )}

            {/* BUYER: REGISTRATION */}
            {step === Step.REGISTRATION && (
              <motion.div
                key="registration"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setStep(Step.LOBBY)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <p className="text-sm font-medium tracking-wide">Pendaftaran Tiket</p>
                </div>

                <div className="space-y-4">
                  <InputField
                    label="Nama Lengkap"
                    icon={User}
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    error={errors.name}
                  />
                  <InputField
                    label="Nomor Telepon"
                    icon={Phone}
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0812..."
                    error={errors.phone}
                  />
                  <InputField
                    label="Tanggal Lahir"
                    icon={Calendar}
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    type="date"
                    placeholder="DD/MM/YYYY"
                    error={errors.dob}
                  />
                  <InputField
                    label="Jumlah Orang"
                    icon={Users}
                    name="totalPeople"
                    value={formData.totalPeople}
                    onChange={handleInputChange}
                    type="number"
                    placeholder="1"
                    error={errors.totalPeople}
                  />
                </div>

                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="flex justify-between items-center text-xs opacity-50 mb-1">
                    <span>Estimasi Biaya</span>
                    <span>Rp 5.000 / orang</span>
                  </div>
                  <div className="flex justify-between items-center font-medium">
                    <span>Total Pembayaran</span>
                    <span className="text-xl font-mono">Rp {(parseInt(formData.totalPeople || '0') * TICKET_PRICE).toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <button
                  onClick={() => validate() && processRegistration()}
                  className="w-full bg-white text-black py-4 rounded-xl font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 group"
                >
                  Review Pembayaran
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}

            {/* BUYER: PAYMENT */}
            {step === Step.PAYMENT && currentRegistration && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl text-center space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-light">Scan & Bayar</h3>
                    <p className="text-white/40 text-xs text-balance">
                      Harap bayar sebesar <span className="text-white font-mono">Rp {currentRegistration.totalPrice.toLocaleString('id-ID')}</span> untuk pendaftaran {currentRegistration.totalPeople} orang.
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 inline-block rounded-2xl mx-auto shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                    <QRCodeSVG value={`PAY-GALLERY-${currentRegistration.id}`} size={180} level="H" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[8px] text-white/30 uppercase tracking-widest mb-1">Ticket Count</p>
                      <p className="font-mono text-sm">{currentRegistration.totalPeople} Pers.</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[8px] text-white/30 uppercase tracking-widest mb-1">Total Fee</p>
                      <p className="font-mono text-sm">Rp {currentRegistration.totalPrice.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={finalizePayment}
                  disabled={isProcessing}
                  className="w-full bg-white text-black py-4 rounded-xl font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                    />
                  ) : (
                    <>Konfirmasi Pembayaran <CheckCircle2 size={16} /></>
                  )}
                </button>
              </motion.div>
            )}

            {/* BUYER: SUCCESS & TICKET */}
            {step === Step.SUCCESS && currentRegistration && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <div className="bg-white p-3 rounded-full inline-block mb-2">
                    <CheckCircle2 className="text-black" size={32} />
                  </div>
                  <h2 className="text-2xl font-light">Ticket Secured!</h2>
                </div>

                <div className="bg-white text-black rounded-[32px] overflow-hidden">
                  <div className="p-8 border-b-2 border-black/5 border-dashed relative">
                    <div className="absolute -left-3 bottom-[-13px] w-6 h-6 bg-[#050505] rounded-full" />
                    <div className="absolute -right-3 bottom-[-13px] w-6 h-6 bg-[#050505] rounded-full" />
                    
                    <div className="flex justify-between items-start mb-8">
                      <div className="space-y-1">
                        <p className="text-[8px] uppercase tracking-widest font-bold opacity-30 underline underline-offset-4">Pass Type</p>
                        <p className="text-xl font-light">Gallery Admission</p>
                      </div>
                      <div className="p-2 bg-black text-white rounded-lg font-mono text-xs">
                        #{currentRegistration.queueNumber}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-6">
                      <div>
                        <p className="text-[8px] uppercase opacity-30 font-bold mb-1">Visitor Name</p>
                        <p className="text-sm font-semibold truncate pr-2 uppercase">{currentRegistration.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] uppercase opacity-30 font-bold mb-1">Ticket Count</p>
                        <p className="text-sm font-semibold">{currentRegistration.totalPeople} People</p>
                      </div>
                      <div>
                        <p className="text-[8px] uppercase opacity-30 font-bold mb-1">ID Ref</p>
                        <p className="text-[10px] font-mono text-black/50">{currentRegistration.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] uppercase opacity-30 font-bold mb-1">Date</p>
                        <p className="text-[10px] font-semibold">{new Date().toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/5 p-6 flex flex-col items-center">
                    <div className="bg-white p-2 rounded-xl mb-3">
                      <QRCodeSVG value={currentRegistration.id} size={100} />
                    </div>
                    <p className="text-[8px] uppercase tracking-[0.3em] font-bold opacity-20">Authorized Electronic Ticket</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => window.print()} className="bg-white text-black py-4 rounded-xl font-bold text-[10px] tracking-widest uppercase flex items-center justify-center gap-2">
                    <Download size={14} /> Download
                  </button>
                  <button onClick={() => setStep(Step.LOBBY)} className="bg-white/5 border border-white/10 text-white py-4 rounded-xl text-[10px] font-bold tracking-widest uppercase">
                    Done
                  </button>
                </div>
              </motion.div>
            )}

            {/* ADMIN DASHBOARD */}
            {step === Step.ADMIN_DASHBOARD && (
              <motion.div
                key="admin-dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                    <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Total Transaksi</p>
                    <p className="text-3xl font-light">{registrations.length}</p>
                  </div>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                    <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Total Pengunjung</p>
                    <p className="text-3xl font-light">{registrations.reduce((acc, curr) => acc + curr.totalPeople, 0)}</p>
                  </div>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                    <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Total Pendapatan</p>
                    <p className="text-3xl font-light text-green-400">Rp {registrations.reduce((acc, curr) => acc + curr.totalPrice, 0).toLocaleString('id-ID')}</p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LayoutDashboard size={18} className="text-white/40" />
                      <h3 className="text-sm font-medium tracking-wide">Data Registrasi & Tiket</h3>
                    </div>
                    <span className="text-[10px] text-white/30 px-3 py-1 bg-white/5 rounded-full uppercase tracking-widest">Live Updates</span>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-white/[0.02] text-[10px] uppercase tracking-widest text-white/40">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Queue</th>
                          <th className="px-6 py-4 font-semibold">Visitor Details</th>
                          <th className="px-6 py-4 font-semibold">DOB</th>
                          <th className="px-6 py-4 font-semibold text-center">People</th>
                          <th className="px-6 py-4 font-semibold text-right">Total Price</th>
                          <th className="px-6 py-4 font-semibold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {registrations.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-white/20 italic">Belum ada data pendaftaran.</td>
                          </tr>
                        ) : (
                          registrations.map((reg) => (
                            <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors group">
                              <td className="px-6 py-5">
                                <span className="font-mono text-xs px-2 py-1 bg-white/5 rounded">#{reg.queueNumber}</span>
                              </td>
                              <td className="px-6 py-5">
                                <div className="font-medium text-white group-hover:text-white transition-colors">{reg.name}</div>
                                <div className="text-[10px] text-white/30">{reg.phone}</div>
                              </td>
                              <td className="px-6 py-5 text-white/60">
                                {new Date(reg.dob).toLocaleDateString('id-ID')}
                              </td>
                              <td className="px-6 py-5 text-center font-mono">
                                {reg.totalPeople}
                              </td>
                              <td className="px-6 py-5 text-right font-mono font-medium text-green-400">
                                Rp {reg.totalPrice.toLocaleString('id-ID')}
                              </td>
                              <td className="px-6 py-5 text-right">
                                <span className="text-[10px] px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">Success</span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] uppercase tracking-[0.2em] text-white/20">
          <p>© 2026 GG PROJECT</p>
          <div className="flex gap-6">
            <span className="cursor-default">v 2.0.0</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
