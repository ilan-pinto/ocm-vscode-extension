# OCM VScode Extension

The `ocm-vscode-extension` helps quickly create OCM managed applications.

## Current Features

- Loading CR snippets from the command palette

![snippets-from-palette][10]

- Create a new project for the various channel types

![new-project][11]

## Installation

This extension is still in development and is available as pre-release development snapshots only.</br>
To get the latest snapshot visit [Early-access pre-release][3], scroll down to the _Assets_ section,
and download the version for your operating system.</br>
In your _vscode_ instance, select the _Extensions_ view container (ctrl+shift+x), click the **...** at the right corner of the palette, _Install from VSIX..._, and select the _VSIX_ file you downloaded.

## Requirements

- To apply the generated resources, the [Application Lifecycle Management Addon][0] should be installed and enabled in your hub/managed clusters.

## Road Map

- Execute [clusteradm][1] commands.
- Query hub/managed cluster resources.

## Contributing

See our [Contributing Guidelines][2] for more information.

<!-- LINKS -->
[0]: https://open-cluster-management.io/getting-started/integration/app-lifecycle/
[1]: https://github.com/open-cluster-management-io/clusteradm
[2]: https://github.com/ilan-pinto/ocm-vscode-extension/contribute
[3]: https://github.com/ilan-pinto/ocm-vscode-extension/releases/tag/early-access
<!-- GIFS -->
[10]: https://raw.githubusercontent.com/ilan-pinto/ocm-vscode-extension/main/images/snippets-from-palette.gif
[11]: https://raw.githubusercontent.com/ilan-pinto/ocm-vscode-extension/main/images/new-project.gif
