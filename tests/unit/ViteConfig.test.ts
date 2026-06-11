/**
 * @jest-environment node
 */

const loadViteConfig = () => {
  jest.resetModules();
  return require('../../vite.config').default;
};

describe('Vite API proxy configuration', () => {
  const originalApiPort = process.env.API_PORT;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();

    if (originalApiPort === undefined) {
      delete process.env.API_PORT;
    } else {
      process.env.API_PORT = originalApiPort;
    }
  });

  it('defaults the API proxy target to port 3001', () => {
    delete process.env.API_PORT;

    const config = loadViteConfig();

    expect(config.server.proxy['/api'].target).toBe('http://localhost:3001');
  });

  it('uses API_PORT for the API proxy target when configured', () => {
    process.env.API_PORT = '38988';

    const config = loadViteConfig();

    expect(config.server.proxy['/api'].target).toBe('http://localhost:38988');
  });
});
