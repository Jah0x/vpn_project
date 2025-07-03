describe('Auth flow', () => {
  it('logs in with admin user', () => {
    cy.visit('/login');
    cy.get('input[name=email]').type('drbabv@zerologsvpn.com');
    cy.get('input[name=password]').type('drbabv123');
    cy.intercept('POST', '/api/auth/login').as('login');
    cy.contains('button', 'Войти').click();
    cy.wait('@login').its('response.statusCode').should('eq', 200);
    cy.url().should('match', /dashboard/i);
  });
});
