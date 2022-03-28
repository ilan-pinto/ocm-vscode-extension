import * as vscode from 'vscode';
import * as newProject from './commands/newProject' ;

// called on actication of the extension
export function activate(context: vscode.ExtensionContext) {
	// register new-project command
	let disposable = vscode.commands.registerCommand('ocm-vs-extension.ocmNewProject', async () => {
		 // project name defaults "ocm-application"
		let projectFolder = await vscode.window.showInputBox({
			placeHolder: "insert project name"
		}) || "ocm-application";
		// subscribe the command execution
		newProject.create(projectFolder);
		context.subscriptions.push(disposable);
	});
}

// called on deactivation of the extension
export function deactivate() {
	// no deactivate actions required
}
