import * as valid from '../utils/clusteradm';
import * as vscode from 'vscode';

//validate local env prerequisites
export function validatePrereq() {

    const mandatoryCommands = ['kubectl', 'clusteradm','kind' ];
    const optionalCommands = ['oc'];

	Promise.all(mandatoryCommands.map(cmd => {
		valid.checkCommandExists(cmd)
			.then(() => vscode.window.showInformationMessage(`ocm extension found command ${cmd}`))
			.catch(() => vscode.window.showErrorMessage(`ocm extension did not found command ${cmd}`));
		})
	)
	.then(() => vscode.window.showInformationMessage('ocm extension has found all of the required commands'))
	.catch(() => vscode.window.showErrorMessage('ocm extension did not all of the required commands'));
}
