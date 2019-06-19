const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');

const utils = require('./utils');

/**
 * Writes the raw contents of any project files located in `./src/app/public/code-examples` to an Angular provider.
 * @param {string} content
 */
function writeSourceCodeProvider(content) {

  const results = glob.sync(
    path.join('src/app/public/code-examples', '**', '*.{ts,js,html,scss}')
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

  const className = utils.parseClassName(content);

  return `import {
  Injectable
} from '@angular/core';

import {
  SkyDocsSourceCodeProvider
} from '@skyux/docs-tools';

@Injectable()
export class ${className} implements SkyDocsSourceCodeProvider {
  public readonly sourceCode: any[] = ${formattedSourceCode};
}
`;
}

function preload(content, resourcePath) {

  if (!utils.isPluginResource(
    resourcePath,
    /(-source-code-provider.ts)$/
  )) {
    return content;
  }

  let modified = content.toString();

  modified = writeSourceCodeProvider(modified);

  return Buffer.from(modified, 'utf8');
}

module.exports = {
  preload
};