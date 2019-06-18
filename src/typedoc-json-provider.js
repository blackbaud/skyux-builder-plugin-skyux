const fs = require('fs-extra');
const path = require('path');

const utils = require('./utils');

/**
 * Writes the contents of TypeDoc JSON file to an Angular provider.
 * @param {string} content
 */
function writeTypeDefinitionsProvider(content) {

  const filePath = path.resolve(process.cwd(), '.typedoc-output/documentation.json');

  const jsonContent = fs.readFileSync(
    filePath,
    { encoding: 'utf8' }
  ).toString();

  const className = utils.parseClassName(content);

  return `import {
  Injectable
} from '@angular/core';

import {
  SkyDocsDemoPageTypeDefinitionsProvider
} from '@skyux/docs-tools';

const typeDefinitions: any = ${jsonContent};

@Injectable()
export class ${className} implements SkyDocsDemoPageTypeDefinitionsProvider {
  public getTypeDefinitions(path: string): any[] {
    return typeDefinitions;
  }
}
`;
}

function preload(content, resourcePath) {

  if (!utils.isPluginResource(
    resourcePath,
    /(-type-definitions-provider.ts)$/
  )) {
    return content;
  }

  let modified = content.toString();

  modified = writeTypeDefinitionsProvider(modified);

  return Buffer.from(modified, 'utf8');
}

module.exports = {
  preload
};