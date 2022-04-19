
import * as shellTools from './shell';

export enum ClusterType {
	hub, managed
}

export interface Cluster {
	name: string,
	context: string
	type: ClusterType
}

export interface ProgressReport {
	increment: number,
	message: string
}

export const defaultClusters: Cluster[] = [
	{
		name: 'hub',
		context: 'kind-hub',
		type: ClusterType.hub
	},
	{
		name: 'cluster1',
		context: 'kind-cluster1',
		type: ClusterType.managed
	},
	{
		name: 'cluster2',
		context: 'kind-cluster2',
		type: ClusterType.managed
	},
];

// create a kind cluster, fulfilled with stdout/stderr
async function createKindCluster(cluster: Cluster):  Promise<string> {
	console.debug(`creating a kind cluster named ${cluster.name}`);
	return shellTools.executeShellCommand(`kind create cluster --name ${cluster.name}`);
}

// initialize the hub cluster, resolves with the join command, rejects with the error message
async function initializeHubCluster(hubCluster: Cluster): Promise<string> {
	console.debug(`initializing the hub cluster named ${hubCluster.name}`);
	return shellTools.executeShellCommand(`kubectl config use ${hubCluster.context}`)
		// TODO: replace shell's grep with code to avoid os incompatibility
		.then(() => shellTools.executeShellCommand('clusteradm init --use-bootstrap-token | grep clusteradm'));
}

// issue a join command from a managed cluster using a join command
async function issueJoinRequest(managedCluster: Cluster, joinCmd: string): Promise<string> {
	console.debug(`issuing a join request from the managed cluster named ${managedCluster.name}`);
	let fixedJoinCmd = joinCmd.replace('<cluster_name>', managedCluster.name).trim();
	return shellTools.executeShellCommand(`kubectl config use ${managedCluster.context}`)
		.then(() => shellTools.executeShellCommand(`${fixedJoinCmd} --force-internal-endpoint-lookup --wait`));
}

// approve join request made to the hub cluster by the managed clusters
async function acceptJoinRequests(hubCluster: Cluster, managedClusters: Cluster[]) : Promise<string> {
	let managedClustersName = managedClusters.map(mc => mc.name).join();
	console.debug(`accepting the managed clusters ${managedClustersName} on behalf of the hub cluster named ${hubCluster.name}`);
	return shellTools.executeShellCommand(`kubectl config use ${hubCluster.context}`)
		.then(() => shellTools.executeShellCommand(`clusteradm accept --clusters ${managedClustersName} --wait`));
}

// starts a local OCM kind env and return a promise
export async function buildLocalEnv(
	clusters: Cluster[], progressReporter: (r: ProgressReport) => void): Promise<string> {

	console.debug('starting local development environment build');
	return new Promise((resolve, reject) => {
		let hubClusters = clusters.filter(c => c.type === ClusterType.hub);
		let managedClusters = clusters.filter(c => c.type === ClusterType.managed);

		if (hubClusters.length !== 1) {
			console.debug('only 1 hub is supported/required');
			progressReporter({increment: 100 , message: 'expect 1 Hub-typed cluster, found ${hubClusters.length}`'});
			reject(`OCM extension, expect 1 Hub-typed cluster, found ${hubClusters.length}`);
		} else {
			let hubCluster = hubClusters[0];
			// create kind clusters
			progressReporter({increment: 0 , message: `creating ${clusters.length} kind clusters`});
			let clusterPromises = clusters.map(cluster =>
				createKindCluster(cluster)
					.then(stdout => console.log(stdout))
					.catch(stderr => console.log(stderr))
			);
			Promise.all(clusterPromises)
				.then(() => {
					console.debug('created kind clusters successfully');
					progressReporter({increment: 20 , message: `initializing the Hub cluster named ${hubCluster.name}`});
					// initializing the hub cluster
					initializeHubCluster(hubCluster)
						.then((joinCmd: string) => {
							console.debug('initialized hub cluster successfully');
							progressReporter({increment: 20 , message: 'issuing join requests for the managed clusters'});
							// issue join requests from the managed clusters to the hub
							managedClusters.reduce(
								(previousPromise, currentPromise) =>
									previousPromise.then(() =>
										issueJoinRequest(currentPromise, joinCmd)), // TODO: loosing the stdout/stderr here
									Promise.resolve('initial value')
							)
							.then(() => {
								console.debug('issued join requests successfully');
								progressReporter({increment: 20 , message: 'accepting the managed clusters join request from the hub cluster'});
								// accept the issued join commands by the managed clusters from the hub cluster
								acceptJoinRequests(hubCluster, managedClusters)
									.then(() => {
										console.debug('accepted join requests successfully');
										progressReporter({increment: 100 , message: 'successfully created your development environment, have fun'});
										// TODO: display the user with information about the created clusters: names/contexts
										resolve('OCM extension, successfully created your development environment, have fun');
									})
									.catch((stderr) => {
										console.debug('failed to accept join requests');
										console.error(stderr);
										progressReporter({increment: 100 , message: 'failed to accept the join request made from the managed clusters'});
										reject('OCM extension, failed to accept the join request made from the managed clusters');
									});
							})
							.catch(() => {
								console.debug('failed to issue join requests');
								progressReporter({increment: 100 , message: 'failed to make join request for the managed clusters'});
								reject('OCM extension, failed to make join request for the managed clusters');
							});
						})
						.catch((stderr: string) => {
							console.debug('failed initializing the hub cluster');
							console.error(stderr);
							progressReporter({increment: 100 , message: 'failed to initialize the hub cluster'});
							reject('OCM extension, failed to initialize the hub cluster');
						});
				})
				.catch(() => {
					console.debug('failed creating kind clusters');
					progressReporter({increment: 100 , message: 'failed to build a local development environment'});
					reject('OCM extension, failed to build a local development environment');
				});
		}
	});
}
