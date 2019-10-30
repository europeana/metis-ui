/** isDateSupported
/* check if the browser supports the html date input
*/
export function isDateSupported(): boolean {
  const input = document.createElement('input');
  const value = 'a';
  input.setAttribute('type', 'date');
  input.setAttribute('value', value);
  return input.value !== value;
}

/** isValidDate
/* check the format of the specified date string
*/
export function isValidDate(value: string): boolean {
  return value.match(/\d{4}-\d{2}-\d{2}/) !== null;
}
