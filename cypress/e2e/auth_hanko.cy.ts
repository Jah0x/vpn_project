describe('hanko auth api', () => {
  it('issues tokens and accesses protected endpoint', () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ sub: 'user123' }, Cypress.env('HANKO_JWT_SECRET') || 'testsecret');
    cy.request('POST', '/api/auth/hanko', { token }).then((res) => {
      expect(res.status).to.eq(200);
      const access = res.body.access_token;
      expect(access).to.be.a('string');
      cy.request({
        method: 'GET',
        url: '/api/vpn',
        headers: { Authorization: `Bearer ${access}` },
      }).its('status').should('eq', 200);
    });
  });
});
