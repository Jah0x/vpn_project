describe('hanko login', () => {
  it('exchanges token', () => {
    cy.intercept('POST', '/api/auth/login').as('login');
    cy.visit('/login', {
      onBeforeLoad(win) {
        (win as any).hanko = { session: { getToken: () => Promise.resolve('jwt') } };
        document.dispatchEvent(new Event('hankoAuthFlowCompleted'));
      }
    });
    cy.wait('@login').its('request.body').should('deep.equal', { token: 'jwt' });
  });
});
