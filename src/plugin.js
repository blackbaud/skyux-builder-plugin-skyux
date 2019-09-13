const logger = require('@blackbaud/skyux-logger');
const fs = require('fs-extra');
const rimraf = require('rimraf');
const TypeDoc = require('typedoc');

const resourcesProviderPlugin = require('./resources-provider');
const sourceCodeProviderPlugin = require('./source-code-provider');
const typeDocJsonProviderPlugin = require('./typedoc-json-provider');

const outputDir = '.skypagesdocs';

function removeDocumentationFiles() {
  rimraf.sync(outputDir);
}

function parseFriendlyUrlFragment(value) {
  if (!value) {
    return;
  }

  const friendly = value.toLowerCase()

    // Remove special characters.
    .replace(/[_~`@!#$%^&*()[\]{};:'/\\<>,.?=+|"]/g, '')

    // Replace space characters with a dash.
    .replace(/\s/g, '-')

    // Remove any double-dashes.
    .replace(/--/g, '-');

  return friendly;
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

    // Remove any type that is marked as `@internal`.
    project.children = project.children.filter((child) => {

      if (child.comment && child.comment.tags) {
        const foundInternalType = child.comment.tags.find((tag) => {
          return (tag.tagName === 'internal');
        });

        if (foundInternalType) {
          return false;
        }
      }

      return true;
    });

    if (project) {
      const jsonPath = `${outputDir}/documentation.json`;

      app.generateJson(project, jsonPath);

      const jsonContents = fs.readJsonSync(jsonPath);

      // Create anchor IDs to be used for same-page linking.
      const anchorIdMap = {};
      jsonContents.children.forEach((child) => {
        const kindString = parseFriendlyUrlFragment(child.kindString);
        const friendlyName = parseFriendlyUrlFragment(child.name);
        const anchorId = `${kindString}-${friendlyName}`;

        child.anchorId = anchorId;
        anchorIdMap[child.name] = anchorId;
      });

      jsonContents.anchorIds = anchorIdMap;

      fs.writeJsonSync(jsonPath, jsonContents);

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
