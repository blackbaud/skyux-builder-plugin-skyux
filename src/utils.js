const path = require('path');

function isPluginResource(resourcePath, fileNameRegex) {

  // Resolve the resource path for Windows machines.
  const resolvedPath = path.resolve(resourcePath);

  // Directory used when serving or building.
  const dir = path.join('src', 'app', 'public', 'plugin-resources');

  // Directory used when building library.
  const tempDir = path.join('.skypagestmp', 'plugin-resources');

  if (
    resolvedPath.indexOf(dir) === -1 &&
    resolvedPath.indexOf(tempDir) === -1
  ) {
    return false;
  }

  return fileNameRegex.test(resolvedPath);
}

function parseClassName(content) {
  return content
    .split('export class ')[1]
    .split(' ')[0];
}

module.exports = {
  isPluginResource,
  parseClassName
};
