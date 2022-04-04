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

- [src](../src) contains the source code for the extension.
- [integration-tests](../integration-tests) contains the sources for integration testing.
- [snippets](../snippets) contains the snippets offered by the extension.
- [templates](../templates) contains template files for orchestrating new projects.
- [test-workspace](../test-workspace) used for integration testing, git is keeping it and ignoring its content.

### NPM Scripts

- `npm run lint` will lint all _typescript_ sources.
- `npm run build` will lint and compile the project.
- `npm run clean:build` will remove any pre-compiled sources before building.
- `npm run integration-tests` will run the integration tests.
- `npm run clean-ext` will clean _vscode_'s extension testing folder (.vscode-test).

### Launch Configurations

- _Run Extension_ will run the extension in a separate _vscode instance_.
- _Extension Tests_ will execute the integration tests in debug mode.

<!-- LINKS -->
[0]: https://nodejs.org
[1]: https://code.visualstudio.com/api
[2]: https://code.visualstudio.com/
