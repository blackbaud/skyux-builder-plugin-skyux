const fs = require('fs-extra');

function SkyUXPlugin() {
  const resourceFilePath = './src/assets/locales/resources_en_US.json';
  const resourceFileExists = fs.pathExistsSync(resourceFilePath);

  let resourceFileContents;
  if (resourceFileExists) {
    resourceFileContents = fs.readFileSync(
      resourceFilePath,
      { encoding: 'utf8' }
    );
  }

  /**
   * During the `skyux build-public-library` step, this function injects
   * the contents of the locales resources file when referenced via
   * a `require` statement in a source file.
   * This is done to prevent a breaking change, since SkyResources fetches
   * the resource string synchronously, and SkyAppResources asynchronously.
   * Once a library can release a breaking change to adopt SkyAppResources,
   * this file should no longer be used.
   */
  const preload = (content) => {
    if (!resourceFileExists) {
      return content;
    }

    const regex = /require\('!json-loader!\.skypageslocales\/resources_en_US\.json'\)/gi;
    if (!regex.test(content)) {
      return content;
    }

    const modified = content.toString().replace(
      regex,
      resourceFileContents
    );

    return Buffer.from(modified, 'utf8');
  };

  return Object.freeze({
    preload
  });
}

module.exports = {
  SkyUXPlugin
};
