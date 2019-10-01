const documentationGenerator = require('./documentation-generator');
const resourcesProviderPlugin = require('./resources-provider');
const sourceCodeProviderPlugin = require('./source-code-provider');
const typeDocJsonProviderPlugin = require('./typedoc-json-provider');

function SkyUXPlugin() {

  const preload = (content, resourcePath) => {
    let modified = content.toString();
    modified = resourcesProviderPlugin.preload(modified, resourcePath);
    modified = sourceCodeProviderPlugin.preload(modified, resourcePath);
    modified = typeDocJsonProviderPlugin.preload(modified, resourcePath);

    return Buffer.from(modified, 'utf8');
  };

  const runCommand = (command) => {
    if (
      command === 'test' ||
      command === 'watch'
    ) {
      return;
    }

    documentationGenerator.generateDocumentationFiles();
  }

  return Object.freeze({
    preload,
    runCommand
  });
}

module.exports = {
  SkyUXPlugin
};
