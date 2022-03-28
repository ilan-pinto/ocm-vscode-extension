
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as path from 'path'; 

export function newProjectCommand (project: string ) {

        
        let projectName = project; 

		if(vscode.workspace.workspaceFolders !== undefined) {
			let wf = vscode.workspace.workspaceFolders[0].uri.path ;			
			console.log("Current directory:", wf);	
			let projectFolder = path.join(wf,projectName);
			
			// check if folder exists 
			if (!fs.existsSync(projectFolder)){		
			fs.mkdirSync(projectFolder);
			vscode.window.showInformationMessage('folder created');
		}
			//TODO add errors 
			let templatesFolder = path.resolve(__dirname,'..');
			fse.copy(path.join(templatesFolder, "templates"),projectFolder,
			function (err) {
				if (err) {
				  console.error(err);
				  vscode.window.showInformationMessage('failed creating the project: ' + projectName );
				} else {
				  console.log("success!");	
				  vscode.window.showInformationMessage('OCM template project created: ' + projectName );
				}
			
			});
		}
		else{
			vscode.window.showInformationMessage('no folder. please open project or create workspace ');	
		}	
	}
