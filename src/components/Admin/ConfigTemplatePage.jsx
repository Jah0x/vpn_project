import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const ConfigTemplatePage = () => {
  const { user } = useAuth();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetch('/api/admin/config-template')
        .then(r => r.json())
        .then(data => setValue(JSON.stringify(data, null, 2)));
    }
  }, [user]);

  const save = async () => {
    try {
      const json = JSON.parse(value);
      await fetch('/api/admin/config-template', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json)
      });
      setError('');
    } catch (e) {
      setError('Неверный JSON');
    }
  };

  if (user?.role !== 'ADMIN') {
    return <div className="p-4 text-red-500">403 Forbidden</div>;
  }

  return (
    <div className="p-4 space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      <textarea
        className="w-full h-64 p-2 text-sm text-gray-900"
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <button onClick={save} className="bg-blue-600 text-white px-4 py-2 rounded">
        Save
      </button>
    </div>
  );
};

export default ConfigTemplatePage;
