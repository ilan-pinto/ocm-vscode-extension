import * as environment from '../utils/environment';
import * as shell from '../utils/shell';
import * as vscode from 'vscode';

// verify the required tools exists
export function verifyTools() {
	environment.verifyTools(
		vscode.window.showInformationMessage,
		vscode.window.showErrorMessage,
		...environment.requiredTools);
}

// get clusteradm version
export function getClusteradmVersion(){
	shell.executeShellCommand('echo $(clusteradm version) | grep \'client version\' | cut -d \':\' -f 2 | xargs')
		.then(stdout => vscode.window.showInformationMessage(
			`OCM extension, clusteradm client version is: ${stdout}`))
		.catch(stderr => vscode.window.showErrorMessage(
			`OCM extension, unable to detect clusteradm version: ${stderr}`));
}
