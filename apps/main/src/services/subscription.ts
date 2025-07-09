import api from './api';
import type { Plan } from '../types/plan';

export const subscriptionApi = {
  getPlans: async (): Promise<Plan[]> => {
    const { data } = await api.get('/public/plans');
    return data;
  },
};

export default subscriptionApi;
