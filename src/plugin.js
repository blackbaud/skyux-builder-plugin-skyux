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

  const writeResourcesProvider = (content) => {
    if (!resourceFilesExist) {
      return content;
    }

    if (content.indexOf('implements SkyLibResourcesProvider {') === -1) {
      return content;
    }

    const resources = {};
    Object.keys(resourceFilesContents).forEach((locale) => {
      resources[locale] = {};
      Object.keys(resourceFilesContents[locale]).forEach((key) => {
        resources[locale][key] = resourceFilesContents[locale][key].message;
      });
    });

    let className = content.split('export class ')[1];
    className = className.split(' ')[0];

    return `
import {
  Inject,
  Injectable
} from '@angular/core';

import {
  SkyAppFormat
} from '@skyux/core';

import {
  SkyAppHostLocaleProvider,
  SkyAppLocaleProvider,
  SkyLibResourcesProvider
} from '@skyux/i18n';

import {
  BehaviorSubject
} from 'rxjs/BehaviorSubject';

import {
  Observable
} from 'rxjs/Observable';

@Injectable()
export class ${className} implements SkyLibResourcesProvider {
  private resources: any = ${JSON.stringify(resources)};
  private skyAppFormat: SkyAppFormat;
  private value$ = new BehaviorSubject<string>('');

  constructor(
    @Inject(SkyAppHostLocaleProvider) private localeProvider: SkyAppLocaleProvider
  ) {
    this.skyAppFormat = new SkyAppFormat();
  }

  public getDefaultString(name: string, ...args: any[]): string {
    const locale = 'en_US';
    return this.resources[locale][name] || name;
  }

  public getString(name: string, ...args: any[]): Observable<string> {
    this.localeProvider.getLocaleInfo()
      .subscribe((localeInfo) => {
        const locale = localeInfo.locale.replace('-', '_');
        const value = this.resources[locale][name] || name;
        this.skyAppFormat.formatText(value, args);
        this.value$.next(value);
      });

    return this.value$;
  }
}
`;
  }

  const preload = (content) => {
    let modified = content.toString();

    modified = writeResourcesProvider(modified);

    return Buffer.from(modified, 'utf8');
  };

  return Object.freeze({
    preload
  });
}

module.exports = {
  SkyUXPlugin
};
