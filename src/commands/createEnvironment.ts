import * as environment from '../utils/environment';
import * as vscode from 'vscode';
import * as shell from '../utils/shell';
import { resolve } from 'path';

export async  function buildLocalClusters() {	
	await vscode.window.withProgress(
		{
		  location: vscode.ProgressLocation.Notification,
		  title: 'Local OCM Cluster',
		  cancellable: false,
		},
		async (progress) => {
			try{

				for (let i = 0; i < 3; i++) {
					progress.report({ increment: 10*i , message: "verifying tools" }) ;	
					await shell.sleep(1000);
				};	

				await environment.verifyTools(...environment.requiredTools); 
				
				for (let i = 3; i < 5; i++) {
					progress.report({ increment: 5 , message: "Starting Process" }) ;	
					await shell.sleep(1000);
				};
				
				await shell.buildLocalEnv(progress);		
		
			} 
			catch(error){  	
				vscode.window.showErrorMessage("Unable to build local env:" + error ); 
				console.log("Unable to build local env:" + error);
					
			};		   
		}	
		
	);	
	
}
