import express from 'express';
import * as http from 'http';
import path from 'path';
import { MsTeamsApiRouter, MsTeamsPageRouter } from 'express-msteams-host';
import compression from 'compression';
import { logger, logHandler } from './lib/logger';
import { configureHoneybadger } from './lib/error';
import Honeybadger = require('@honeybadger-io/js');
import promBundle = require('express-prom-bundle');

configureHoneybadger();
const metricsMiddleware = promBundle({
  includePath: true,
  promClient: {
    collectDefaultMetrics: {}
  }
});

logger.info('Initializing Microsoft Teams Express hosted App...');
logger.info(`Running using ${process.env.ENV} environment ...`);

require('dotenv-safe').config();

import swaggerDocs from './utils/swagger';
const errors = [400, 401, 404, 500, 503];

// The import of components has to be done AFTER the dotenv config
import * as allComponents from './TeamsAppsComponents';
import { routes } from './routes/routes';

export const createServer = () => {
  // Create the Express webserver
  const app = express();
  const port = process.env.port || process.env.PORT || 3007;

  // Honeybadger request handler must be configured before all other middleware
  app.use(Honeybadger.requestHandler);

  // Adding prometheus exporter
  app.use(metricsMiddleware);

  // Inject the raw request body onto the request object
  app.use(
    express.json({
      verify: (req, res, buf: Buffer): void => {
        (req as any).rawBody = buf.toString();
      }
    })
  );
  app.use(express.urlencoded({ extended: true }));

  // Express configuration
  app.set('views', path.join(__dirname, '/'));

  // Use pino logger for express logs - This needs to be before route initialisation
  app.use(logHandler);

  // Add compression - uncomment to remove compression
  app.use(compression());

  // Add /scripts and /assets as static folders
  // express.use('/scripts', Express.static(path.join(__dirname, 'web/scripts')));
  // express.use('/assets', Express.static(path.join(__dirname, 'web/assets')));

  // routing for bots, connectors and incoming web hooks - based on the decorators
  // For more information see: https://www.npmjs.com/package/express-msteams-host
  app.use(MsTeamsApiRouter(allComponents));

  // routing for pages for tabs and connector configuration
  // For more information see: https://www.npmjs.com/package/express-msteams-host
  app.use(
    MsTeamsPageRouter({
      root: path.join(__dirname, 'web/'),
      components: allComponents
    })
  );

  // Set api routes
  routes(app);

  // Honeybadger error handler must be configured after all other middleware
  app.use(Honeybadger.errorHandler);

  errors.forEach((responseCode: number) => {
    app.get(`/errors/${responseCode}`, (request, response) => {
      response.send(responseCode);
    });
  });

  // Set the port
  app.set('port', port);

  const server: http.Server = http.createServer(app).listen(port, async () => {
    logger.info(
      `App is running at http://${process.env.PUBLIC_HOSTNAME}:${port}`
    );
    await swaggerDocs(app);
  });

  return { app, server };
};

export const terminateServer = (server: http.Server) => {
  server.close();
};