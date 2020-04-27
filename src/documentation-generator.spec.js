const path = require('path');
const mock = require('mock-require');

describe('Documentation generator', function () {
  let mockApplication;
  let mockFsExtra;
  let mockLogger;
  let mockRimraf;
  let mockTypes;

  let originalProcessOn;
  let processEvents;

  function triggerProcessOn(eventName) {
    processEvents[eventName].forEach(listener => listener());
  }

  beforeEach(function () {
    mockApplication = {
      bootstrap() {},
      convert() {
        return {
          children: mockTypes
        };
      },
      expandInputFiles() {},
      generateJson() {}
    };

    mockLogger = {
      info() {},
      warn() {}
    };

    mockRimraf = {
      sync() {}
    };

    mockTypes = [];

    mockFsExtra = {
      readJsonSync() {
        return {
          children: mockTypes
        };
      },
      writeJsonSync() {}
    };

    mock('typedoc', {
      Application: function () {
        return mockApplication;
      }
    });

    mock('rimraf', mockRimraf);

    mock('@blackbaud/skyux-logger', mockLogger);

    mock('fs-extra', mockFsExtra);

    processEvents = {};
    originalProcessOn = process.on;
    Object.defineProperty(process, 'on', {
      value: (eventName, callback) => {
        processEvents[eventName] = processEvents[eventName] || [];
        processEvents[eventName].push(callback);
      },
      writable: true
    });

    spyOn(process, 'exit').and.callFake(() => triggerProcessOn('exit'));
  });

  afterEach(() => {
    mock.stopAll();
    Object.defineProperty(process, 'on', {
      value: originalProcessOn
    });
  });

  it('should generate docs from src/app/public', function () {
    const expandSpy = spyOn(mockApplication, 'expandInputFiles').and.callThrough();
    const generateSpy = spyOn(mockApplication, 'generateJson').and.callThrough();

    const generator = mock.reRequire('./documentation-generator');
    generator.generateDocumentationFiles();

    expect(expandSpy).toHaveBeenCalledWith(['src/app/public']);
    expect(generateSpy).toHaveBeenCalledWith({ children: [] }, path.join(generator.outputDir, 'documentation.json'));
  });

  it('should remove any types or properties marked with `@internal` tag', function () {
    mockTypes = [
      {
        name: 'FooType',
        kindString: 'Class',
        comment: {
          tags: [
            {
              tagName: 'internal'
            }
          ]
        }
      },
      {
        name: 'BarType',
        kindString: 'Class',
        comment: {
          tags: [
            {
              tagName: 'example'
            }
          ]
        }
      },
      {
        name: 'BazType',
        kindString: 'Enumeration',
        comment: {
          shortText: 'This is the comment.'
        },
        children: [
          {
            name: 'internalProperty',
            comment: {
              tags: [
                {
                  tagName: 'internal'
                }
              ]
            }
          }
        ]
      }
    ];

    const generateSpy = spyOn(mockApplication, 'generateJson').and.callThrough();

    const generator = mock.reRequire('./documentation-generator');
    generator.generateDocumentationFiles();

    expect(generateSpy).toHaveBeenCalledWith({
      children: [
        {
          name: 'BarType',
          kindString: 'Class',
          comment: {
            tags: [
              {
                tagName: 'example'
              }
            ]
          },
          anchorId: 'class-bartype'
        },
        {
          name: 'BazType',
          kindString: 'Enumeration',
          comment: {
            shortText: 'This is the comment.'
          },
          anchorId: 'enumeration-baztype',
          children: []
        }
      ]
    }, path.join(generator.outputDir, 'documentation.json'));
  });

  it('should generate anchor IDs for each type', function () {
    mockTypes = [
      {
        name: 'FooDirective',
        kindString: 'Directive'
      },
      {
        name: 'FooService',
        kindString: 'Injectable'
      },
      {
        name: 'FooType',
        kindString: 'Enumeration'
      },
      {
        name: '',
        kindString: 'TypeAlias'
      }
    ];

    const generateSpy = spyOn(mockApplication, 'generateJson').and.callThrough();

    const generator = mock.reRequire('./documentation-generator');
    generator.generateDocumentationFiles();

    expect(generateSpy).toHaveBeenCalledWith({
      children: [
        {
          name: 'FooDirective',
          kindString: 'Directive',
          anchorId: 'directive-foodirective'
        },
        {
          name: 'FooService',
          kindString: 'Injectable',
          anchorId: 'injectable-fooservice'
        },
        {
          name: 'FooType',
          kindString: 'Enumeration',
          anchorId: 'enumeration-footype'
        },
        {
          name: '',
          kindString: 'TypeAlias',
          anchorId: 'typealias-undefined'
        }
      ]
    }, path.join(generator.outputDir, 'documentation.json'));
  });

  it('should ignore anchor IDs for variables', function () {
    mockTypes = [
      {
        name: 'moment',
        kindString: 'Variable'
      }
    ];

    const jsonSpy = spyOn(mockFsExtra, 'writeJsonSync').and.callThrough();

    const generator = mock.reRequire('./documentation-generator');
    generator.generateDocumentationFiles();

    expect(jsonSpy.calls.mostRecent().args[1].anchorIds).toEqual({});
  });

  it('should warn if project generation fails', function () {
    spyOn(mockApplication, 'convert').and.returnValue(undefined);

    const loggerSpy = spyOn(mockLogger, 'warn').and.callThrough();
    const generator = mock.reRequire('./documentation-generator');
    generator.generateDocumentationFiles();

    expect(loggerSpy).toHaveBeenCalledWith('TypeDoc project generation failed.');
  });

  it('should remove temp files when the process exits', () => {
    const spy = spyOn(mockRimraf, 'sync').and.callThrough();
    const generator = mock.reRequire('./documentation-generator');
    generator.generateDocumentationFiles();

    triggerProcessOn('SIGINT');

    expect(spy).toHaveBeenCalledWith(generator.outputDir);
  });
});
