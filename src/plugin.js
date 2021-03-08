const resourcesProviderPlugin = require('./resources-provider');

function SkyUXPlugin() {

  const preload = (content, resourcePath) => {
    let modified = content.toString();
    modified = resourcesProviderPlugin.preload(modified, resourcePath);
    return Buffer.from(modified, 'utf8');
  };

  return Object.freeze({
    preload
  });
}

module.exports = {
  SkyUXPlugin
};
