# Contributing to oc-vscode-extension

All contributions are welcomed, thank you!

## Useful Links

- [Node JS Download][0]
- [VSCode API Documentation][1]

## Development

### Environment Preparations

All you need is [VSCode][2] and [NodeJS][0].

> This project was built with _NodeJS 16_ and _VSCode 1.65.2_.

### Project Layout

- [src][10] contains the source code for the extension.
- [integration-tests][11] contains the sources for integration testing.
- [snippets][12] contains the snippets offered by the extension.
- [templates][13] contains template files for orchestrating new projects.
- [test-workspace][14] used for integration testing, git is keeping it and ignoring its content.

### NPM Scripts

- `npm install` will install all the required modules for the project.
- `npm run lint` will lint all _typescript_ sources.
- `npm run build` will lint and compile the project.
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
<!-- CODE LINKS -->
[10]: https://github.com/ilan-pinto/ocm-vscode-extension/tree/main/src
[11]: https://github.com/ilan-pinto/ocm-vscode-extension/tree/main/integration-tests
[12]: https://github.com/ilan-pinto/ocm-vscode-extension/tree/main/snippets
[13]: https://github.com/ilan-pinto/ocm-vscode-extension/tree/main/templates
[14]: https://github.com/ilan-pinto/ocm-vscode-extension/tree/main/test-workspace
