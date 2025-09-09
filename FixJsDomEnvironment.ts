import JSDOMEnvironment from 'jest-environment-jsdom';

export default class FixJsDomEnvironment extends JSDOMEnvironment {
  constructor(...args: ConstructorParameters<typeof JSDOMEnvironment>) {
    super(...args);

    Object.defineProperty(this.global.URL.prototype,
      'createObjectURL',
      (_: any):string => ''
    );

    Object.defineProperty(this.global.URL.prototype,
      'revokeObjectURL',
      (_: any): any => {}
    );

    Object.defineProperty(this.global.Element.prototype,
      'scrollIntoView',
      (): void => {});

    Object.defineProperty(this.global.navigator, 'clipboard', {
      value: {
        writeText: async () => {},
      },
    });

    // https://github.com/facebook/jest/blob/v29.4.3/website/versioned_docs/version-29.4/Configuration.md#testenvironment-string
    // FIXME https://github.com/jsdom/jsdom/issues/3363
    this.global.structuredClone = structuredClone;
  }
}
