import * as vscode from 'vscode';
import * as newProject from './commands/newProject';
import * as verifyEnvironment from './commands/verifyEnvironment';
import * as createEnvironment from './commands/createEnvironment';

const extName = 'ocm-vscode-extension';

// COMMAND NAMES
const cmdNewProjectName = 'ocmNewProject';
const cmdVerifyTools = 'verifyTools';
const cmdGetClusteradmVersion = 'getClusteradmVersion';
const cmdBuildLocalClusters = 'createLocalEnvironment';

// DISPOSABLES
const cmdNewProjectDisposable = vscode.commands.registerCommand(
	`${extName}.${cmdNewProjectName}`, () => newProject.create()
);

const cmdVerifyToolsDisposable = vscode.commands.registerCommand(
	`${extName}.${cmdVerifyTools}`, () => verifyEnvironment.verifyTools()
);

const cmdClusteradmVersionDisposable = vscode.commands.registerCommand(
	`${extName}.${cmdGetClusteradmVersion}`, () => verifyEnvironment.getClusteradmVersion()
);

const cmdBuildLocalClusterDisposable = vscode.commands.registerCommand(
	`${extName}.${cmdBuildLocalClusters}`, () => createEnvironment.createLocalEnvironment()
);

// EXPORTS
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		cmdNewProjectDisposable, // command: ocm-vscode-extension.ocmNewProject
		cmdVerifyToolsDisposable, // command: ocm-vscode-extension.verifyTools
		cmdClusteradmVersionDisposable, // command: ocm-vscode-extension.getClusteradmVersion
		cmdBuildLocalClusterDisposable // command: ocm-vscode-extension.createLocalEnvironment
	);
}
