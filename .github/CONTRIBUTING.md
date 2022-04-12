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
- `npm run tests:cov` will run the unit tests and verify and summarize the code coverage.
- `npm run tests:cov-rep` will run the unit tests and verify the coverage creating an HTML coverage report.
- `npm run build` will lint, compile, test, and verify the code coverage for the project.
- `npm run clean:build` will remove any pre-compiled sources before building.
- `npm run integration-tests` will run the integration tests.
- `npm run clean` will remove the compiled sources
- `npm run clean-ext` will clean _vscode_'s extension testing folder (.vscode-test).
- `npm run clean-test-ws` will clean all content from the testing folder (test-workspace) excluding _.gitkeep_.
- `npm run clean:all` will execute the above three clean scripts.
- `npm run vsce:package` will build the VSIX package.

### Coding Guidelines

For maintainability, readability, and testing purposes, as well as for the overall robustness of this project,
we separate the various _vscode_ integrations from their underlying implementations.</br>

For example, at the time of writing this, _vscode_ integrations reside in the [commands package][17] and the
underlying implementations reside in the [utils package][18].</br>
Take the layout of the package with a pinch of salt, but also take the following couple of rules of thumb under
consideration while contributing code:

- The _vscode_ integration part should be as small as possible, and functions should be perceived as wrappers for
  the underlying implementations.
- The underlying implementations should be completely decoupled from _vscode_'s API.

In regards to testing,</br>
_vscode_'s integration should be tested within the context of [integration tests][12],</br>
the underlying implementations can, and probably should be tested within the context of [unit tests][11].

As for commits and pull requests, we prefer [conventional commit messages][4], but we do not enforce it yet.
Please be as informative as possible when opening pull requests.

### Launch Configurations

- _Run Extension_ will run the extension in a separate _vscode instance_.
- _Extension Tests_ will execute the integration tests in debug mode.

<!-- LINKS -->
[0]: https://nodejs.org
[1]: https://code.visualstudio.com/api
[2]: https://code.visualstudio.com/
[3]: https://github.com/ilan-pinto/ocm-vscode-extension/releases/tag/early-access
[4]: https://www.conventionalcommits.org/
<!-- CODE LINKS -->
[10]: https://github.com/ilan-pinto/ocm-vscode-extension/tree/main/src
[11]: https://github.com/ilan-pinto/ocm-vscode-extension/tree/main/tests
[12]: https://github.com/ilan-pinto/ocm-vscode-extension/tree/main/integration-tests
[13]: https://github.com/ilan-pinto/ocm-vscode-extension/tree/main/snippets
[14]: https://github.com/ilan-pinto/ocm-vscode-extension/tree/main/templates
[15]: https://github.com/ilan-pinto/ocm-vscode-extension/tree/main/images
[16]: https://github.com/ilan-pinto/ocm-vscode-extension/tree/main/test-workspace
[17]: https://github.com/ilan-pinto/ocm-vscode-extension/tree/main/src/commands
[18]: https://github.com/ilan-pinto/ocm-vscode-extension/tree/main/src/utils
