const mock = require('mock-require');

describe('Plugin', () => {
  let mockFsExtra;
  let mockGlob;
  let Plugin;

  const defaultContent = `export class SkySampleResourcesProvider implements SkyLibResourcesProvider`;

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

    Plugin = mock.reRequire('./plugin').SkyUXPlugin;
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should contain a preload hook', () => {
    const plugin = new Plugin();
    expect(plugin.preload).toBeDefined();
  });

  it('should inject contents of resource files', () => {
    const plugin = new Plugin();
    const content = Buffer.from(defaultContent, 'utf8');
    const modified = plugin.preload(content);

    expect(modified).toContain(`{"en_US":{"greeting":"hello"},"fr_CA":{"greeting":"bonjour"}}`);
  });

  it('should populate the `getString` method', () => {
    const plugin = new Plugin();
    const content = Buffer.from(`
export class SkySampleResourcesProvider implements SkyLibResourcesProvider {
  public getString: () => string;
}
`, 'utf8');
    const modified = plugin.preload(content);

    expect(modified).toContain(`public getString(localeInfo: SkyAppLocaleInfo, name: string): string {`);
  });

  it('should handle empty resources files', () => {
    spyOn(mockGlob, 'sync').and.returnValue(['resources_en_US.json']);
    spyOn(mockFsExtra, 'readFileSync').and.returnValue('');

    const plugin = new Plugin();
    const content = Buffer.from(defaultContent, 'utf8');
    const modified = plugin.preload(content);

    expect(modified).toContain(`{"en_US":{}}`);
  });

  it('should not alter content if default resource file does not exist', () => {
    spyOn(mockGlob, 'sync').and.returnValue(['resources_foo_BAR.json']);

    const plugin = new Plugin();
    const content = Buffer.from(defaultContent, 'utf8');
    const modified = plugin.preload(content);

    expect(content).toEqual(modified);
  });

  it('should not alter content if class name does not match', () => {
    const plugin = new Plugin();
    const content = Buffer.from(`export class FooBar {}`, 'utf8');
    const modified = plugin.preload(content);

    expect(content).toEqual(modified);
  });
});
