const mock = require('mock-require');
const path = require('path');

describe('Resources provider', () => {
  let mockFsExtra;
  let mockGlob;

  const defaultContent = 'export class SkySampleResourcesProvider implements SkyLibResourcesProvider';
  const defaultResourcePath = path.join('src', 'app', 'public', 'plugin-resources', 'foo-resources-provider.ts');

  beforeEach(() => {
    mockFsExtra = {
      ensureFileSync: () => {
        return true;
      },
      pathExistsSync: () => {
        return true;
      },
      readFileSync: (file) => {
        let json;

        switch (file) {
          case 'resources_en_US.json':
            json = {
              greeting: {
                message: 'hello'
              }
            };
          break;
          case 'resources_fr_CA.json':
            json = {
              greeting: {
                message: 'bonjour'
              }
            };
          break;
          default:
            json = {};
          break;
        }

        return JSON.stringify(json);
      }
    };

    mockGlob = {
      sync: () => {
        return [
          'resources_en_US.json',
          'resources_fr_CA.json'
        ];
      }
    };

    mock('fs-extra', mockFsExtra);
    mock('glob', mockGlob);
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should contain a preload hook', () => {
    const plugin = mock.reRequire('./resources-provider');
    expect(plugin.preload).toBeDefined();
  });

  it('should inject contents of resource files', () => {
    const content = Buffer.from(defaultContent, 'utf8');

    const plugin = mock.reRequire('./resources-provider');
    const modified = plugin.preload(content, defaultResourcePath);

    expect(modified).toContain(`{"EN-US":{"greeting":"hello"},"FR-CA":{"greeting":"bonjour"}}`);
  });

  it('should handle files located in .skypagestmp directory', () => {
    const resourcePath = path.join('.skypagestmp', 'plugin-resources', 'foo-resources-provider.ts');
    const content = Buffer.from(defaultContent, 'utf8');

    const plugin = mock.reRequire('./resources-provider');
    const modified = plugin.preload(content, resourcePath);

    expect(modified).toContain(`{"EN-US":{"greeting":"hello"},"FR-CA":{"greeting":"bonjour"}}`);
  });

  it('should populate the `getString` method', () => {
    const content = Buffer.from(`
export class SkySampleResourcesProvider implements SkyLibResourcesProvider {
  public getString: () => string;
}
`, 'utf8');
    const plugin = mock.reRequire('./resources-provider');
    const modified = plugin.preload(content, defaultResourcePath);

    expect(modified).toContain(`public getString(localeInfo: SkyAppLocaleInfo, name: string): string {`);
  });

  it('should handle empty resources files', () => {
    spyOn(mockGlob, 'sync').and.returnValue(['resources_en_US.json']);
    spyOn(mockFsExtra, 'readFileSync').and.returnValue('');

    const content = Buffer.from(defaultContent, 'utf8');
    const plugin = mock.reRequire('./resources-provider');
    const modified = plugin.preload(content, defaultResourcePath);

    expect(modified).toContain(`{"EN-US":{}}`);
  });

  it('should not alter content if default resource file does not exist', () => {
    spyOn(mockGlob, 'sync').and.returnValue(['resources_foo_BAR.json']);

    const content = Buffer.from(defaultContent, 'utf8');
    const plugin = mock.reRequire('./resources-provider');
    const modified = plugin.preload(content, defaultResourcePath);

    expect(content).toEqual(modified);
  });

  it('should not alter content if file not in correct directory', () => {
    const content = Buffer.from(`export class FooBar {}`, 'utf8');
    const plugin = mock.reRequire('./resources-provider');
    const modified = plugin.preload(content, 'foo.txt');

    expect(content).toEqual(modified);
  });

  it('should not alter content if file is not named correctly', () => {
    const content = Buffer.from(`export class FooBar {}`, 'utf8');
    const resourcePath = path.join('src', 'app', 'public', 'plugin-resources', 'foo.text');

    const plugin = mock.reRequire('./resources-provider');
    const modified = plugin.preload(content, resourcePath);

    expect(content).toEqual(modified);
  });

  it('should resolve resource paths', () => {
    const content = Buffer.from(defaultContent, 'utf8');
    const spy = spyOn(path, 'resolve').and.callThrough();

    const plugin = mock.reRequire('./resources-provider');
    plugin.preload(content, defaultResourcePath);

    expect(spy).toHaveBeenCalledWith(defaultResourcePath);
  });
});
