import { expect, use as chaiUse } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { beforeEach } from 'mocha';
import * as sinon from 'sinon';
import { buildLocalEnv, Cluster, ClusterType, ProgressReport } from '../src/utils/build';
import * as shellTools from '../src/utils/shell';

chaiUse(chaiAsPromised);

suite('Test cases for the build utility functions', () => {
	var shellExecutionStub: sinon.SinonStub;

	const dummyHubCluster1: Cluster = {
		name: 'dummyHub1',
		context: 'kind-dummyHub1',
		type: ClusterType.hub
	};

	const dummyHubCluster2: Cluster = {
		name: 'dummyHub2',
		context: 'kind-dummyHub2',
		type: ClusterType.hub
	};

	const dummyManagedCluster1: Cluster = {
		name: 'dummyCluster1',
		context: 'kind-dummyCluster1',
		type: ClusterType.managed
	};

	const dummyManagedCluster2: Cluster = {
		name: 'dummyCluster2',
		context: 'kind-dummyCluster2',
		type: ClusterType.managed
	};

	const fullClusterList = [dummyHubCluster1, dummyManagedCluster1, dummyManagedCluster2];

	beforeEach(() => {
		sinon.restore(); // unwrap previously wrapped sinon objects
		shellExecutionStub = sinon.stub(shellTools, 'executeShellCommand'); // stub shell execution utility function
		sinon.stub(console, 'debug'); // silence debug logs
	});

	suite('Testing buildLocalEnv', () => {
		test('When building with no hubs, the build should be rejected', async () => {
			let fakeProgressReporter = sinon.fake(); // fake progress reporter
			// given the requested cluster list contains two managed clusters and no hub cluster
			let clusters = [dummyManagedCluster1, dummyManagedCluster2];
			return Promise.all([
				// then the build should be rejected
				expect(buildLocalEnv(clusters, fakeProgressReporter))
					.to.eventually.be.rejectedWith('OCM extension, required 1 hub and at least 1 managed cluster, found 0 and 2'),
				// then the progress reporter should be incremented fully
				expect(fakeProgressReporter.firstCall.firstArg)
					.to.contain({increment: 100 , message: 'required 1 hub and at least 1 managed cluster, found 0 and 2'})
			]);
		});

		test('When building with more the one hub, the build should be rejected', async () => {
			let fakeProgressReporter = sinon.fake(); // fake progress reporter
			// given the requested cluster list contains two hub clusters
			let clusters = [dummyHubCluster1, dummyHubCluster2, dummyManagedCluster1];
			return Promise.all([
				// then the build should be rejected
				expect(buildLocalEnv(clusters, fakeProgressReporter))
					.to.eventually.be.rejectedWith('OCM extension, required 1 hub and at least 1 managed cluster, found 2 and 1'),
				// then the progress reporter should be incremented full
				expect(fakeProgressReporter.firstCall.firstArg)
					.to.contain({increment: 100 , message: 'required 1 hub and at least 1 managed cluster, found 2 and 1'})
			]);
		});

		test('When building with no managed clusters, the build should be rejected', async () => {
			let fakeProgressReporter = sinon.fake(); // fake progress reporter
			// given the requested cluster list contains two hub clusters
			let clusters = [dummyHubCluster1];
			return Promise.all([
				// then the build should be rejected
				expect(buildLocalEnv(clusters, fakeProgressReporter))
					.to.eventually.be.rejectedWith('OCM extension, required 1 hub and at least 1 managed cluster, found 1 and 0'),
				// then the progress reporter should be incremented full
				expect(fakeProgressReporter.firstCall.firstArg)
					.to.contain({increment: 100 , message: 'required 1 hub and at least 1 managed cluster, found 1 and 0'})
			]);
		});

		test('When failed to create kind clusters, the build should be rejected', async () => {
			var fakeProgressReporter = sinon.fake(); // fake progress reporter
			// given kind will fail creating the clusters
			shellExecutionStub
				.withArgs(sinon.match((s: string) => s.startsWith('kind create cluster --name')))
				.rejects('will-always-fail');
			return Promise.all([
				// then the build should be rejected
				expect(buildLocalEnv(fullClusterList, fakeProgressReporter))
					.to.eventually.be.rejectedWith('OCM extension, failed creating kind clusters'),
				// then track the progress of the progress reporter
				expect(fakeProgressReporter.firstCall.firstArg)
					.to.contain({increment: 0 , message: 'creating 3 kind clusters'}),
				// TODO: figure out why only the first call is recorded
			]);
		});
	});
});
