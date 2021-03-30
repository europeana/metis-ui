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
