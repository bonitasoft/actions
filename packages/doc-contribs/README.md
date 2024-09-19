# Actions for Documentation Contributions

This workspace contains the actions used to help contributors of the Bonitasoft Documentation.

It is composed of two packages:

- [common](common): contains the common code used by the other packages.
- [pr-antora-content-guidelines-checker](pr-antora-content-guidelines-checker): contains the action that checks if the updated files follow the recommendation from the Bonita documentation team.
- [pr-comments-with-links](pr-comments-with-links): contains the action that generate a comment with the link for the added/updated/removed page to the preview. 

## How-to develop

This workspace uses [npm workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces) to manage multiple packages.

The global configuration is defined in the [root package.json](package.json) and setup for you a base configuration for TypeScript, eslint and jest.

### Install dependencies
```shell
npm install
```

### Build
```shell
npm run build
```

### Run tests

To run tests for all modules:

```shell
npm run test --workspaces --if-present
```

## Release

See the [release-process](../../README.md#release-process)
