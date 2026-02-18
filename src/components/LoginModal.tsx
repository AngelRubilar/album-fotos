'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

interface LoginModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function LoginModal({ onSuccess, onCancel }: LoginModalProps) {
  const { t } = useTheme();
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(password);
    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || 'Error');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative ${t.glassCard} rounded-2xl p-8 w-full max-w-sm mx-4`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2.5 rounded-xl ${t.glassBg} border border-white/10`}>
            <svg className={`w-5 h-5 ${t.accent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h2 className={`text-lg font-bold ${t.text}`}>Acceso Administrador</h2>
            <p className={`text-xs ${t.textMuted}`}>Ingresa la contraseña para continuar</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Contraseña"
            className={`w-full px-4 py-3 rounded-xl border ${t.inputBorder} ${t.inputBg} ${t.text} backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:outline-none mb-3`}
            autoFocus
          />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className={`flex-1 px-4 py-2.5 rounded-xl border ${t.inputBorder} ${t.text} text-sm font-medium`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              className="flex-1 px-4 py-2.5 rounded-xl btn-glass-accent text-white text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
