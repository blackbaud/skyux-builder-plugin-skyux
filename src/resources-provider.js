const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');

const utils = require('./utils');

function getLocaleFiles() {
  return glob.sync(
    path.join('src/assets/locales', 'resources_*.json')
  );
}

function readJson(file) {
  fs.ensureFileSync(file);

  const buffer = fs.readFileSync(file);

  // Is the locale file empty?
  let contents;
  if (buffer.length === 0) {
    contents = {};
  } else {
    contents = JSON.parse(buffer.toString());
  }

  return contents;
}

function getLocaleFromFileName(fileName) {
  let locale = fileName.split('.json')[0].split('resources_')[1];
  locale = locale.toUpperCase().replace('_', '-');
  return locale;
}

const resourceFilesContents = {};
getLocaleFiles().forEach((file) => {
  const locale = getLocaleFromFileName(file);
  const contents = readJson(file);
  resourceFilesContents[locale] = contents;
});

/**
 * Standardize keys to be uppercase, due to some language limitations
 * with lowercase characters.
 * See: https://stackoverflow.com/questions/234591/upper-vs-lower-case
 */
const resourceFilesExist = ('EN-US' in resourceFilesContents);

/**
 * Writes the contents of locale resources JSON files to an Angular provider.
 * @param {string} content
 */
function writeResourcesProvider(content) {

    const resources = {};
    Object.keys(resourceFilesContents).forEach((locale) => {
      resources[locale] = {};
      Object.keys(resourceFilesContents[locale]).forEach((key) => {
        resources[locale][key] = resourceFilesContents[locale][key].message;
      });
    });

    const className = utils.parseClassName(content);

    return `
import {
  Injectable
} from '@angular/core';

import {
  SkyAppLocaleInfo,
  SkyLibResourcesProvider
} from '@skyux/i18n';

import {
  getStringForLocale
} from '@skyux/i18n/modules/i18n/get-string-for-locale';

@Injectable()
export class ${className} implements SkyLibResourcesProvider {
  private resources: any = ${JSON.stringify(resources)};

  public getString(localeInfo: SkyAppLocaleInfo, name: string): string {
    return getStringForLocale(this.resources, localeInfo.locale, name);
  }
}
`;
}

function preload(content, resourcePath) {
  if (!resourceFilesExist) {
    return content;
  }

  if (!utils.isPluginResource(
    resourcePath,
    /(-resources-provider.ts)$/
  )) {
    return content;
  }

  let modified = content.toString();
  modified = writeResourcesProvider(modified, resourcePath);
  return Buffer.from(modified, 'utf8');
}

module.exports = {
  preload
};