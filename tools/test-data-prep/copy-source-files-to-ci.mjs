/** Script to copy files */

import * as fs from 'fs';

const project = `${process.argv.slice(2)}`;
const destPath = `projects/${project}/test-data/src-copy`;

const filePaths =
  project === 'metis'
    ? [
        'projects/metis/src/app/_models/publication.ts',
        'projects/metis/src/app/_models/harvest-data.ts',
        'projects/metis/src/app/_models/workflow-execution.ts',
        'projects/metis/src/app/_models/depublication-base.ts'
      ]
    : [];

if (!fs.existsSync(destPath)) {
  fs.mkdirSync(destPath);
}

filePaths.forEach((path) => {
  const fileName = path
    .split('/')
    .pop()
    .replace('.ts', '.mts');

  const dest = `${destPath}/${fileName}`;

  fs.copyFile(path, dest, (err) => {
    if (err) {
      throw err;
    }
    console.log(`copied "${path}" to "${dest}"`);
  });
});
