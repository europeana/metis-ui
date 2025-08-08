import { login } from '../support/helpers';
import { selectorBtnSubmitProgress, selectorInputDatasetId } from '../support/selectors';

context('Sandbox', () => {
  const force = { force: true };
  const selDropIn = '.drop-in.active';
  const selDropInError = `${selDropIn}.error`;
  const selDropInPinned = '.drop-in.view-pinned';
  const selFirstSuggestion = '.item-identifier:first-child';

  const setupUserData = (): void => {
    cy.visit('/dataset');
    login();
  };

  const keyOpen = (): void => {
    cy.get(selectorInputDatasetId).type('{esc}');
  };

  const keyOpenPinned = (): void => {
    keyOpen();
    cy.get(selFirstSuggestion)
      .focus()
      .type('{shift}{enter}');
  };

  describe('Drop-In (unavailable)', () => {
    it('should not display if not logged in', () => {
      cy.visit('/dataset');
      cy.get(selDropIn).should('not.exist');
      keyOpen();
      cy.get(selDropIn).should('not.exist');
    });
  });

  describe('Drop-In (pinned)', () => {
    const selBubble = '.detail-field';

    it('should display in pinned mode via the keyboard', () => {
      setupUserData();
      cy.get(selDropInPinned).should('not.exist');
      keyOpenPinned();
      cy.get(selDropInPinned).should('exist');
    });

    it('should sort the columns', () => {
      setupUserData();
      keyOpenPinned();
      cy.get(selFirstSuggestion)
        .contains('0')
        .should('exist');
      cy.get('.grid-header:last-child a').click();
      cy.get(selFirstSuggestion)
        .contains('0')
        .should('not.exist');
      cy.get('.grid-header:last-child a').click();
      cy.get(selFirstSuggestion)
        .contains('0')
        .should('exist');
    });

    it('should display in pinned mode via clicking the bubble', () => {
      setupUserData();

      cy.get(selDropInPinned).should('not.exist');
      cy.get(selBubble).should('not.exist');
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selFirstSuggestion).trigger('mouseenter');
      cy.get(selFirstSuggestion).focus();
      cy.get(selBubble).should('exist');
      cy.get(selBubble)
        .first()
        .click(force);
      cy.get(selDropInPinned).should('exist');
    });
  });

  describe('Drop-In (selection)', () => {
    it('should set the value', () => {
      setupUserData();

      cy.get(selectorInputDatasetId).should('have.value', '');
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selFirstSuggestion).click();
      cy.get(selectorInputDatasetId).should('have.value', '0');
    });

    it('should hide when the value is set (keyboard)', () => {
      setupUserData();

      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selDropIn).should('exist');
      cy.get(selFirstSuggestion).focus();
      cy.get(selFirstSuggestion).type('{enter}');
      cy.get(selDropIn).should('not.exist');
    });

    it('should hide when the value is set (click)', () => {
      setupUserData();

      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selFirstSuggestion).click();
      cy.get(selDropIn).should('not.exist');
    });

    it('should hide when the input is blurred', () => {
      setupUserData();

      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selDropIn).should('exist');
      cy.press(Cypress.Keyboard.Keys.TAB);
      cy.get(selDropIn).should('not.exist');
    });

    it('should set the correct caret position', () => {
      // open
      setupUserData();

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

  describe('Drop-In (suggest)', () => {
    it('should be hidden by default', () => {
      setupUserData();
      cy.get(selDropIn).should('not.exist');
    });

    it('should show (all) when the "Escape" key is pressed', () => {
      setupUserData();

      cy.get(selDropIn).should('not.exist');
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selDropIn).should('exist');
    });

    it('should toggle when the "Escape" key is pressed', () => {
      setupUserData();

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
      setupUserData();

      cy.get(selDropIn).should('not.exist');
      cy.get(selectorInputDatasetId).type('11');
      cy.get(selDropIn).should('exist');
    });

    it('should disable the auto-suggest when the field no longer matches', () => {
      setupUserData();
      const matchVal = '11';
      const appendVal = 'aaa11';
      cy.get(selDropIn).should('not.exist');
      cy.get(selectorInputDatasetId).type(matchVal);
      cy.get(selDropIn).should('exist');
      cy.get(selectorInputDatasetId).type(appendVal);
      cy.get(selectorInputDatasetId).should('have.value', matchVal + appendVal);
      cy.get(selDropIn).should('not.exist');

      appendVal.split('').forEach(() => {
        cy.get(selectorInputDatasetId).type('{backspace}');
      });
      cy.get(selDropIn).should('exist');
    });

    it('should warn after a match is broken', () => {
      setupUserData();
      cy.get(selectorInputDatasetId).type('vers');

      cy.get(selDropIn).should('exist');
      cy.get(selDropInError).should('not.exist');

      cy.get(selectorInputDatasetId).type('s');

      cy.get(selDropIn).should('exist');
      cy.get(selDropInError).should('exist');

      cy.get(selectorInputDatasetId).type('{backspace}');

      cy.get(selDropIn).should('exist');
      cy.get(selDropInError).should('not.exist');
    });

    it('should restore the match auto-suggest after a good match', () => {
      setupUserData();
      cy.get(selectorInputDatasetId).type('vers');
      cy.get(selectorInputDatasetId).type('s');
      cy.get(selectorInputDatasetId).type('s');

      cy.get(selDropIn).should('not.exist');
      cy.get(selDropInError).should('not.exist');

      cy.get(selectorInputDatasetId).type('{backspace}');

      cy.get(selDropIn).should('not.exist');
      cy.get(selDropInError).should('not.exist');

      cy.get(selectorInputDatasetId).type('{backspace}');

      cy.get(selDropIn).should('exist');
      cy.get(selDropInError).should('not.exist');
    });

    it('should disable the auto-suggest when escaped', () => {
      setupUserData();

      cy.get(selDropIn).should('not.exist');
      cy.get(selectorInputDatasetId).type('11');
      cy.get(selDropIn).should('exist');
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selDropIn).should('not.exist');
      cy.get(selectorInputDatasetId).type('1');
      cy.get(selectorInputDatasetId).should('have.value', '111');
      cy.get(selDropIn).should('not.exist');
    });

    it('should re-enable the auto-suggest after being escaped', () => {
      setupUserData();

      cy.get(selDropIn).should('not.exist');
      cy.get(selectorInputDatasetId).type('11');
      cy.get(selDropIn).should('exist');
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selDropIn).should('not.exist');
      cy.get(selectorInputDatasetId).type('1');
      cy.get(selectorInputDatasetId).should('have.value', '111');
      cy.get(selDropIn).should('not.exist');

      cy.get(selectorInputDatasetId).clear();
      cy.get(selectorInputDatasetId).type('11');
      cy.get(selDropIn).should('exist');
    });

    it('should not auto-suggest (again) once closed (until cleared)', () => {
      setupUserData();

      cy.get(selectorInputDatasetId).type('11');
      cy.get(selDropIn).should('exist');
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selDropIn).should('not.exist');
      cy.get(selectorInputDatasetId).type('11');
      cy.get(selDropIn).should('not.exist');

      cy.get(selectorInputDatasetId).clear(); // type('{backspace}');
      cy.get(selectorInputDatasetId).type('11');
      cy.get(selDropIn).should('exist');
    });

    it('should highlight matches', () => {
      setupUserData();
      keyOpenPinned();

      const selHighlight = '.term-highlight';
      cy.get(selHighlight).should('not.exist');
      cy.get(selectorInputDatasetId).type('niv');
      cy.get(selHighlight).should('exist');
    });

    it('should show when names match', () => {
      setupUserData();

      cy.get(selDropIn).should('not.exist');
      cy.get(selectorInputDatasetId).type('niv');
      cy.get(selDropIn).should('exist');

      cy.get(selFirstSuggestion)
        .contains('0')
        .filter(':visible')
        .should('exist');

      cy.get(selectorInputDatasetId)
        .clear()
        .type('oo');

      cy.get(selFirstSuggestion)
        .contains('1')
        .filter(':visible')
        .should('exist');

      cy.get(selectorInputDatasetId)
        .clear()
        .type('eum');

      cy.get(selFirstSuggestion)
        .contains('2')
        .filter(':visible')
        .should('exist');
    });

    it('should show when the opener is clicked', () => {
      const selOpener = '.drop-in-opener';
      cy.get(selOpener).should('not.exist');

      setupUserData();
      cy.get(selOpener).should('exist');

      cy.get(selDropIn).should('not.exist');
      cy.get(selOpener).click(force);
      cy.get(selDropIn).should('exist');
      cy.get(selOpener).click(force);
      cy.get(selDropIn).should('not.exist');
    });

    it('should suspend field and form validation when open', () => {
      setupUserData();
      const selectorFieldErrors = '.field-errors';

      cy.get(selectorBtnSubmitProgress).should('be.disabled');
      cy.get(selectorFieldErrors).should('not.exist');

      cy.get(selectorInputDatasetId).type('1');

      cy.get(selectorBtnSubmitProgress).should('not.be.disabled');
      cy.get(selectorFieldErrors).should('not.exist');

      cy.get(selectorInputDatasetId)
        .clear()
        .type('a');

      cy.get(selectorBtnSubmitProgress).should('be.disabled');
      cy.get(selectorFieldErrors).should('exist');

      // open menu
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.wait(1);

      cy.get(selectorBtnSubmitProgress).should('be.disabled');
      cy.get(selectorFieldErrors).should('not.exist');

      // close menu
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.wait(1);
      cy.get(selectorFieldErrors).should('exist');
    });
  });
});
