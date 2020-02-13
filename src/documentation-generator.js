const logger = require('@blackbaud/skyux-logger');
const fs = require('fs-extra');
const rimraf = require('rimraf');
const TypeDoc = require('typedoc');

const outputDir = '.skypagestmp/docs';

function removeDocumentationFiles() {
  rimraf.sync(outputDir);
}

function isInternal(type) {
  if (type.comment && type.comment.tags) {
    const foundInternalType = type.comment.tags.find((tag) => {
      return (tag.tagName === 'internal');
    });

    if (foundInternalType) {
      return false;
    }
  }

  return true;
}

// Remove any type that is marked as `@internal`.
function removeInternalTypes(project) {
  project.children = project.children.filter(isInternal);
  project.children.forEach((type) => {
    if (type.children) {
      type.children = type.children.filter(isInternal);
    }
  });
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

function generateDocumentationFiles() {
  logger.info('Generating documentation...');

  const app = new TypeDoc.Application();

  app.bootstrap({
    exclude: [
      'node_modules',
      '**/fixtures/**',
      '**/*.spec.ts',
      '**/plugin-resources/**'
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
    removeDocumentationFiles();
    removeInternalTypes(project);

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
    logger.warn('TypeDoc project generation failed.');
  }

  process.on('exit', () => {
    removeDocumentationFiles();
  });

  process.on('SIGINT', () => {
    process.exit();
  });
}

module.exports = {
  generateDocumentationFiles,
  outputDir
};