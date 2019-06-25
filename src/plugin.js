const logger = require('@blackbaud/skyux-logger');
const rimraf = require('rimraf');
const TypeDoc = require('typedoc');

const resourcesProviderPlugin = require('./resources-provider');
const sourceCodeProviderPlugin = require('./source-code-provider');
const typeDocJsonProviderPlugin = require('./typedoc-json-provider');

const outputDir = '.skypagesdocs';

function removeDocumentationFiles() {
  rimraf.sync(outputDir);
}

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

    logger.info('Generating documentation...');

    removeDocumentationFiles();

    const app = new TypeDoc.Application({
      exclude: [
        'node_modules',
        '**/fixtures/**',
        '**/*.spec.ts',
        '**/plugin-resources/**',
        '**/code-examples/**'
      ],
      excludeExternals: true,
      excludeNotExported: true,
      excludePrivate: true,
      excludeProtected: true,
      experimentalDecorators: true,
      logger: 'none',
      mode: 'file',
      module: 'CommonJS',
      target: 'ES5'
    });

    const project = app.convert(
      app.expandInputFiles([
        'src/app/public'
      ])
    );

    if (project) {
      app.generateJson(project, `${outputDir}/documentation.json`);
      logger.info('Done.');
    } else {
      logger.warn('Something bad happened.');
    }

    process.on('exit', () => {
      removeDocumentationFiles();
    });
  }

  return Object.freeze({
    preload,
    runCommand
  });
}

module.exports = {
  SkyUXPlugin
};
