const mock = require('mock-require');

describe('Utils', () => {
  let resources;

  beforeEach(() => {
    resources = {
      'EN-US': {
        'foo': 'bar'
      }
    };
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should return a string paired to a key', () => {
    const utils = mock.reRequire('./utils');
    const result = utils.getString(resources, 'EN-US', 'foo');
    expect(result).toEqual('bar');
  });

  it('should return a default string if locale not supported', () => {
    const utils = mock.reRequire('./utils');
    const result = utils.getString(resources, 'FR-CA', 'foo');
    expect(result).toEqual('bar');
  });

  it('should return an empty string if the key does not exist', () => {
    const utils = mock.reRequire('./utils');
    const result = utils.getString(resources, 'EN-US', 'invalid');
    expect(result).toEqual('');
  });
});
