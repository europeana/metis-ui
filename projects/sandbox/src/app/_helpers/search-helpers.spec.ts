import { sanitiseSearchTerm } from '.';

describe('Search Helpers', () => {
  it('should sanitise the search term', () => {
    expect(sanitiseSearchTerm('term')).toEqual('term');
    expect(sanitiseSearchTerm('{}')).toEqual('');
    expect(sanitiseSearchTerm('[]')).toEqual('');
  });

  it('should sanitise the search term (start modifier)', () => {
    expect(sanitiseSearchTerm('^A')).toEqual('^A|\\^A');
  });

  it('should sanitise the search term (end modifier)', () => {
    expect(sanitiseSearchTerm('Z$')).toEqual('Z$|Z\\$');
  });

  it('should sanitise the search term (both modifiers)', () => {
    expect(sanitiseSearchTerm('^AZ$')).toEqual('^AZ$|\\^AZ$|^AZ\\$|\\^AZ\\$');
  });
});
