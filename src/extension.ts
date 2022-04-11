import * as vscode from 'vscode';
import * as newProject from './commands/newProject';
import * as build from './commands/buildLocalEnv';
import * as clusteradm from './utils/clusteradm';

const extName = 'ocm-vscode-extension';
// COMMAND NAMES
const cmdNewProjectName = 'ocmNewProject';
const cmdClusteradmVerison = 'clusteradmVersion';
const cmdValidatePrereq = 'validateEnvPrereq';
const cmdBuildLocalCluster = 'buildLocalCluster';

// DISPOSABLES
const cmdNewProjectDisposable = vscode.commands.registerCommand(
	`${extName}.${cmdNewProjectName}`, () => newProject.create()
);
const cmdClusteradmVerisonDisposable = vscode.commands.registerCommand(
	`${extName}.${cmdClusteradmVerison}`, () => clusteradm.checkClusteradmVersion()
);
const cmdValidatePrereqDisposable = vscode.commands.registerCommand(
	`${extName}.${cmdValidatePrereq}`, () => build.validatePrereq()
);

const cmdBuildLocalClusterDisposable = vscode.commands.registerCommand(
	`${extName}.${cmdBuildLocalCluster}`, () => build.buildLocalCluster()
);


// EXPORTS
export function activate(context: vscode.ExtensionContext) {
	 // command: ocm-vscode-extension.ocmNewProject
	context.subscriptions.push(cmdNewProjectDisposable, cmdClusteradmVerisonDisposable, cmdValidatePrereqDisposable, cmdBuildLocalClusterDisposable);
}
