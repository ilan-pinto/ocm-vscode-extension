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
	shell.executeShellCommand('clusteradm version')
		.then(stdout => {
			let clusteradmVersion = stdout.split(':')[1].trim();
            vscode.window.showInformationMessage(`OCM extension, clusteradm version is: ${clusteradmVersion}`);
		})
		.catch(stderr => vscode.window.showErrorMessage(`OCM extension, unable to detect clusteradm version: ${stderr}`));
}
