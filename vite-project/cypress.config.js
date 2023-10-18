import { defineConfig } from 'cypress';

export default defineConfig({
  defaultCommandTimeout: 8000,
  requestTimeout: 10000,
  chromeWebSecurity: false,
  env: {
    API_URL: 'http://localhost:5000/v1'
  },
  reporter: 'junit',
  reporterOptions: {
    mochaFile: 'junit-cypress.xml',
    toConsole: false
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.ts')(on, config);
    },
    specPattern: 'cypress/e2e/**/*.spec.{js,ts,jsx,tsx}',
    baseUrl: 'http://localhost:8080',
    supportFile: 'cypress/support/e2e.ts'
  }
});