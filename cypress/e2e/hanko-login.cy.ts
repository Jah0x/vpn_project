describe('hanko login', () => {
  it('exchanges token', () => {
    cy.intercept('POST', '/api/auth/hanko').as('login');
    cy.visit('/login', {
      onBeforeLoad(win) {
        (win as any).Hanko = function () {
          return {
            session: { get: () => Promise.resolve({ jwt: 'jwt' }) },
            onAuthFlowCompleted: (cb: () => void) => cb(),
          };
        };
      }
    });
    cy.wait('@login').its('request.body').should('deep.equal', { token: 'jwt' });
  });
});
