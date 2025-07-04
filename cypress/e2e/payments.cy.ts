describe('pricing page', () => {
  it('shows plan prices and opens widget', () => {
    cy.visit('/pricing');
    const prices = ['400', '1200', '2400', '4500'];
    prices.forEach((p) => cy.contains(`${p} ₽`));
    cy.window().then((win) => {
      cy.stub(win, 'open').as('open');
    });
    cy.contains('Купить за 400 ₽').click();
    cy.get('@open').should('be.called');
  });
});
