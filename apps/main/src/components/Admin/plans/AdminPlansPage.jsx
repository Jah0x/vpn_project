import React, { useEffect, useState } from 'react';
import PlanTable from './PlanTable';
import PlanModal from './PlanModal';
import ConfirmDialog from './ConfirmDialog';
import { adminApi } from '../../../services/admin';

const AdminPlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = async () => {
    const { data } = await adminApi.getPlans();
    setPlans(data);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (dto) => {
    if (current) {
      await adminApi.updatePlan(current.id, dto);
    } else {
      await adminApi.createPlan(dto);
    }
    setModalOpen(false);
    setCurrent(null);
    load();
  };

  const remove = async () => {
    if (confirm) {
      await adminApi.deletePlan(confirm.id);
      setConfirm(null);
      load();
    }
  };

  return (
    <div>
      <PlanTable
        plans={plans}
        onAdd={() => setModalOpen(true)}
        onEdit={(p) => {
          setCurrent(p);
          setModalOpen(true);
        }}
        onDelete={(p) => setConfirm(p)}
      />
      <PlanModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setCurrent(null);
        }}
        onSubmit={save}
        initial={current}
      />
      <ConfirmDialog
        open={!!confirm}
        onCancel={() => setConfirm(null)}
        onConfirm={remove}
        text="Архивировать тариф?"
      />
    </div>
  );
};

export default AdminPlansPage;
