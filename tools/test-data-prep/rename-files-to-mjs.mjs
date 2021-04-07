/** Script to rename (change extension) of files within a (argument-supplied) directory
/* The e2e test-data servers use node's native 'http' module, which can only be imported within the context of a module. A module can be declared at package.json level (with the attribute type="module") or at file level (with the .mjs extension).
/* This script renames (compiled typescript) files with the .js extension to files with a .mjs extension - within the supplied (dist) directory.  It renames all the files because modular js can't import non modular js.  It should be run after typescript compilation and before starting the e2e test-data servers.
*/

import * as path from 'path';
import * as fs from 'fs';

const dir = process.argv.slice(2);
const newExtension = '.mjs';

if (dir.length === 0) {
  console.log('please supply an argument for the directory');
} else {
  const listDir = (dir, fileList = []) => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      if (fs.statSync(path.join(dir, file)).isDirectory()) {
        fileList = listDir(path.join(dir, file), fileList);
      } else {
        if (/\.js$/.test(file)) {
          const name = file.split('.')[0] + newExtension;
          const src = path.join(dir, file);
          const newSrc = path.join(dir, name);
          fileList.push({
            oldSrc: src,
            newSrc: newSrc
          });
        }
      }
    });
    return fileList;
  };
  const foundFiles = listDir(`./${dir}`);

  console.log(`Will rename ${foundFiles.length} files in ${dir}`);
  foundFiles.forEach((f) => {
    fs.renameSync(f.oldSrc, f.newSrc);
  });
  console.log('(done)');
}
