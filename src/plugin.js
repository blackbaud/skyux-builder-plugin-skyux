const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');

function getLocaleFiles() {
  return glob.sync(
    path.join('src/assets/locales', 'resources_*.json')
  );
}

function readJson(file) {
  fs.ensureFileSync(file);

  const buffer = fs.readFileSync(file);

  let contents;
  // Is the locale file empty?
  if (buffer.length === 0) {
    contents = {};
  } else {
    contents = JSON.parse(buffer.toString());
  }

  return contents;
}

function SkyUXPlugin() {
  const resourceFilesContents = {};
  getLocaleFiles().forEach((file) => {
    const locale = file.split('.json')[0].split('resources_')[1];
    const contents = readJson(file);
    resourceFilesContents[locale] = contents;
  });

  const resourceFilesExist = ('en_US' in resourceFilesContents);

  const writeResourcesProvider = (content, resourcePath) => {
    if (!resourceFilesExist) {
      return content;
    }

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
      return content;
    }

    const regexp = new RegExp(/(-resources-provider.ts)$/);
    if (!regexp.test(resolvedPath)) {
      return content;
    }

    const resources = {};
    Object.keys(resourceFilesContents).forEach((locale) => {
      let localeLowerCase = locale.toLowerCase();
      resources[localeLowerCase] = {};
      Object.keys(resourceFilesContents[locale]).forEach((key) => {
        resources[localeLowerCase][key] = resourceFilesContents[locale][key].message;
      });
    });

    let className = content.split('export class ')[1];
    className = className.split(' ')[0];

    return `
import {
  Injectable
} from '@angular/core';

import {
  SkyAppLocaleInfo,
  SkyLibResourcesProvider
} from '@skyux/i18n';

@Injectable()
export class ${className} implements SkyLibResourcesProvider {
  private resources: any = ${JSON.stringify(resources)};

  public getString(localeInfo: SkyAppLocaleInfo, name: string): string {
    const locale = localeInfo.locale.toLowerCase().replace('-', '_');
    const values = this.resources[locale];

    if (values) {
      return values[name];
    }

    return '';
  }
}
`;
  }

  const preload = (content, resourcePath) => {
    let modified = content.toString();

    modified = writeResourcesProvider(modified, resourcePath);

    return Buffer.from(modified, 'utf8');
  };

  return Object.freeze({
    preload
  });
}

module.exports = {
  SkyUXPlugin
};
