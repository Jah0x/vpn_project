import { render } from '@testing-library/react';
import VpnStatusBadge from '../VpnStatusBadge';
import { VpnStatus } from '../../types/vpn';

describe('VpnStatusBadge snapshots', () => {
  const statuses: VpnStatus[] = ['online', 'offline', 'warning', 'pending'];
  statuses.forEach(status => {
    it(`renders ${status}`, () => {
      const { container } = render(<VpnStatusBadge status={status} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
