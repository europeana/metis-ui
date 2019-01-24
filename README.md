# Metis

[![Build Status](https://travis-ci.org/europeana/metis-ui.svg?branch=develop)](https://travis-ci.org/europeana/metis-ui)

## Getting started

To run the Metis UI you need to provide a backend server to connect to. Copy `apisettings-test.ts` to `apisettings.ts` and fill in the URL's:

    cp src/environments/apisettings-example.ts src/environments/apisettings.ts 
 
If you are working at Europeana, just ask Andy MacLean or Mirjam Verloop for the right `apisettings.ts` file.

Make sure you have `node` version 8, 10 or 11 and `npm` version 6.x:

    node --version
    npm --version

Get the `npm` dependencies:

    npm install

## Development server

Run `npm start` for a dev server. Navigate to [http://localhost:4200/](http://localhost:4200/). The app will automatically reload if you change any of the source files.

## Branches and Pull Requests

The main branch for development is the `develop` branch. But do NOT use this branch directly! Use a new branch for features/bugs and give it a descriptive name containing the user story code, like:

    feat/MET-1535-dataset-page-styling
    bug/MET-3245-dashboard-not-loading

If you push a branch or commit to GitHub, it will automatically be tested by Travis CI. This will take about 5 mins and the results will be shown in GitHub, e.g. in the pull request page.

If the tests fail, there is often a small linting or formatting error (see [Linting and code formatting](#linting-and-code-formatting) ). Run this command and check if it fixes the tests:

    npm run fix

Make a pull request in GitHub for code review and merging.

## Linting and code formatting

We use `prettier` and `tslint` to check and fix the code. Just run this command after making changes or before committing:

    npm run fix

You can also run the tools separately:

    npm run prettier
    npm run tslint

## Test

### All tests (CI)

To run the full test suite:

    npm test
    
This is the same command that Travis and jenkins run to test our code.

### Unit tests (development)

To run the unit tests in development (watch mode):

    npm run test:dev
    
You can also use Wallaby (heartily recommended!) by using the included `wallaby.js` file.

### E2E tests (development)

To run the cypress tests in development (watch mode), start the dev server in one terminal window:

    npm run start:ci

...and then run cypress in another window:

    npm run cypress

### Template check (development)

We use Angular AOT compiling with `fullTemplateTypeCheck: true` to do limited checking of the templates. This is run as part of `npm test` but you can also run it manually:

    npm run template-check

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory. Use `npm run dist` for a production build.

## Deploy

We use jenkins to deploy. Make sure you can access [https://jenkins.eanadev.org/](https://jenkins.eanadev.org/) and use the following jobs:

- `develop_deploy-test_metis-ui-angular_bluemix`
- `develop_deploy-acceptance_metis-ui-angular_bluemix`
- `branch_deploy-production_metis-ui-angular_bluemix`

The test and acceptance jobs should be run off the `develop` branch.

## Release

The release documentation is in the "Release Metis UI/Metis Framework/ECloud manual" document on Google Docs.

## License

Licensed under the EUPL v. 1.1.

For full details, see [LICENSE.md](LICENSE.md).
