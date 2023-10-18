describe('Settings - Account - Profile', () => {
    beforeEach(() => {
      cy.login({
        features: {
          speaker_enrolment: true,
          speaker_suggestions: true,
          language_selection: true
        }
      });
  
      cy.visit('/settings/profile');
      cy.wait(['@refreshToken', '@fetchPlans', '@fetchTeam', '@fetchProfile']);
    });
  
    it('renders language label', () => {
      cy.getByTarget('Account - Profile - Language Label').contains('Language');
    });
  
    it('display the correct language options', () => {
      cy.getByTarget('Account - Profile - Language Select').click();
      cy.getByTarget('Account - Profile - Language Select').contains('English');
      cy.getByTarget('Account - Profile - Language Select').contains('French');
    });
  });