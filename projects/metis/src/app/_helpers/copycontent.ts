/** copyExecutionAndTaskId
/*  after double clicking, copy the execution and task id to the clipboard
/* @param {string} type - execution or plugin
/* @param {string} id1 - an id, depending on type
/* @param {string} id2 - an id, depending on type
*/
export function copyExecutionAndTaskId(type: string, id1: string, id2: string): void {
  let copyValue = '';
  if (type === 'plugin') {
    copyValue = `externalTaskId: ${id1}, id: ${id2}`;
  } else {
    copyValue = `id: ${id1}, ecloudDatasetId: ${id2}`;
  }
  navigator.clipboard.writeText(copyValue);
}
