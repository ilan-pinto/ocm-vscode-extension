
import * as shellTools from './shell';

const blankLines = new RegExp(/(^[ \t]*\r?\n)/, "gm");

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
		.then(() => shellTools.executeShellCommand('clusteradm init --use-bootstrap-token'))
		.then((stdout: string) => stdout.replace(blankLines, '').split(/\r?\n/)[2].trim());
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


// log, report, and fulfil the build process
function fulfilBuild(msg: string, reporter: (r: ProgressReport) => void, fulfil: (s: string) => void) {
	console.debug(msg);
	reporter({increment: 100 , message: msg});
	fulfil(`OCM extension, ${msg}`);
}

// starts a local OCM kind env and return a promise
export async function buildLocalEnv(
	clusters: Cluster[], progressReporter: (r: ProgressReport) => void): Promise<string> {

	return new Promise((resolve, reject) => {
		/* ########################## ##
		## ## Verify Clusters Info ## ##
		## ########################## */
		let hubClusters = clusters.filter(c => c.type === ClusterType.hub);
		let managedClusters = clusters.filter(c => c.type === ClusterType.managed);

		if (hubClusters.length !== 1) {
			fulfilBuild(`expect 1 Hub-typed cluster, found ${hubClusters.length}`, progressReporter, reject);
		} else {
			/* ########################## ##
			## ## Create Kind Clusters ## ##
			## ########################## */
			let hubCluster = hubClusters[0];
			progressReporter({increment: 0 , message: `creating ${clusters.length} kind clusters`});
			let clusterPromises = clusters.map(cluster =>
				createKindCluster(cluster)
					.then(stdout => console.log(stdout))
					.catch(stderr => console.log(stderr))
			);

			let kindClustersCreated = Promise.all(clusterPromises);
			kindClustersCreated
				.then(() => {
					/* ################################ ##
					## ## Initialize the Hub Cluster ## ##
					## ################################ */
					progressReporter({increment: 20 , message: `initializing the Hub cluster named ${hubCluster.name}`});
					let hubClusterInitialized = initializeHubCluster(hubCluster);
					hubClusterInitialized
						.then((joinCmd: string) => {
							/* ################################################### ##
							## ## Issue Join Requests from The Managed Clusters ## ##
							## ################################################### */
							progressReporter({increment: 20 , message: 'issuing join requests for the managed clusters'});
							// issue join requests from the managed clusters to the hub
							managedClusters.reduce(
								(previousPromise, currentPromise) =>
									previousPromise.then(() => issueJoinRequest(currentPromise, joinCmd)),
									Promise.resolve('initial value')
							)
							.then(() => {
								/* ################################################ ##
								## ## Accept Join Requests from the Hub Cluster  ## ##
								## ################################################ */
								progressReporter({increment: 20 , message: 'accepting the managed clusters join request from the hub cluster'});
								// accept the issued join commands by the managed clusters from the hub cluster
								acceptJoinRequests(hubCluster, managedClusters)
									.then(() => fulfilBuild('successfully created your local environment, have fun', progressReporter, resolve))
									.catch(() => fulfilBuild('failed to accept join requests', progressReporter, reject));
							})
							.catch(() => fulfilBuild('failed to issue join requests', progressReporter, reject));
						});
					hubClusterInitialized
						.catch(() => fulfilBuild('failed initializing the hub cluster', progressReporter, reject));
				});
			kindClustersCreated
				.catch(() => fulfilBuild('failed creating kind clusters', progressReporter, reject));
		}
	});
}
