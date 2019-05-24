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

function getLocaleFromFileName(fileName) {
  let locale = fileName.split('.json')[0].split('resources_')[1];

  locale = locale.toUpperCase().replace('_', '-');

  return locale;
}

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

  return !!(fileNameRegex.test(resolvedPath));
}

function parseClassName(content) {
  return content
    .split('export class ')[1]
    .split(' ')[0];
}

function SkyUXPlugin() {
  const resourceFilesContents = {};
  getLocaleFiles().forEach((file) => {
    const locale = getLocaleFromFileName(file);
    const contents = readJson(file);
    resourceFilesContents[locale] = contents;
  });

  // Standardize keys to be uppercase, due to some language limitations
  // with lowercase characters.
  // See: https://stackoverflow.com/questions/234591/upper-vs-lower-case
  const resourceFilesExist = ('EN-US' in resourceFilesContents);

  const writeResourcesProvider = (content, resourcePath) => {
    if (!resourceFilesExist) {
      return content;
    }

    if (!isPluginResource(
      resourcePath,
      /(-resources-provider.ts)$/
    )) {
      return content;
    }

    const resources = {};
    Object.keys(resourceFilesContents).forEach((locale) => {
      resources[locale] = {};
      Object.keys(resourceFilesContents[locale]).forEach((key) => {
        resources[locale][key] = resourceFilesContents[locale][key].message;
      });
    });

    const className = parseClassName(content);

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
  };

  const writeSourceCodeProvider = (content, resourcePath) => {

    if (!isPluginResource(
      resourcePath,
      /(-source-code-provider.ts)$/
    )) {
      return content;
    }

    const results = glob.sync(
      path.join('src/app/code-examples', '**', '*.{ts,js,html,scss}')
    );

    const sourceCode = results.map((filePath) => {
      let rawContents = fs.readFileSync(
        filePath,
        { encoding: 'utf8' }
      ).toString();

      // Use encoding to prevent certain webpack plugins and
      // loaders from manipulating the content.
      // (Specifically, `angular2-template-loader` will add `require`
      // statements to template and style URLs in the `@Component` decorator.)
      rawContents = encodeURIComponent(rawContents);

      const fileName = path.basename(filePath);

      return {
        fileName,
        filePath,
        rawContents
      };
    });

    const formattedSourceCode = JSON.stringify(sourceCode, undefined, 2);

    const className = parseClassName(content);

    return `import {
  Injectable
} from '@angular/core';

import {
  SkyDocsSourceCodeFile,
  SkyDocsSourceCodeProvider
} from '@skyux/docs-tools';

const SOURCE_FILES: SkyDocsSourceCodeFile[] = ${formattedSourceCode};

@Injectable()
export class ${className} implements SkyDocsSourceCodeProvider {
  public getSourceCode(path: string): SkyDocsSourceCodeFile[] {
    return SOURCE_FILES.filter((file) => {
      return (file.filePath.indexOf(path) === 0);
    }).map((file) => {
      file.rawContents = decodeURIComponent(file.rawContents);
      return file;
    });
  }
}
`;
  };

  const preload = (content, resourcePath) => {
    let modified = content.toString();

    modified = writeResourcesProvider(modified, resourcePath);
    modified = writeSourceCodeProvider(modified, resourcePath);

    return Buffer.from(modified, 'utf8');
  };

  return Object.freeze({
    preload
  });
}

module.exports = {
  SkyUXPlugin
};
