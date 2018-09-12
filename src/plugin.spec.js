const mock = require('mock-require');

describe('Plugin', () => {
  let mockFsExtra;
  let Plugin;

  beforeEach(() => {
    mockFsExtra = {
      pathExistsSync: () => {
        return true;
      },
      readFileSync: () => {
        return '';
      }
    };

    mock('fs-extra', mockFsExtra);

    Plugin = mock.reRequire('./plugin').SkyUXPlugin;
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should contain a preload hook', () => {
    const plugin = new Plugin();
    expect(plugin.preload).toBeDefined();
  });

  it('should replace resource imports with contents', () => {
    const spy = spyOn(mockFsExtra, 'readFileSync').and.returnValue(`{foo:'bar'}`);
    const plugin = new Plugin();
    const content = Buffer.from(`require('!json-loader!.skypageslocales/resources_en_US.json')`, 'utf8');
    const result = plugin.preload(content);

    expect(result.toString()).toEqual(`{foo:'bar'}`);
    expect(spy).toHaveBeenCalled();
  });

  it('should not alter content if resource file does not exist', () => {
    const spy = spyOn(mockFsExtra, 'readFileSync').and.callThrough();

    spyOn(mockFsExtra, 'pathExistsSync').and.returnValue(false);

    const plugin = new Plugin();
    const content = Buffer.from('Content');
    const result = plugin.preload(content);

    expect(result.toString()).toEqual('Content');
    expect(spy).not.toHaveBeenCalled();
  });

  it('should not alter content if import pattern not found', () => {
    const spy = spyOn(mockFsExtra, 'readFileSync').and.callThrough();

    spyOn(mockFsExtra, 'pathExistsSync').and.returnValue(true);

    const plugin = new Plugin();
    const content = Buffer.from('Content');
    const result = plugin.preload(content);

    expect(result.toString()).toEqual('Content');
    expect(spy).toHaveBeenCalled();
  });
});
