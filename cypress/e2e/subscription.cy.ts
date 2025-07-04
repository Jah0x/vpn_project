describe('subscription page', () => {
  it('shows available plans', () => {
    cy.intercept('GET', '/api/public/plans').as('plans');
    cy.visit('/subscription');
    cy.wait('@plans').then((interception) => {
      expect(interception.response?.statusCode).to.equal(200);
      expect(interception.response?.body).to.have.length(4);
    });
    cy.get('[data-testid="plan-card"]').should('have.length', 4);
  });
});
