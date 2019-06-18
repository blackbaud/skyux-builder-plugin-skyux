const rimraf = require('rimraf');
const TypeDoc = require('typedoc');

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

  const runCommand = () => {
    const outputDir = '.typedoc-output';

    rimraf.sync(outputDir);

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
