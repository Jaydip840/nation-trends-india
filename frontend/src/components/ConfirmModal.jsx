import React from 'react';
import { FiLogOut, FiX } from 'react-icons/fi';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      {/* OVERLAY */}
      <div 
        className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      />

      {/* MODAL CARD */}
      <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-slide-up border border-slate-100">
        <div className="p-10 text-center">
          {/* ICON AREA */}
          <div className="mx-auto w-20 h-20 bg-red-50 rounded-[28px] flex items-center justify-center text-red-500 mb-8 border border-red-100">
            <FiLogOut size={32} />
          </div>

          <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-4 uppercase">{title}</h3>
          <p className="text-slate-400 font-bold text-sm leading-relaxed mb-10 px-4">
            {message}
          </p>

          <div className="flex flex-col space-y-3">
            <button 
              onClick={onConfirm}
              className="w-full bg-[#0f172a] hover:bg-red-500 text-white font-black py-5 rounded-[22px] text-[11px] uppercase tracking-[0.2em] transition-all duration-300 shadow-xl shadow-slate-200 active:scale-95"
            >
              Confirm Logout
            </button>
            <button 
              onClick={onClose}
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-400 font-black py-5 rounded-[22px] text-[11px] uppercase tracking-[0.2em] transition duration-300 active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* TOP CLOSE BUTTON */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-3 text-slate-300 hover:text-slate-900 transition"
        >
          <FiX size={20} />
        </button>
      </div>
    </div>
  );
};

export default ConfirmModal;
