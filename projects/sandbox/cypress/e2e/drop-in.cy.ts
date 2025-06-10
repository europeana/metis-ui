import { selectorInputDatasetId } from '../support/selectors';

context('Sandbox', () => {
  const selDropIn = '.drop-in.active';
  const selDropInPinned = '.drop-in.view-pinned';
  const selFirstSuggestion = '.item-identifier:first-child';
  const selSecondSuggestion = '.item-identifier:nth-child(3)';

  describe('Drop-In (pinned)', () => {
    const keyOpenPinned = (): void => {
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selFirstSuggestion)
        .focus()
        .type('{shift}{enter}');
    };
    const selBubble = '.detail-field';

    it('should display the jump-link bubble', () => {
      const selJumpLinkBubble = '.jump-to-pinned-inner';

      cy.visit('/dataset');
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selFirstSuggestion).trigger('mouseenter');
      cy.get(selFirstSuggestion).focus();
      cy.get(selJumpLinkBubble).should('exist');
      cy.get(':focus + * ' + selJumpLinkBubble).should('exist');

      cy.get(selectorInputDatasetId).type('{esc}');
      cy.wait(1);
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selSecondSuggestion).trigger('mouseenter');
      cy.get(selSecondSuggestion).focus();
      cy.get(':focus + * ' + selJumpLinkBubble).should('not.exist');
    });

    it('should display in pinned mode via clicking the bubble', () => {
      cy.visit('/dataset');
      cy.get(selDropInPinned).should('not.exist');
      cy.get(selBubble).should('not.exist');
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selFirstSuggestion).trigger('mouseenter');
      cy.get(selFirstSuggestion).focus();
      cy.get(selBubble)
        .filter(':visible')
        .should('exist');
      cy.get(selBubble)
        .filter(':visible')
        .first()
        .click();
      cy.get(selDropInPinned).should('exist');
    });

    it('should display in pinned mode via the keyboard', () => {
      cy.visit('/dataset');
      cy.get(selDropInPinned).should('not.exist');
      keyOpenPinned();
      cy.get(selDropInPinned).should('exist');
    });
  });

  describe('Drop-In (selection)', () => {
    it('should set the value', () => {
      cy.visit('/dataset');
      cy.get(selectorInputDatasetId).should('have.value', '');
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selFirstSuggestion).click();
      cy.get(selectorInputDatasetId).should('have.value', '0');
    });

    it('should hide when the value is set (keyboard)', () => {
      cy.visit('/dataset');
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selFirstSuggestion).focus();
      cy.get(selFirstSuggestion).type('{enter}');

      cy.get(selDropIn).should('not.exist');
    });

    it('should hide when the value is set (click)', () => {
      cy.visit('/dataset');
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selFirstSuggestion).click();
      cy.get(selDropIn).should('not.exist');
    });

    it('should hide when the input is blurred', () => {
      cy.visit('/dataset');
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selDropIn).should('exist');
      cy.press(Cypress.Keyboard.Keys.TAB);
      cy.get(selDropIn).should('not.exist');
    });

    it('should set the correct caret position', () => {
      // open
      cy.visit('/dataset');
      cy.get(selectorInputDatasetId).should('have.value', '');
      cy.get(selectorInputDatasetId).type('{esc}');

      // set
      cy.get(selFirstSuggestion).click();
      cy.get(selectorInputDatasetId).should('have.value', '0');
      cy.get(selectorInputDatasetId).type('0');

      // confirm typng overwrites
      cy.get(selectorInputDatasetId).should('have.value', '0');

      // re-open and close
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selectorInputDatasetId).type('{esc}');

      // confirm typng appends
      cy.get(selectorInputDatasetId).type('0');
      cy.get(selectorInputDatasetId).should('have.value', '00');
    });
  });

  describe('Drop-In (display)', () => {
    it('should be hidden by default', () => {
      cy.visit('/dataset');
      cy.get(selDropIn).should('not.exist');
    });

    it('should show (all) when the "Escape" key is pressed', () => {
      cy.visit('/dataset');
      cy.get(selDropIn).should('not.exist');
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selDropIn).should('exist');
    });

    it('should toggle when the "Escape" key is pressed', () => {
      cy.visit('/dataset');
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selDropIn).should('exist');
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selDropIn).should('not.exist');
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selDropIn).should('exist');
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selDropIn).should('not.exist');
    });

    it('should show when the field is filled (auto-suggest)', () => {
      cy.visit('/dataset');
      cy.get(selDropIn).should('not.exist');
      cy.get(selectorInputDatasetId).type('11');
      cy.get(selDropIn).should('exist');
    });

    it('should not auto-suggest (again) once closed', () => {
      cy.visit('/dataset');
      cy.get(selectorInputDatasetId).type('11');
      cy.get(selDropIn).should('exist');
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selDropIn).should('not.exist');
      cy.get(selectorInputDatasetId).type('11');
      cy.get(selDropIn).should('not.exist');
    });
  });
});
