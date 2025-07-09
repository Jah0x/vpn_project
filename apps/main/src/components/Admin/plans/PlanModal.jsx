import React, { useState, useEffect } from 'react';

const defaultData = {
  name: '',
  code: '',
  priceId: '',
  maxVpns: 1,
  isActive: true,
};

const PlanModal = ({ open, onClose, onSubmit, initial }) => {
  const [data, setData] = useState(defaultData);

  useEffect(() => {
    setData(initial || defaultData);
  }, [initial]);

  if (!open) return null;

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setData({ ...data, [name]: type === 'checkbox' ? checked : value });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-80 space-y-3">
        <h3 className="text-lg font-semibold mb-2">{initial ? 'Редактировать' : 'Создать'} план</h3>
        <input
          name="name"
          value={data.name}
          onChange={handle}
          className="w-full p-2 rounded border border-gray-300 text-black"
          placeholder="Название"
        />
        <input
          name="code"
          value={data.code}
          onChange={handle}
          className="w-full p-2 rounded border border-gray-300 text-black"
          placeholder="Код"
        />
        <input
          name="priceId"
          value={data.priceId}
          onChange={handle}
          className="w-full p-2 rounded border border-gray-300 text-black"
          placeholder="Price ID"
        />
        <input
          type="number"
          name="maxVpns"
          value={data.maxVpns}
          onChange={handle}
          className="w-full p-2 rounded border border-gray-300 text-black"
          placeholder="Макс. VPN"
        />
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="isActive" checked={data.isActive} onChange={handle} />
          <span>Активен</span>
        </label>
        <div className="flex justify-end space-x-2 pt-2">
          <button className="px-3 py-1" onClick={onClose}>Отмена</button>
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded"
            onClick={() => onSubmit(data)}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanModal;
