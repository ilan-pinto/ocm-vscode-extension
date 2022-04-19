import * as environment from '../utils/environment';
import * as vscode from 'vscode';
import * as shell from '../utils/shell';

export async  function buildLocalClusters() {	
	await vscode.window.withProgress({
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
				await shell.buildLocalEnv(progress);		
		
			} 
			catch(error){  	
				vscode.window.showErrorMessage("Unable to build local env:" + error ); 
				console.log("Unable to build local env:" + error);
					
			};		   
		}	
		
	);	
	
}
