/** isSupportedDateElement
/* check if the browser supports the html date input and that the supplied input is a date
/* @param { HTMLInputElement } el - the elemnt to test
*/
export function isSupportedDateElement(el: HTMLInputElement): boolean {
  const input = document.createElement('input');
  const value = 'a';
  input.setAttribute('type', 'date');
  input.setAttribute('value', value);
  return el.getAttribute('type') === 'date' && input.value !== value;
}

/** isValidDate
/* check the format of the specified date string
*/
export function isValidDate(value: string): boolean {
  const date = new Date(value);
  return !isNaN(date.getDate()) && date.toISOString().split('T')[0] === value;
}
