import { cleanupUser, setupUser } from '../support/helpers';

context('metis-ui', () => {
  const selFitnessOps = '[formcontrolname=publicationFitness]';
  const selForm = '.metis-form';
  const selPermanentFields = [
    '#dataset-name',
    '#provider',
    '#data-provider',
    '#intermediate-provider',
    '#replaces',
    '#replaced-by',
    '#country',
    '#language',
    '#description',
    '#notes'
  ];

  describe('Dataset Form', () => {
    beforeEach(() => {
      cy.server();
      setupUser();
    });

    afterEach(() => {
      cleanupUser();
    });

    describe('Create New', () => {
      beforeEach(() => {
        cy.visit('/dataset/new');
      });

      it('should show the form', () => {
        cy.get(selForm).should('have.length', 1);
      });

      it('should show the correct fields', () => {
        selPermanentFields.forEach((sel: string) => {
          cy.get(sel).should('have.length', 1);
        });
      });

      it('should not show the fitness options', () => {
        cy.get(selFitnessOps).should('have.length', 0);
      });
    });

    describe('Edit Existing', () => {
      const checkFormField = (name: string, value: string): void => {
        const label = cy.get('.form-group label').contains(name);
        const input = label.closest('.form-group').find('input');
        input.should('have.value', value);
      };

      const checkStaticField = (name: string, value: string): void => {
        const label = cy.get('.form-group label').contains(name);
        const input = label.closest('.form-group').find('span');
        input.contains(value);
      };

      beforeEach(() => {
        cy.visit('/dataset/edit/0');
      });

      it('should show the form', () => {
        cy.get(selForm).should('have.length', 1);
      });

      it('should show the correct fields', () => {
        selPermanentFields.forEach((sel: string) => {
          cy.get(sel).should('have.length', 1);
        });
      });

      it('should show the fitness options', () => {
        cy.get(selFitnessOps).should('have.length', 3);
      });

      it('should show the field data', () => {
        checkFormField('Dataset Name', 'Dataset_1');
        checkFormField('Provider', 'Europeana Provider');
        checkStaticField('Date Created', '19/02/2019 - 08:36');
        checkStaticField('Created by', '123');
        checkStaticField('Last published', '19/02/2019 - 08:49');
        checkStaticField('Number of items published', '865');
        checkStaticField('Last date of harvest', '19/02/2019 - 08:41');
        checkStaticField('Number of items harvested', '879');
      });
    });
  });
});
