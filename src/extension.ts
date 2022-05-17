import * as connectedClusters from './providers/connectedClusters';
import * as createEnvironment from './commands/createEnvironment';
import * as newProject from './commands/newProject';
import * as verifyEnvironment from './commands/verifyEnvironment';
import * as vscode from 'vscode';

const extName = 'ocm-vscode-extension';

// COMMAND NAMES
const cmdNewProjectName = 'ocmNewProject';
const cmdVerifyTools = 'verifyTools';
const cmdBuildLocalClusters = 'createLocalEnvironment';

// DISPOSABLES
const cmdNewProjectDisposable = vscode.commands.registerCommand(
	`${extName}.${cmdNewProjectName}`, () => newProject.create()
);

const cmdVerifyToolsDisposable = vscode.commands.registerCommand(
	`${extName}.${cmdVerifyTools}`, () => verifyEnvironment.verifyTools()
);

const cmdBuildLocalClusterDisposable = vscode.commands.registerCommand(
	`${extName}.${cmdBuildLocalClusters}`, () => createEnvironment.createLocalEnvironment()
);

let connectedClustersProvider = new connectedClusters.ConnectedClustersProvider();
vscode.window.registerTreeDataProvider('connectedClusters', connectedClustersProvider);
vscode.commands.registerCommand('connectedClusters.refresh', () => connectedClustersProvider.refresh());

// EXPORTS
export function activate(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		cmdNewProjectDisposable, // command: ocm-vscode-extension.ocmNewProject
		cmdVerifyToolsDisposable, // command: ocm-vscode-extension.verifyTools
		cmdBuildLocalClusterDisposable // command: ocm-vscode-extension.createLocalEnvironment
	);
}
