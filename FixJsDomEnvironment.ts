import JSDOMEnvironment from 'jest-environment-jsdom';

export default class FixJsDomEnvironment extends JSDOMEnvironment {
  constructor(...args: ConstructorParameters<typeof JSDOMEnvironment>) {
    super(...args);

    this.global.URL.createObjectURL = (_: any):string => '';
    this.global.URL.revokeObjectURL = (_) => {};

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
