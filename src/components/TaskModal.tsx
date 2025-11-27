import React, { useState } from 'react';
import { CheckCircle2, Circle, ArrowUpCircle, Moon, Bell, CreditCard, LogOut, CheckSquare } from 'lucide-react';
import { Task, Project } from '../types';
import { PRIORITIES } from '../constants';

const Avatar = ({ name }: { name: string }) => {
  return <div className="w-24 h-24 text-3xl rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center font-medium border border-transparent shadow-sm">{name ? name[0] : '?'}</div>;
};

export const DashboardView = ({ stats, tasks, projects }: { stats: any; tasks: Task[]; projects: Project[] }) => (
  <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-300 dark:text-gray-100">
    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Good Morning, User ☀️</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Stat Cards - Muted Colors */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><CheckCircle2 size={20}/></div><h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">Tasks Completed</h3></div><p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.done}</p></div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg"><Circle size={20}/></div><h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">In Progress</h3></div><p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.progress}</p></div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"><ArrowUpCircle size={20}/></div><h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">High Priority</h3></div><p className="text-3xl font-bold text-gray-900 dark:text-white">{tasks.filter(t => t.priority === 'high' && t.status !== 'done').length}</p></div>
    </div>
    {/* ... (Rest of Dashboard identical layout but ensuring clean styles) */}
  </div>
);

export const SettingsView = ({ darkMode, toggleDarkMode }: { darkMode: boolean; toggleDarkMode: () => void }) => (
  <div className="p-8 max-w-4xl mx-auto animate-in fade-in duration-300">
    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Settings</h1>
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      <div className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
         <div className="flex items-center gap-4"><div className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg"><Moon size={20} /></div><div><h3 className="font-medium text-gray-900 dark:text-white">Dark Mode</h3><p className="text-sm text-gray-500 dark:text-gray-400">Enable dark theme for the application.</p></div></div>
         <label className="relative inline-flex items-center cursor-pointer">
           <input type="checkbox" className="sr-only peer" checked={darkMode} onChange={toggleDarkMode} />
           <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 dark:peer-focus:ring-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900 dark:peer-checked:bg-white"></div>
         </label>
      </div>
    </div>
  </div>
);

export const AccountView = () => (
  <div className="p-8 max-w-4xl mx-auto animate-in fade-in duration-300">
    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Account</h1>
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 flex flex-col md:flex-row items-start gap-8 shadow-sm">
       <div className="flex flex-col items-center gap-4"><Avatar name="User" /><button className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:underline">Change Avatar</button></div>
       <div className="flex-1 space-y-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label><input type="text" defaultValue="User Account" className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-gray-400 outline-none" /></div>
             <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label><input type="email" defaultValue="user@example.com" className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-gray-400 outline-none" /></div>
          </div>
       </div>
    </div>
  </div>
);

export const InboxView = () => (
  <div className="p-8 max-w-3xl mx-auto animate-in fade-in duration-300">
    <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold text-gray-800 dark:text-white">Inbox</h1><button className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 flex items-center gap-1"><CheckSquare size={14}/> Mark all read</button></div>
    <div className="space-y-2"><div className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"><div className="mt-1"><div className="w-2 h-2 rounded-full bg-blue-400/50"></div></div><div className="flex-1"><div className="flex justify-between mb-1"><span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Sarah mentioned you</span><span className="text-xs text-gray-400">2h ago</span></div><p className="text-sm text-gray-600 dark:text-gray-400 mb-2">"Can you review the latest draft?"</p></div></div></div>
  </div>
);

export const DocView = ({ docId }: { docId: string }) => {
  return (
    <div className="max-w-3xl mx-auto py-8 px-8 animate-in fade-in duration-300">
      <div className="text-4xl mb-6 font-bold text-gray-800 dark:text-white placeholder-gray-300 outline-none" contentEditable suppressContentEditableWarning>{docId === 'd1' ? 'Q4 Roadmap' : 'Meeting Notes'}</div>
      <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed group"><h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">Overview</h2><p className="outline-none focus:bg-gray-50 dark:focus:bg-gray-800 p-1 rounded" contentEditable suppressContentEditableWarning>This document outlines the core strategy.</p></div>
    </div>
  );
};