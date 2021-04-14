const http = require('http');
const log = require('loglevel');

const app = require('./app');

const LOG_LEVEL = typeof process.env.LOG_LEVEL !== 'undefined' ? process.env.LOG_LEVEL : 'INFO';

log.setLevel(LOG_LEVEL);

const server = http.createServer(app);

server.on('listening', () => {
  const address = server.address();
  log.info(`Server listening on http://${address.address}:${address.port} ...`);
});

server.on('error', (err) => {
  log.error(err);
  process.exit(1);
});

['SIGINT', 'SIGTERM', 'SIGUSR2'].forEach((signal) => {
  process.on(signal, () => {
    log.info('Server shutting down...')
    process.exit(0);
  });
});

server.listen({
  host: '0.0.0.0',
  port: 3001,
});
