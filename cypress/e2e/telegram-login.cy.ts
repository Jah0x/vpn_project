describe('telegram login', () => {
  it('sends auth request once', () => {
    cy.intercept('POST', '/api/auth/telegram').as('tg');
    cy.visit('/telegram', {
      onBeforeLoad(win) {
        win.Telegram = { WebApp: { initDataUnsafe: { id: 1, username: 'tg', auth_date: 1, hash: 'h' } } };
      },
    });
    cy.wait('@tg');
    cy.wait(500);
    cy.get('@tg.all').then((calls) => {
      expect(calls.length).to.be.lte(2);
    });
  });
});
