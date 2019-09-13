const fs = require('fs-extra');
const path = require('path');

const utils = require('./utils');

/**
 * Writes the contents of TypeDoc JSON file to an Angular provider.
 * @param {string} content
 */
function writeTypeDefinitionsProvider(content) {

  const filePath = path.resolve('.skypagesdocs/documentation.json');

  const jsonContent = fs.readJsonSync(
    filePath,
    { encoding: 'utf8' }
  );

  const className = utils.parseClassName(content);

  return `import {
  Injectable
} from '@angular/core';

import {
  SkyDocsTypeDefinitionsProvider
} from '@skyux/docs-tools';

@Injectable()
export class ${className} implements SkyDocsTypeDefinitionsProvider {

  public readonly anchorIds: {[_: string]: string} = ${JSON.stringify(jsonContent.anchorIds)};

  public readonly typeDefinitions: any[] = ${JSON.stringify(jsonContent.children)};

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