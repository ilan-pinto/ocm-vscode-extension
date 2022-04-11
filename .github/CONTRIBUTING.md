# Contributing to oc-vscode-extension

All contributions are welcome, thank you!

## Useful Links

- [Node JS Download][0]
- [VSCode API Documentation][1]

## Development

Early-access pre-release is available [here][3] and will always reflect the current development snapshot from the _main_ branch.

### Environment Preparations

All you need is [VSCode][2] and [NodeJS][0].

> This project was built with _NodeJS 16_ and _VSCode 1.65.2_.

### Project Layout

- [src][10] contains the source code for the extension.
- [tests][11] contains the sources for the unit tests.
- [integration-tests][12] contains the sources for integration tests.
- [snippets][13] contains the snippets offered by the extension.
- [templates][14] contains template files for orchestrating new projects.
- [images][15] contains various images used throughout the project.
- [test-workspace][16] used for integration testing, git is keeping it and ignoring its content.

### NPM Scripts

- `npm install` will install all the required modules for the project.
- `npm run lint` will lint all _typescript_ sources.
- `npm run tests` will run the unit tests.
- `npm run build` will lint, test, and compile the project.
- `npm run clean:build` will remove any pre-compiled sources before building.
- `npm run integration-tests` will run the integration tests.
- `npm run clean` will remove the compiled sources
- `npm run clean-ext` will clean _vscode_'s extension testing folder (.vscode-test).
- `npm run clean-test-ws` will clean all content from the testing folder (test-workspace) excluding _.gitkeep_.
- `npm run clean:all` will execute the above three clean scripts.
- `npm run vsce:package` will build the VSIX package.

### Launch Configurations

- _Run Extension_ will run the extension in a separate _vscode instance_.
- _Extension Tests_ will execute the integration tests in debug mode.

<!-- LINKS -->
[0]: https://nodejs.org
[1]: https://code.visualstudio.com/api
[2]: https://code.visualstudio.com/
[3]: https://github.com/ilan-pinto/ocm-vscode-extension/releases/tag/early-access
<!-- CODE LINKS -->
[10]: https://github.com/ilan-pinto/ocm-vscode-extension/tree/main/src
[11]: https://github.com/ilan-pinto/ocm-vscode-extension/tree/main/tests
[12]: https://github.com/ilan-pinto/ocm-vscode-extension/tree/main/integration-tests
[13]: https://github.com/ilan-pinto/ocm-vscode-extension/tree/main/snippets
[14]: https://github.com/ilan-pinto/ocm-vscode-extension/tree/main/templates
[15]: https://github.com/ilan-pinto/ocm-vscode-extension/tree/main/images
[16]: https://github.com/ilan-pinto/ocm-vscode-extension/tree/main/test-workspace
