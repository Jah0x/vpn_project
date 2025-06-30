import React, { useEffect, useRef } from "react";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  closable = true,
  overlay = true,
  animation = true,
  className = "",
}) => {
  const modalRef = useRef(null);

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4",
  };

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && closable) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, closable]);

  // Закрытие по клику на overlay
  const handleOverlayClick = (e) => {
    if (overlay && closable && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Фокус на модальном окне
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        animation ? "animate-fadeIn" : ""
      }`}
      onClick={handleOverlayClick}
    >
      {/* Overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      )}

      {/* Modal Content */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`
          relative w-full ${sizeClasses[size]} max-h-[90vh] 
          bg-gray-800 border border-gray-700 rounded-xl shadow-2xl
          flex flex-col overflow-hidden
          ${animation ? "animate-slideIn" : ""}
          ${className}
        `}
      >
        {/* Header */}
        {(title || closable) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            {title && (
              <h2 className="text-xl font-semibold text-white">{title}</h2>
            )}
            {closable && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// Компонент для тела модального окна
export const ModalBody = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

// Компонент для подвала модального окна
export const ModalFooter = ({ children, className = "" }) => (
  <div
    className={`flex items-center justify-end space-x-3 p-6 border-t border-gray-700 ${className}`}
  >
    {children}
  </div>
);

// Хук для управления модальными окнами
export const useModal = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const toggleModal = () => setIsOpen(!isOpen);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
  };
};

export default Modal;
