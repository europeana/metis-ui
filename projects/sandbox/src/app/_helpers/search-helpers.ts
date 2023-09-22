const sanitationRegex = /[.*+?^${}()|[\]\\]/g;
const sanitationReplace = '\\$&';

/** sanitiseSearchTerm
 * incorporates diaritics, escapes regex operators / qualifiers and
 * (conditionally) applies start/end modifiers
 *
 * @param {string} filterString - filter information
 * @returns the string converted to a regex-safe string
 **/
export function sanitiseSearchTerm(filterString: string): string {
  if (filterString.length === 0 || filterString.replace(sanitationRegex, '').length === 0) {
    return '';
  }

  const modifierStart = filterString.indexOf('^') === 0;
  const modifierEnd = filterString.indexOf('$') === filterString.length - 1;

  if (modifierStart) {
    filterString = filterString.slice(1);
  }
  if (modifierEnd) {
    filterString = filterString.slice(0, -1);
  }
  let filter = filterString.replace(sanitationRegex, sanitationReplace);

  if (modifierStart && modifierEnd) {
    filter = `^${filter}$|\\^${filter}$|^${filter}\\$|\\^${filter}\\$`;
  } else if (modifierStart) {
    filter = `^${filter}|\\^${filter}`;
  } else if (modifierEnd) {
    filter = `${filter}$|${filter}\\$`;
  }
  return filter;
}
