import * as profileData from '../fixtures/user-profile.json';
import * as teamData from '../fixtures/user-team.json';
import * as integrationsData from '../fixtures/user-integrations.json';
import * as plansData from '../fixtures/billing-plans.json';

Cypress.Commands.add('login', ({ planName = 'Free', features = {} } = {}) => {
  cy.intercept('GET', `${Cypress.env('API_URL')}/auth/refresh_token`, {
    statusCode: 203,
    headers: {
      Authorization: 'bearer faketoken',
      'Access-Control-Allow-Origin': window.location.origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Expose-Headers': 'Authorization'
    }
  }).as('refreshToken');

  cy.intercept('GET', `${Cypress.env('API_URL')}/user/profile`, {
    body: {
      user: {
        ...profileData.user,

        subscription_will_renew: true,
        subscription_active: true,
        subscription: {
          plan: {
            name: planName
          }
        },

        features: {
          ...profileData.user.features,
          ...Object.keys(features).reduce(
            (result, key) => ({
              ...result,
              [key]: {
                enabled: features[key]
              }
            }),
            {}
          )
        }
      }
    }
  }).as('fetchProfile');

  cy.intercept('GET', `${Cypress.env('API_URL')}/user/team`, {
    body: teamData
  }).as('fetchTeam');

  cy.intercept('GET', `${Cypress.env('API_URL')}/user/integrations`, {
    body: integrationsData
  }).as('fetchIntegrations');

  cy.intercept('POST', `${Cypress.env('API_URL')}/observability/metrics`, {
    body: {}
  }).as('pushMetrics');

  return cy
    .intercept('GET', `${Cypress.env('API_URL')}/billing/plans`, {
      body: plansData
    })
    .as('fetchPlans');
});

Cypress.Commands.add('getByTarget', (selector, ...args) => {
  return cy.get(`[data-testid="${selector}"]`, ...args);
});