const mock = require('mock-require');

describe('Plugin', function () {
  let mockDocumentationGenerator;
  let mockResourcesProvider;
  let mockSourceCodeProvider;
  let mockTypeDocJsonProvider;

  beforeEach(() => {
    mockDocumentationGenerator = {
      generateDocumentationFiles() {}
    };
    mockResourcesProvider = {
      preload: (content) => content
    };
    mockSourceCodeProvider = {
      preload: (content) => content
    };
    mockTypeDocJsonProvider = {
      preload: (content) => content
    };

    mock('./documentation-generator', mockDocumentationGenerator);
    mock('./resources-provider', mockResourcesProvider);
    mock('./source-code-provider', mockSourceCodeProvider);
    mock('./typedoc-json-provider', mockTypeDocJsonProvider);
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should export a Builder preload hook', function () {
    const obj = mock.reRequire('./plugin');
    const plugin = new obj.SkyUXPlugin();
    expect(typeof plugin.preload).toEqual('function');
  });

  it('should export a CLI callback', function () {
    const obj = mock.reRequire('./plugin');
    const plugin = new obj.SkyUXPlugin();
    expect(typeof plugin.runCommand).toEqual('function');
  });

  it('should run all Builder plugins', function () {
    const resourcesProviderSpy = spyOn(mockResourcesProvider, 'preload').and.callThrough();
    const sourceCodeProviderSpy = spyOn(mockSourceCodeProvider, 'preload').and.callThrough();
    const typeDocJsonProviderSpy = spyOn(mockTypeDocJsonProvider, 'preload').and.callThrough();

    const obj = mock.reRequire('./plugin');
    const plugin = new obj.SkyUXPlugin();

    const buffer = Buffer.from('foobar', 'utf8');
    const resourcePath = '/resource-path';

    plugin.preload(buffer, resourcePath);

    expect(resourcesProviderSpy).toHaveBeenCalledWith(buffer.toString(), resourcePath);
    expect(sourceCodeProviderSpy).toHaveBeenCalledWith(buffer.toString(), resourcePath);
    expect(typeDocJsonProviderSpy).toHaveBeenCalledWith(buffer.toString(), resourcePath);
  });

  it('should run all CLI plugins', function () {
    const documentationGeneratorSpy = spyOn(mockDocumentationGenerator, 'generateDocumentationFiles').and.callThrough();

    const obj = mock.reRequire('./plugin');
    const plugin = new obj.SkyUXPlugin();

    plugin.runCommand('serve');

    expect(documentationGeneratorSpy).toHaveBeenCalled();
  });

  it('should not run CLI plugin during tests', function () {
    const documentationGeneratorSpy = spyOn(mockDocumentationGenerator, 'generateDocumentationFiles').and.callThrough();

    const obj = mock.reRequire('./plugin');
    const plugin = new obj.SkyUXPlugin();

    plugin.runCommand('test');
    plugin.runCommand('watch');

    expect(documentationGeneratorSpy).not.toHaveBeenCalled();
  });
});