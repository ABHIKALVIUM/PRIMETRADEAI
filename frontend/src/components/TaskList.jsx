import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Trash2, Edit, Calendar, CheckSquare, Clock, AlertTriangle, 
  Layers, RefreshCw 
} from 'lucide-react';

export default function TaskList({ onEditTask, refreshTrigger, onToast }) {
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      let queryStr = `page=${page}&limit=5`;
      if (statusFilter) queryStr += `&status=${statusFilter}`;
      if (priorityFilter) queryStr += `&priority=${priorityFilter}`;

      const res = await fetch(`/api/v1/tasks?${queryStr}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();

      if (res.ok && result.success) {
        setTasks(result.data.tasks);
        setTotalPages(result.pagination.pages || 1);
        setTotalCount(result.pagination.total || 0);
      } else {
        throw new Error(result.message || 'Fetch failure');
      }
    } catch (err) {
      console.error(err);
      onToast('Could not sync tracking matrix from server pipeline.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, priorityFilter, token, onToast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, refreshTrigger]);

  const handleDelete = async (id) => {
    if (!window.confirm('Confirm permanent removal of this entity record?')) return;
    try {
      const res = await fetch(`/api/v1/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();

      if (res.ok) {
        onToast('Document entry permanently removed from system ledgers.', 'success');
        fetchTasks();
      } else {
        throw new Error(result.message || 'Delete operation rejected.');
      }
    } catch (err) {
      onToast(err.message || 'Purge request rejected.', 'error');
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'high': return 'text-red-400 bg-red-950/30 border-red-900/50';
      case 'medium': return 'text-amber-400 bg-amber-950/30 border-amber-900/50';
      default: return 'text-emerald-400 bg-emerald-950/30 border-emerald-900/50';
    }
  };

  const getStatusIcon = (s) => {
    switch (s) {
      case 'completed': return <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />;
      case 'in-progress': return <Clock className="h-3.5 w-3.5 text-amber-400 animate-pulse" />;
      default: return <AlertTriangle className="h-3.5 w-3.5 text-white/40" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#121212] border border-white/10 p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Layers className="h-4 w-4 text-white/60" />
          <div className="font-mono text-xs uppercase font-bold tracking-wider">
            Tracking Ledger ({totalCount} Records found)
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-2 py-1.5 bg-[#0A0A0A] border border-white/10 text-xs text-white/80 font-mono rounded-none focus:border-white outline-none transition"
          >
            <option value="">All States</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In-Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
            className="px-2 py-1.5 bg-[#0A0A0A] border border-white/10 text-xs text-white/80 font-mono rounded-none focus:border-white outline-none transition"
          >
            <option value="">All Priorities</option>
            <option value="low">Low Severity</option>
            <option value="medium">Medium Severity</option>
            <option value="high">High Severity</option>
          </select>

          <button 
            onClick={fetchTasks}
            className="p-2 border border-white/10 hover:border-white bg-[#0A0A0A] transition text-white/60 hover:text-white cursor-pointer"
            title="Sync Ledger"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="w-full py-16 border border-white/5 bg-[#121212]/30 flex items-center justify-center font-mono text-xs text-white/40 uppercase tracking-widest gap-3">
          <span className="h-4 w-4 border-2 border-white/20 border-t-white rounded-none animate-spin" />
          <span>Synchronizing records queue...</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="w-full py-16 border border-white/10 bg-[#121212]/30 flex flex-col items-center justify-center font-mono text-center p-6">
          <Layers className="h-8 w-8 text-white/10 mb-3" />
          <div className="text-xs text-white/40 uppercase tracking-widest">No matching tasks allocated inside this workspace.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const isTaskOwner = user && task.createdBy && (task.createdBy === user.id || task.createdBy.toString() === user.id);
            const canModify = isTaskOwner || (user && user.role === 'admin');

            return (
              <div 
                key={task._id} 
                className="bg-[#121212] border border-white/10 hover:border-white/20 p-6 transition duration-200 flex flex-col md:flex-row md:items-center justify-between gap-6 group relative"
              >
                <div className="space-y-3 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className={`text-base font-bold tracking-tight text-white ${task.status === 'completed' ? 'line-through text-white/40' : ''}`}>
                      {task.title}
                    </h4>
                    
                    <span className={`px-2 py-0.5 border text-[9px] font-mono uppercase tracking-wider font-bold ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>

                    <span className="px-2 py-0.5 border border-white/10 bg-[#0A0A0A] text-white/50 text-[9px] font-mono uppercase tracking-wider flex items-center gap-1.5">
                      {getStatusIcon(task.status)}
                      <span>{task.status}</span>
                    </span>
                  </div>

                  <p className={`text-sm leading-relaxed ${task.status === 'completed' ? 'text-white/20' : 'text-white/60'}`}>
                    {task.description}
                  </p>

                  <div className="flex items-center gap-4 text-[10px] font-mono text-white/40">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                    </span>
                    {user && user.role === 'admin' && (
                      <span className="px-1.5 py-0.5 bg-purple-950/40 border border-purple-900/60 text-purple-400 text-[8px] uppercase tracking-widest font-black">
                        ID Reference: {task.createdBy?.toString() || 'System'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center md:justify-end gap-3 shrink-0">
                  {canModify && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => onEditTask(task)}
                        className="px-3 py-1.5 border border-white/10 hover:border-white text-[10px] font-mono uppercase tracking-widest font-bold text-white transition bg-[#1A1A1A] cursor-pointer"
                        title="Edit Entity Parameters"
                      >
                        Modify
                      </button>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="px-3 py-1.5 border border-red-900/50 hover:border-red-500 bg-red-950/20 hover:bg-red-950/60 text-[10px] font-mono uppercase tracking-widest font-bold text-red-400 transition cursor-pointer"
                        title="Delete Entity"
                      >
                        Purge
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-[#121212] border border-white/10 rounded-none p-4 font-mono">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 border border-white/20 hover:border-white text-[10px] font-black text-white hover:bg-white hover:text-black uppercase tracking-widest transition duration-200 disabled:opacity-30 cursor-pointer"
              >
                Previous
              </button>
              <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">
                Matrix Frame {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border border-white/20 hover:border-white text-[10px] font-black text-white hover:bg-white hover:text-black uppercase tracking-widest transition duration-200 disabled:opacity-30 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}