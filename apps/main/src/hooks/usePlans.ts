import { useEffect, useState } from 'react';
import subscriptionApi from '../services/subscription';
import type { Plan } from '../types/plan';

export default function usePlans() {
  const [plans, setPlans] = useState<Plan[] | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;
    subscriptionApi
      .getPlans()
      .then((data) => {
        if (isMounted) setPlans(data);
      })
      .catch((err) => {
        console.error('failed to load plans', err);
        if (isMounted) setPlans([]);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return plans;
}
