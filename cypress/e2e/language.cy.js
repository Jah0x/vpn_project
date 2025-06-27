describe("language switch", () => {
  it("changes button text", () => {
    cy.visit("/");
    cy.contains("Restart");
    cy.get('[data-testid="lang-toggle"]').click();
    cy.get('[data-testid="lang-ru"]').click();
    cy.contains("Перезапустить");
  });
});
