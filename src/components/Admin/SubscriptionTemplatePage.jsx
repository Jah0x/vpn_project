import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';

const SubscriptionTemplatePage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [value, setValue] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetch('/api/admin/subscription-template')
        .then(r => r.json())
        .then(data => setValue(data.urlTemplate));
    }
  }, [user]);

  const save = async () => {
    if (!value.includes('{{UUID}}')) {
      showToast('Шаблон должен содержать {{UUID}}', 'error');
      return;
    }
    await fetch('/api/admin/subscription-template', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urlTemplate: value })
    });
    showToast('Сохранено', 'success');
  };

  if (user?.role !== 'admin') {
    return <div className="p-4 text-red-500">403 Forbidden</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <textarea
        className="w-full h-32 p-2 text-sm text-gray-900"
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <button onClick={save} className="bg-blue-600 text-white px-4 py-2 rounded">
        Save
      </button>
    </div>
  );
};

export default SubscriptionTemplatePage;
