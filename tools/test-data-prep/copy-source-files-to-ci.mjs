/** Script to copy files */

import * as fs from 'fs';

const filePaths = [
  'projects/metis/src/app/_models/publication.ts',
  'projects/metis/src/app/_models/harvest-data.ts',
  'projects/metis/src/app/_models/workflow-execution.ts',
  'projects/metis/src/app/_models/depublication-base.ts'
];

const destPath = 'projects/metis/test-data/src-copy';

if (!fs.existsSync(destPath)) {
  fs.mkdirSync(destPath);
}

filePaths.forEach((path) => {
  const fileName = path
    .split('/')
    .pop()
    .replace('.ts', '.mts');

  fs.copyFile(path, `${destPath}/${fileName}`, (err) => {
    if (err) {
      throw err;
    }
    console.log(`copied "${path}" to "test-data/${fileName}"`);
  });
});
