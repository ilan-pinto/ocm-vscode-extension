import * as createEnvironment from './commands/createEnvironment';
import * as newProject from './commands/newProject';
import * as verifyEnvironment from './commands/verifyEnvironment';
import * as vscode from 'vscode';
import { ConnectedClustersProvider } from './providers/connectedClusters';

export function activate(context: vscode.ExtensionContext): void {
	let connectedClustersProvider = new ConnectedClustersProvider();
	context.subscriptions.push(
		vscode.commands.registerCommand(
			'ocm-vscode-extension.ocmNewProject', () => newProject.create()),
		vscode.commands.registerCommand(
			'ocm-vscode-extension.verifyTools', () => verifyEnvironment.verifyTools()),
		vscode.commands.registerCommand(
			'ocm-vscode-extension.createLocalEnvironment', () => createEnvironment.createLocalEnvironment()),
		vscode.window.registerTreeDataProvider(
			'ocm-vscode-extension.connectedClustersView', connectedClustersProvider),
		vscode.commands.registerCommand(
			'ocm-vscode-extension.connectedClustersView.refresh', () => connectedClustersProvider.refresh())
	);
}
