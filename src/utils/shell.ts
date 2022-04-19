
import * as shell from 'shelljs' ;
import * as env from './environment';
import * as vscode from 'vscode';
import { resolve } from 'path';

shell.config.execPath = String(shell.which('node'));

// execute a command and return a promise of the output as string
export function executeShellCommand(command: string, async: boolean = false): Promise<string> {
    return new Promise((resolve, reject) => {

			if (async) {
				shell.exec(command, (code,stdout,stderr) => {	
						if (code === 0) {
					resolve(stdout);
				}
				reject(stderr);});
			}
			else {
				let execution = shell.exec(command);
				if (execution.code === 0) {
					resolve(execution.stdout);
				}
			reject(execution.stderr);
			}
		}
	);
}



export function switchContext(cluster: env.Cluster) {
	shell.exec(`kubectl config use ${cluster.clusterContext}`);
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
function initClusters(clusters: Array<env.Cluster>):  Promise<void|string[]> {

	console.debug('creating clusters');
	let executionPromises = clusters.map(
		cluster => executeShellCommand('kind create cluster --name ' + cluster.clusterName,true).catch(
			(err) => Promise.reject([`unable to create cluster: ` + cluster.clusterName + ` ` + err ])
		)
	);	
	return Promise.all(executionPromises)
		.then( () => Promise.resolve())
		.catch((err)=> Promise.reject(err)
	);
}

// init hub cluster and return join command  
function initHub(): Promise<string> {
	console.debug('init hub');
	return new Promise ((resolve, reject) => {
		let res = shell.exec(`kubectl config use ${env.hubContext} && clusteradm init --use-bootstrap-token`).grep('clusteradm');
		if ( res.code === 0) { 		
			resolve(res);
		} 	
		reject(res.stderr);
	});
}

// join spoke clusters 
function joinClusters(joinCmd: string , clusters: Array<env.Cluster>) :  Promise<void|string[]> {	

		let executionPromises = clusters.filter( cluster => cluster.type === "Spoke").map(cluster => {
			joinCluster(cluster, joinCmd);			
		});

		return Promise.all(executionPromises)
			.then( () => Promise.resolve())
			.catch((err)=> Promise.reject(err)
	);

}

function joinCluster(cluster: env.Cluster, joinCmd: string): Promise<string> {
	return new Promise( () => { 
		console.debug('init Join ' + cluster.clusterName + ' to hub');
		switchContext(cluster);
		let fullJoinCmd = shell.echo(joinCmd + ` --force-internal-endpoint-lookup --wait`).sed('<cluster_name>', cluster.clusterName).sed('\n', ' ').toString().replace(/(\r\n|\n|\r)/gm, "");
		executeShellCommand(fullJoinCmd);
	});
}

// hub approve spokes 
function approveClusters(clusters: Array<env.Cluster> ) : Promise<void|string[]> {
	// switch context to hub 
	const hub = clusters.find( cluster => cluster.type === "Hub") ;
	if (hub === undefined) 
		{ throw new Error("unable to find hub cluster");
	} 

	
	let executionPromises = clusters
		.filter(cluster => cluster.type === "Spoke")
		.map(cluster => {		
				console.debug('Accept join of: ' + cluster.clusterName);
				switchContext(hub);
				executeShellCommand( `clusteradm accept --clusters ` + cluster.clusterName,true);
	});

	return Promise.all(executionPromises)
		.then( () => Promise.resolve())
		.catch((err)=> Promise.reject(err));

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
