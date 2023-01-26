# Metis

[![Build Status](https://travis-ci.org/europeana/metis-ui.svg?branch=develop)](https://travis-ci.org/europeana/metis-ui)

## Repository Contents

This repository is an angular workspace configured to build the projects:

* metis-ui
* metis-sandbox

## Getting started (Metis-UI and Sandbox)

Make sure you have `node` version 14.7.8 and `npm` version 6.x:

    node --version
    npm --version

Get the `npm` dependencies:

    npm install

Build the shared library:

    npm run build-shared

## Getting started (Metis-UI)

To run the Metis UI you need to provide a backend server to connect to. Modify the file `projects/metis/src/assets/env.js` by filling in the URLs

## Getting started (Sandbox)

To run the Sandbox you need to provide a backend server to connect to. Copy `apisettings-test.ts` to `apisettings.ts` and fill in the URL's:

    cp projects/metis/src/environments/apisettings-example.ts projects/metis/src/environments/apisettings.ts

## Development server

Run `npm start-metis` or just `npm start`for a dev server. Navigate to [http://localhost:4200/](http://localhost:4200/). The `(metis-ui)` app will automatically reload if you change any of the source files.

Run `npm start-sandbox` to run a dev server for the sandbox.

## Branches and Pull Requests

The main branch for development is the `develop` branch. But do NOT use this branch directly! Use a new branch for features/bugs and give it a descriptive name containing the user story code, like:

    feat/MET-1535-dataset-page-styling
    bug/MET-3245-dashboard-not-loading

If you push a branch or commit to GitHub, it will automatically be tested by Travis CI. This will take about 5 mins and the results will be shown in GitHub, e.g. in the pull request page.

If the tests fail, there is often a small linting or formatting error (see [Linting and code formatting](#linting-and-code-formatting) ). Run this command and check if it fixes the tests:

    npm run fix

Make a pull request in GitHub for code review and merging.

## Linting and code formatting

We use `prettier` and `eslint` to check and fix the code. Just run this command after making changes or before committing:

    npm run fix

You can also run the tools separately:

    npm run prettier
    npm run lint

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

To run the cypress tests:

    npm run test:e2e


To run the cypress tests in development (watch mode), start the dev server in one terminal window:

    npm run start:ci

...start the dev data server in another terminal window:

    npm run start:ci-data

...and then run cypress in another window:

    npm run cypress

### Accessibility tests (development)

To run the accessibility tests:

    npm run test:accessibility

### Template check (development)

We use Angular AOT compiling with `fullTemplateTypeCheck: true` to do limited checking of the templates. This is run as part of `npm test` but you can also run it manually:

    npm run template-check

## Build

Run `npm run build-metis` or `npm run build-sandbox` to build a single project, or run `npm run build` to build both projects. The build artifacts will be stored in the relative `projects/[PROJECT_NAME]/dist/` sub-directories.

Use `npm run dist-metis`or `npm run dist-sandbox` for a production build (stored in the `/dist` directory).

## Deploy

We use jenkins to deploy. Make sure you can access [https://jenkins.eanadev.org/](https://jenkins.eanadev.org/) and use the following jobs:
- `develop_deploy-test_metis-ui-angular_bluemix`
- `develop_deploy-acceptance_metis-ui-angular_bluemix`
- `branch_deploy-production_metis-ui-angular_bluemix`
- `Sandbox-UI-Test`

The test and acceptance jobs should be run off the `develop` branch.

## Docker

To make a (parameterised) docker image of either app first build the shared library:

  `npm run build-shared`

And then from the root of the project build the app, so either:

  `npm run dist-metis`
or
  `npm run dist-sandbox`

The docker nginx image is the built with either:

`docker build -t metis-ui-app-image:version projects/metis/`
or
`docker build -t sandbox-ui-app-image:version projects/sandbox/`


Once the values in `projects/[PROJECT_NAME]/env_file` have been set then the generated docker image can be ran with either:

`docker run -it --rm -d -p 8080:8080  --env-file=projects/metis/env_file --name metis-ui metis-ui-app-image:version`
or
`docker run -it --rm -d -p 8080:8080  --env-file=projects/sandbox/env_file --name sandbox-ui sandbox-ui-app-image:version`

## Release

The release documentation is in the "Release Metis UI/Metis Framework/ECloud manual" document on Google Docs.

## License

Licensed under the EUPL v. 1.2.

For full details, see [LICENSE.md](LICENSE.md).
