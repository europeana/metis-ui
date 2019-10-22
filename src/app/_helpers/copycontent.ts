/** copyExecutionAndTaskId
/*  after double clicking, copy the execution and task id to the clipboard
/* @param {string} type - execution or plugin
/* @param {string} id1 - an id, depending on type
/* @param {string} id2 - an id, depending on type
*/

export function copyExecutionAndTaskId(type: string, id1: string, id2: string): void {
  const selBox = document.createElement('textarea');
  selBox.style.position = 'fixed';
  selBox.style.left = '0';
  selBox.style.top = '0';
  selBox.style.opacity = '0';
  if (type === 'plugin') {
    selBox.value = `externalTaskId: ${id1}, id: ${id2}`;
  } else {
    selBox.value = `id: ${id1}, ecloudDatasetId: ${id2}`;
  }

  document.body.appendChild(selBox);
  selBox.focus();
  selBox.select();

  document.execCommand('copy');
  document.body.removeChild(selBox);
}
