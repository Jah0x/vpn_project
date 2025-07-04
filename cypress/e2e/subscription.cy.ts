describe('subscription page', () => {
  it('shows available plans', () => {
    cy.visit('/login');
    cy.get('input[name=email]').type('drbabv@zerologsvpn.com');
    cy.get('input[name=password]').type('drbabv123');
    cy.intercept('POST', '/api/auth/login').as('login');
    cy.contains('button', 'Войти').click();
    cy.wait('@login').its('response.statusCode').should('eq', 200);

    cy.intercept('GET', '/api/plans').as('plans');
    cy.visit('/subscription');
    cy.wait('@plans').its('response.statusCode').should('eq', 200);

    const names = ['1 месяц', '3 месяца', '6 месяцев', '12 месяцев'];
    names.forEach((n) => cy.contains(n));
    cy.get('h3').filter(':contains("меся")').should('have.length', 4);
  });
});
