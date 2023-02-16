/* Mock of @angular.core.Renderer2 object
 * Used to access the document.body class list
 **/
export class MockRenderer2 {
  addClass(_: string, __: string): boolean {
    return true;
  }
  removeClass(_: string, __: string): boolean {
    return true;
  }
}
