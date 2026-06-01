import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { PlusCircle, Edit3, X, FileText, CheckCircle2 } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export default function TaskForm({ currentEditingTask, onTaskSaved, onCancelEdit, onToast }) {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [priority, setPriority] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!currentEditingTask;

  useEffect(() => {
    if (currentEditingTask) {
      setTitle(currentEditingTask.title || '');
      setDescription(currentEditingTask.description || '');
      setStatus(currentEditingTask.status || 'pending');
      setPriority(currentEditingTask.priority || 'medium');
    } else {
      setTitle('');
      setDescription('');
      setStatus('pending');
      setPriority('medium');
    }
  }, [currentEditingTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      onToast('Task title is required', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const url = isEditMode
        ? `${BASE_URL}/api/v1/tasks/${currentEditingTask._id}`
        : `${BASE_URL}/api/v1/tasks`;

      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, status, priority })
      });

      const result = await res.json();

      if (res.ok && result.success) {
        onToast(isEditMode ? 'Task details updated!' : 'New task allocated successfully.', 'success');
        onTaskSaved();
      } else {
        throw new Error(result.message || 'Operation failure');
      }
    } catch (err) {
      onToast(err.message || 'Failed to update ledger records', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#121212] border border-white/10 p-6 rounded-none relative">
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
        <div className="flex items-center gap-2.5">
          {isEditMode ? <Edit3 className="text-emerald-400 h-4 w-4" /> : <PlusCircle className="text-white h-4 w-4" />}
          <h3 className="text-sm font-black uppercase tracking-wider font-mono">
            {isEditMode ? 'Modify Document Frame' : 'Allocate New Resource'}
          </h3>
        </div>
        {isEditMode && (
          <button
            onClick={onCancelEdit}
            className="text-white/40 hover:text-white p-1 hover:bg-white/5 transition duration-150 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] text-white/55 font-mono uppercase tracking-widest mb-1">
            Task Name Heading
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/20">
              <FileText className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0A0A0A] border border-white/10 text-sm text-white font-mono rounded-none focus:border-white outline-none transition"
              placeholder="Develop authentication pipelines..."
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-white/55 font-mono uppercase tracking-widest mb-1">
            Task Objective Overview
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 text-sm text-white font-mono rounded-none focus:border-white outline-none transition resize-none"
            placeholder="Document technical workflows, constraints, and dependencies..."
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-white/55 font-mono uppercase tracking-widest mb-1">
              Tracking Phase State
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-3 bg-[#121212] border border-white/10 text-sm text-white font-mono rounded-none focus:border-white outline-none transition appearance-none"
            >
              <option value="pending" className="bg-[#121212] text-white">Pending</option>
              <option value="in-progress" className="bg-[#121212] text-white">In-Progress</option>
              <option value="completed" className="bg-[#121212] text-white">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-white/55 font-mono uppercase tracking-widest mb-1">
              Priority Ranking
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-3 bg-[#121212] border border-white/10 text-sm text-white font-mono rounded-none focus:border-white outline-none transition"
            >
              <option value="low" className="bg-[#121212] text-white">Low Severity</option>
              <option value="medium" className="bg-[#121212] text-white">Medium Severity</option>
              <option value="high" className="bg-[#121212] text-white">High Severity</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-3 px-4 bg-white hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider rounded-none transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="h-4 w-4 border-2 border-black/30 border-t-black rounded-none animate-spin" />
          ) : (
            <>
              {isEditMode ? <CheckCircle2 className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
              <span>{isEditMode ? 'Commit Schema Changes' : 'Publish Resource Entry'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}