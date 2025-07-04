import api from './api';

export const couponApi = {
  validateCoupon: async (code: string) => {
    const { data } = await api.post('/coupons/validate', { code });
    return data;
  },
};

export default couponApi;
