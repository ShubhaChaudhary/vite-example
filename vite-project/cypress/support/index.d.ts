declare namespace Cypress {
    interface Chainable<Subject> {
      /** Fake the app being logged in, with specific features enabled or disabled. */
      login(options?: {
        planName?: string;
        features?: Record<string, boolean>;
      }): Chainable<any>;
  
      /** Select an element by the data-testid attribute. */
      getByTarget(selector: string, ...args: any[]): Chainable<any>;
    }
  }