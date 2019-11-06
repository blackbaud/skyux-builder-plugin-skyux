const logger = require('@blackbaud/skyux-logger');

const documentationGenerator = require('./documentation-generator');
const documentationProvidersPlugin = require('./documentation-providers');
const resourcesProviderPlugin = require('./resources-provider');
const sourceCodeProviderPlugin = require('./source-code-provider');
const typeDocJsonProviderPlugin = require('./typedoc-json-provider');
const utils = require('./utils');

function SkyUXPlugin() {
  const isDevelopment = process.cwd().indexOf('skyux-docs-tools') > -1;

  // Warn the user if `@skyux/docs-tools` is not installed.
  let doGenerateDocs = false;
  if (isDevelopment) {
    doGenerateDocs = true;
  } else {
    try {
      utils.resolveModule('@skyux/docs-tools');
      doGenerateDocs = true;
    } catch (e) {
      logger.warn(
        '[WARNING] Documentation will not be generated for this library because the required NPM package `@skyux/docs-tools` was not found. ' +
        'Please install it as a development dependency: `npm i --save-exact --save-dev @skyux/docs-tools`.'
      );
    }
  }

  const preload = (content, resourcePath, config) => {
    let modified = content.toString();

    modified = resourcesProviderPlugin.preload(modified, resourcePath);

    switch (config.runtime.command) {
      case 'serve':
      case 'build':
        if (doGenerateDocs) {
          modified = sourceCodeProviderPlugin.preload(modified, resourcePath);
          modified = typeDocJsonProviderPlugin.preload(modified, resourcePath);
          modified = documentationProvidersPlugin.preload(modified, resourcePath);
        }
        break;
      default:
        break;
    }

    return Buffer.from(modified, 'utf8');
  };

  const runCommand = (command) => {
    switch (command) {
      case 'serve':
      case 'build':
        if (doGenerateDocs) {
          documentationGenerator.generateDocumentationFiles();
        }
        break;
      default:
        break;
    }
  }

  return Object.freeze({
    preload,
    runCommand
  });
}

module.exports = {
  SkyUXPlugin
};
