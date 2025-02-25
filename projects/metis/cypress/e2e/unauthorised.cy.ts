context('metis-ui', () => {
  describe('unuathorised', () => {
    const urlForbidden = '/dataset/edit/403';
    const urlParamWarnUnauthorised = 'showModalUnauthorised';

    it('Warns unauthorised users from access', () => {
      cy.visit('/dataset/edit/0');
      cy.get('.modal').should('not.exist');
      cy.visit(urlForbidden);
      cy.url().should('not.contain', urlForbidden);
      cy.url().should('contain', urlParamWarnUnauthorised);
      cy.get('.modal .head')
        .contains('Account Unauthorised')
        .should('exist');
    });

    it('Should return unauthorised users home when they close the modal', () => {
      cy.visit(urlForbidden);
      cy.url().should('contain', urlParamWarnUnauthorised);
      cy.get('.modal button').click();
      cy.url().should('not.contain', urlParamWarnUnauthorised);
    });
  });
});
