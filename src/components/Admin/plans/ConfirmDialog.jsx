import React from 'react';

const ConfirmDialog = ({ open, onConfirm, onCancel, text }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-72 space-y-4">
        <p>{text}</p>
        <div className="flex justify-end space-x-2">
          <button className="px-3 py-1" onClick={onCancel}>Отмена</button>
          <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={onConfirm}>OK</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
