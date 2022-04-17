import cluster from 'cluster';
import { resolve } from 'path';
import * as shell from 'shelljs' ;
import * as env from './environment';
import * as vscode from 'vscode';

shell.config.execPath = String(shell.which('node'));

// execute a command and return a promise of the output as string
export function executeShellCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
		let execution = shell.exec(command);
		if (execution.code === 0) {
			resolve(execution.stdout);
		}
		reject(execution.stderr);
	});
}

// check if a cli tool exists and return a promise
export  function checkToolExists(tool: string): Promise<void> {
	return new Promise((resolve, reject) => {
		let execution = shell.exec(`command -v ${tool}`);
		if (execution.code === 0) {
			resolve();
		}
		reject();
	});
}

export async function sleep(ms: number): Promise<void> {
	return new Promise((resolve, _reject) => setTimeout(() => resolve(), ms));
}


// init kind clusters 
function initClusters(clusters: Array<env.Cluster>): Promise<string> {

	console.log('creating clusters');
	return new Promise ((resolve, reject) => { 
		clusters.forEach(cluster => {
			let res = shell.exec('kind create cluster --name ' + cluster.clusterName);
			if ( res.code === 0) { 

				console.log( cluster.clusterName + ' cluster created ');
				resolve("done");
			} 	
			reject(res.stderr);
		});
	} ); 
}

// init hub cluster and return join command 
function initHub(): Promise<string> {
	console.log('init hub');
	return new Promise ((resolve, reject) => {
		let res = shell.exec(`kubectl config use ${env.hubContext} && clusteradm init --use-bootstrap-token`).grep('clusteradm');
		if ( res.code === 0) { 		
			resolve(res);
		} 	
		reject(res.stderr);
	});
}

// join spoke clusters 
function joinClusters(joinCmd: string , clusters: Array<env.Cluster>) : Promise<string> {

	return new Promise ((resolve, reject) => {

		clusters.filter( cluster => cluster.type === "Spoke").forEach(cluster => {
			console.log('init Join ' + cluster.clusterName + ' to hub');
			shell.exec(`kubectl config use ${cluster.clusterContext}`);
			let fullJoinCmd = shell.echo(joinCmd + ` --force-internal-endpoint-lookup --wait`).sed('<cluster_name>', cluster.clusterName).sed('\n', ' ').toString().replace(/(\r\n|\n|\r)/gm, "");
			let res = shell.exec(fullJoinCmd); 
			if ( res.code === 0) { 		
				resolve(res);
			} 	
			reject(res.stderr);
			
		});

	});

}

// hub approve spokes 
function approveClusters(clusters: Array<env.Cluster> ) : Promise<string> {

	return new Promise ((resolve, reject) => {
		clusters
		.filter( cluster =>	cluster.type === "Hub")
		.forEach(cluster => {		 
			shell.exec(`kubectl config use  ` + cluster.clusterContext );
		});
	
	
		clusters
			.filter( cluster => cluster.type === "Spoke")
			.forEach(cluster => {
				console.log('Accept join of: ' + cluster.clusterName );
				let res = shell.exec(`clusteradm accept --clusters ` + cluster.clusterName );
				if ( res.code === 0) { 		
					resolve(res);
				} 	
				reject(res.stderr);				
		});
		resolve("done");
	});
}



// starts a local OCM kind env and return a promise
export function buildLocalEnv( progress: vscode.Progress<{
	message?: string | undefined;
	increment?: number | undefined;
}> ): Promise<void>
{
// TODO - check docker/podman engine is active

return new Promise ( async (resolve, reject) => { 
	try { 
		progress.report( { increment: 5 , message: "creating kind clusters (2 min)" }); 
		await sleep(1000); 			
		await initClusters(env.clusters);

		progress.report( { increment: 5 , message: "init hub cluster (1.5 min)" }); 
		await sleep(1000); 	
		const joinCmd = await initHub(); 	

		progress.report( { increment: 5 , message: "join spoke clusters (1.5 min)" }); 
		await sleep(1000); 				
		await joinClusters(joinCmd, env.clusters );	

		progress.report( { increment: 5 , message: "approve clusters (1 min)" }); 
		await sleep(1000); 	

		await approveClusters(env.clusters);
		progress.report({ increment: 100 , message: "Completed" }); 
		await sleep(10000);

		resolve();
		
	}
	catch(err) {
		reject(err);
	}
});

}
