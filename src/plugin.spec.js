const mock = require('mock-require');

describe('Plugin', function () {
  let mockResourcesProvider;

  beforeEach(() => {
    mockResourcesProvider = {
      preload: (content) => content
    };

    mock('./resources-provider', mockResourcesProvider);
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should export a Builder preload hook', function () {
    const obj = mock.reRequire('./plugin');
    const plugin = new obj.SkyUXPlugin();
    expect(typeof plugin.preload).toEqual('function');
  });

  describe('Builder plugins', function () {
    it('should run the resources plugin', function () {
      const resourcesProviderSpy = spyOn(mockResourcesProvider, 'preload').and.callThrough();

      const obj = mock.reRequire('./plugin');
      const plugin = new obj.SkyUXPlugin();

      const buffer = Buffer.from('foobar', 'utf8');
      const resourcePath = '/resource-path';

      plugin.preload(buffer, resourcePath, {
        runtime: {
          command: 'serve'
        }
      });

      expect(resourcesProviderSpy).toHaveBeenCalledWith(buffer.toString(), resourcePath);
    });
  });
});
