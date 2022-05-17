import * as k8s from '@kubernetes/client-node';
import path = require('path');
import * as vscode from 'vscode';

type EventType = void | ConnectedCluster | null | undefined;

export class ConnectedCluster extends vscode.TreeItem {
	constructor(public readonly cluster: k8s.Cluster) {
		super(cluster.name, vscode.TreeItemCollapsibleState.None);
		this.tooltip = cluster.server;
	}

	iconPath = {
		light: path.join(__dirname, '..', '..', '..', 'images', 'light', 'k8s.svg'),
		dark: path.join(__dirname, '..', '..', '..', 'images', 'dark', 'k8s.svg'),
	};
}

export class ConnectedClustersProvider implements vscode.TreeDataProvider<ConnectedCluster> {
	private kubeConfig = new k8s.KubeConfig();
	private connectedClusters: ConnectedCluster[] = [];
	private _onDidChangeTreeData: vscode.EventEmitter<EventType> = new vscode.EventEmitter<EventType>();
	readonly onDidChangeTreeData: vscode.Event<EventType> = this._onDidChangeTreeData.event;

	constructor() {
		this.updateClusterList();
	}

	refresh(): void {
		this.updateClusterList();
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: ConnectedCluster): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}

	getChildren(_element: ConnectedCluster): vscode.ProviderResult<ConnectedCluster[]> {
		return this.connectedClusters;
	}

	private updateClusterList(): void {
		this.kubeConfig.loadFromDefault();
		this.connectedClusters = this.kubeConfig.clusters.map(cluster => new ConnectedCluster(cluster));
	}
}
