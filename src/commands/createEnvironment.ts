import * as build from '../utils/build';
import * as environment from '../utils/environment';
import * as lodash from 'lodash';
import * as vscode from 'vscode';

export enum YesNo {
	yes = 'Yes',
	no = 'No'
}

async function gatherClustersInfo(): Promise<build.Cluster[]> {
	return new Promise(async (resolve, _reject) => {
		// clusters array for creation
		let clusters: build.Cluster[] = [];

		// get the hub cluster name from the user
		let hubClusterName: string = await vscode.window.showInputBox({
			title: 'hub cluster name?',
			placeHolder: 'hub'
		}) || 'hub';
		// add a hub cluster to the clusters array
		clusters.push({
			name: hubClusterName,
			context: `kind-${hubClusterName}`,
			type: build.ClusterType.hub
		});
		// ask the user how many managed clusters are required
		let managedClusterTotal: number = Number(await vscode.window.showInputBox({
			title: 'how many managed clusters?',
			placeHolder: '2',
			validateInput: (input: string) => {
				if (Number.isNaN(Number(input.trim()))) {
					return input; // only accept numbers
				}
				return undefined; // return undefined/null/empty for validation.
			}
		}) || '2');
		// offer to use standard naming for the managed clusters, ie cluster1..cluster37
		let standardNaming: string = await vscode.window.showQuickPick(
			[YesNo.yes, YesNo.no], {
			title: 'name managed clusters clusterX ?',
			placeHolder: YesNo.yes
		}) || YesNo.yes;

		if (standardNaming === YesNo.yes) {
			// add managed clusters with default names to the cluster array
			for (let idx = 1; idx <= managedClusterTotal; idx++) {
				let clusterName = `cluster${idx}`;
				clusters.push({
					name: clusterName,
					context: `kind-${clusterName}`,
					type: build.ClusterType.managed
				});
			}
		} else {
			// get managed clusters names from the user and add to clusters array
			for (let idx = 1; idx <= managedClusterTotal; idx++) {
				let defaultName = `cluster${idx}`;
				let clusterName: string = await vscode.window.showInputBox({
					title: `managed cluster number ${idx} name?`,
					placeHolder: defaultName
				}) || defaultName;
				clusters.push({
					name: clusterName,
					context: `kind-${clusterName}`,
					type: build.ClusterType.managed
				});
			}
		}
		// remove clusters with same name on the way out
		resolve(lodash.uniqBy(clusters, c => c.name));
	});
}

export async function createLocalEnvironment(): Promise<void> {
	// offer the user to use the default 3 cluster configuration,
	// 1 hub cluster named hub and 2 managed cluster named cluster1/2
	let useDefaults: string = await vscode.window.showQuickPick(
		[YesNo.yes, YesNo.no], {
			title: `use default configuration, 1 hub and 2 managed clusters?`,
			placeHolder: YesNo.yes
		}) || YesNo.yes;

	// clusters array for creation
	let clusters: build.Cluster[] = [];

	if (useDefaults === YesNo.yes) {
		// use default cluster configuration
		clusters = build.defaultClusters;
	} else {
		// gather cluster configuration from the user
		clusters = await gatherClustersInfo();
	}

	// build the local environment
	await vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			title: 'Creating local environment',
			cancellable: false
		},
		async (progress) => {
			progress.report({increment: 0, message: 'verifying the required tools existence' });
			// verify the required tool exists
			environment.verifyTools(...environment.requiredTools)
				.then(async () => {
					progress.report({increment: 20, message: 'starting to build your local environment'});
					// build the environment
					build.buildLocalEnv(clusters, (r: build.ProgressReport) => progress.report(r))
						.then((msg: string) => vscode.window.showInformationMessage(msg))
						.catch((err: string | Error) =>
							vscode.window.showErrorMessage(err instanceof Error ? err.name : err));
				})
				.catch((stderrs: string[]) => {
					stderrs.forEach((err) => console.error(err));
					progress.report({increment: 100, message: 'unable to verify the existence of the required tools' });
					vscode.window.showErrorMessage(
						'OCM extension, unable to verify the existence of the required tools'
					);
				});
		}
	);
}
