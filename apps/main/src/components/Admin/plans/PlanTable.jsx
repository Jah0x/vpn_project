import React from 'react';

const PlanTable = ({ plans, onEdit, onDelete, onAdd }) => {
  return (
    <div className="bg-gray-800 rounded-2xl p-4 shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Тарифы</h2>
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded"
          onClick={onAdd}
        >
          Добавить
        </button>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="text-gray-400">
          <tr>
            <th className="p-2">Название</th>
            <th className="p-2">Код</th>
            <th className="p-2">PriceId</th>
            <th className="p-2">VPNs</th>
            <th className="p-2">Активен</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {plans.map((p) => (
            <tr key={p.id} className="border-t border-gray-700">
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.code}</td>
              <td className="p-2">{p.priceId}</td>
              <td className="p-2">{p.maxVpns}</td>
              <td className="p-2">{p.isActive ? 'yes' : 'no'}</td>
              <td className="p-2 space-x-2">
                <button
                  className="text-blue-400 hover:underline"
                  onClick={() => onEdit(p)}
                >
                  Редактировать
                </button>
                <button
                  className="text-red-400 hover:underline"
                  onClick={() => onDelete(p)}
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlanTable;
