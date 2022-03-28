// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as path from 'path'; 
import * as command from './commands/newproject' ;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {   
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)


	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('ocm-vs-extension.ocmNewProject', async () => {
	
		const folder = await vscode.window.showInputBox(
					{	
				placeHolder: "insert project name"
			}
		) || "ocm-application"; // check project name if empty set default "ocm-application"
		
		command.newProjectCommand(folder);
		context.subscriptions.push(disposable);

	}
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
