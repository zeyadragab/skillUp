import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div
          className={`relative bg-panel border border-edge rounded-xl w-full ${sizeClasses[size]} animate-fade-in`}
          style={{ boxShadow: '0 0 0 1px oklch(30% 0.016 260), 0 24px 64px oklch(0% 0 0 / 0.55)' }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-edge">
            <h3 className="text-[14px] font-semibold text-fg-1">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 text-fg-3 hover:text-fg-1 hover:bg-panel-hi rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="px-5 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
