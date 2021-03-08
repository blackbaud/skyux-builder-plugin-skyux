const logger = require('@blackbaud/skyux-logger');
const crossSpawn = require('cross-spawn');

const documentationGenerator = require('./documentation-generator');
const documentationProvidersPlugin = require('./documentation-providers');
const resourcesProviderPlugin = require('./resources-provider');
const sourceCodeProviderPlugin = require('./source-code-provider');
const typeDocJsonProviderPlugin = require('./typedoc-json-provider');
const utils = require('./utils');

function warnMissingPackage() {
  logger.warn(
    'This library will not generate documentation because it does not include the optional `@skyux/docs-tools` NPM package. To generate documentation, please install the package as a development dependency: `npm i --save-exact --save-dev @skyux/docs-tools@latest`.'
  );
}

function installDependencies() {
  if (utils.resolveModule('typedoc')) {
    logger.info('TypeDoc package found in node_modules. Skipping installation.');
  } else {
    logger.info('Installing required documentation dependencies... Please wait.');
    crossSpawn.sync(
      'npm',
      [
        'install', '--no-save',
        'typedoc@0.20'
      ],
      {
        stdio: 'pipe'
      }
    );
    logger.info('Done installing documentation dependencies.');
  }
}

function SkyUXPlugin() {

  const docsToolsInstalled = !!(utils.resolveModule('@skyux/docs-tools'));

  const preload = (content, resourcePath, config) => {
    let modified = content.toString();

    modified = resourcesProviderPlugin.preload(modified, resourcePath);

    switch (config.runtime.command) {
      case 'serve':
      case 'build':
        if (docsToolsInstalled) {
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
        if (docsToolsInstalled) {
          installDependencies();
          documentationGenerator.generateDocumentationFiles();
        } else {
          warnMissingPackage();
        }
        break;
      default:
        break;
    }
  };

  return Object.freeze({
    preload,
    runCommand
  });
}

module.exports = {
  SkyUXPlugin
};
