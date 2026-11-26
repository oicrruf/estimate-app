const port = Number(process.env.AT278_PREVIEW_PORT ?? '8001');

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('AT278_PREVIEW_PORT must be a valid TCP port');
}

module.exports = {
  '/v1/demo': {
    target: `http://127.0.0.1:${port}`,
    secure: false,
    changeOrigin: false,
  },
};
