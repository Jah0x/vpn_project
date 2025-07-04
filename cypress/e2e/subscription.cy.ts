describe('subscription page', () => {
  it('shows available plans', () => {
    cy.intercept('GET', '/api/public/plans').as('plans');
    cy.visit('/subscription');
    cy.wait('@plans').its('response.statusCode').should('eq', 200);
    cy.get('[data-testid="plan-card"]').should('have.length', 4);
  });
});
