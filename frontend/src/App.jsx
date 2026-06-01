import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import TaskForm from './components/TaskForm.jsx';
import TaskList from './components/TaskList.jsx';
import { LogOut, Shield, User, Terminal, Activity, Globe, ShieldCheck, CheckSquare, Clock, AlertTriangle, Layers } from 'lucide-react';

function DashboardView({ onToast }) {
  const { user, logout } = useAuth();
  const [currentEditingTask, setCurrentEditingTask] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTaskSaved = () => {
    setCurrentEditingTask(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEditTask = (task) => {
    setCurrentEditingTask(task);
  };

  const handleCancelEdit = () => {
    setCurrentEditingTask(null);
  };

  return (
    <div className="bg-[#0A0A0A] text-[#F5F5F5] min-h-screen flex flex-col justify-between selection:bg-white selection:text-black">
      <header className="flex flex-col md:flex-row md:items-center justify-between px-8 py-6 border-b border-white/10 bg-[#0A0A0A]">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-none font-display text-white">
            Monorepo Desk
          </h1>
          <div className="flex items-center gap-2 mt-2 text-xs font-mono text-emerald-500 uppercase tracking-widest">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            NODE_ENV: DEVELOPMENT | API VERSION: V1.0.4
          </div>
        </div>

        <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-6">
          <div className="text-left">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1 font-mono">Current Session</div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-[9px] font-black uppercase font-mono tracking-wider ${
                user?.role === 'admin' ? 'bg-amber-400 text-black' : 'bg-white text-black'
              }`}>
                {user?.role || 'User'}
              </span>
              <span className="text-sm font-bold text-white/90 font-mono">{user?.email}</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 border border-white/20 hover:border-white text-white hover:bg-white hover:text-black font-black uppercase text-xs transition duration-200 cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <section className="lg:col-span-4 lg:sticky lg:top-8 h-fit space-y-6">
          <TaskForm 
            currentEditingTask={currentEditingTask}
            onTaskSaved={handleTaskSaved}
            onCancelEdit={handleCancelEdit}
            onToast={onToast}
          />

          <div className="bg-white/[0.02] border border-white/10 p-6 space-y-4 rounded-none h-fit">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/40 font-mono flex items-center justify-between">
              <span>Telemetry Matrix</span>
              <span className="text-emerald-500">Live Connection</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="border-l border-white/10 pl-3">
                <div className="text-xl font-mono font-bold text-white">4ms</div>
                <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider">MDB Latency</div>
              </div>
              <div className="border-l border-white/10 pl-3">
                <div className="text-xl font-mono font-bold text-white">100%</div>
                <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Redis Cache</div>
              </div>
            </div>

            <div className="font-mono text-xs text-white/60 space-y-2 pt-2 border-t border-white/5">
              <div className="flex justify-between">
                <span>Domain Model:</span>
                <span className="text-emerald-400">DDMM Monolith</span>
              </div>
              <div className="flex justify-between">
                <span>Active Core:</span>
                <span>Sandbox Run</span>
              </div>
            </div>
          </div>
        </section>

        <section className="lg:col-span-8">
          <h2 className="text-7xl font-black tracking-tighter opacity-5 select-none uppercase font-display block leading-none mb-2">
            Workspace
          </h2>
          <TaskList 
            onEditTask={handleEditTask}
            refreshTrigger={refreshTrigger}
            onToast={onToast}
          />
        </section>
      </main>

      <footer className="px-8 py-3 bg-[#0d0d0d] border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] font-mono text-white/40 uppercase tracking-tighter">
        <div>Logs: GET /api/v1/tasks/ 200 OK (12ms) | POST /api/v1/auth/login 200 OK (84ms) | DB Ready</div>
        <div className="text-white/60">Principal Architect Console &copy; 2026</div>
      </footer>
    </div>
  );
}

function MainAppContent() {
  const { user, loading } = useAuth();
  const [isRegisterView, setIsRegisterView] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 space-y-4 text-white">
        <div className="h-10 w-10 border-2 border-white/10 border-t-white rounded-none animate-spin" />
        <p className="text-[10px] text-white/40 font-mono tracking-widest uppercase">Syncing REST System Scope...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-[#F5F5F5] antialiased font-sans flex flex-col justify-between selection:bg-white selection:text-black">
      {toast.visible && (
        <div 
          className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-none font-mono text-xs tracking-wider border animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === 'success' 
              ? 'bg-black border-emerald-500 text-emerald-400 shadow-[4px_4px_0px_rgba(16,185,129,0.15)]' 
              : 'bg-black border-red-500 text-red-400 shadow-[4px_4px_0px_rgba(239,68,68,0.15)]'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className={`h-2 w-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500 animate-ping' : 'bg-red-500 animate-ping'}`} />
            <span>{toast.message.toUpperCase()}</span>
          </div>
        </div>
      )}

      {user ? (
        <DashboardView onToast={showToast} />
      ) : (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#0A0A0A] relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-[0.02] select-none pointer-events-none">
            <h1 className="text-[20vh] font-black uppercase tracking-widest leading-none font-display">REST_DECK</h1>
          </div>
          
          {isRegisterView ? (
            <Register 
              onToggleView={() => setIsRegisterView(false)} 
              onToast={showToast}
            />
          ) : (
            <Login 
              onToggleView={() => setIsRegisterView(true)} 
              onToast={showToast}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}