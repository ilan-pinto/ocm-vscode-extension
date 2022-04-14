import * as environment from '../utils/environment';
import * as vscode from 'vscode';

// verify the required tools exists
export function verifyTools() {
	environment.verifyTools(...environment.requiredTools)
		// @ts-ignore
		.then((msg: string) => vscode.window.showInformationMessage(msg))
		.catch((msg: string[]) => vscode.window.showErrorMessage(msg[0], "Install Instructions")
			.then(answer => {
				if (answer === "Install Instructions") {
					vscode.env.openExternal(vscode.Uri.parse(msg[1]));
				}
			}));
}

// get clusteradm version
export function getClusteradmVersion() {
	environment.parseClusteradmVersion()
		// @ts-ignore
		.then((msgs: string[]) => msgs.forEach(msg => vscode.window.showInformationMessage(msg)))
		.catch((msg: string) => vscode.window.showErrorMessage(msg));
}
