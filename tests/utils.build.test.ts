import { expect, use as chaiUse } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { beforeEach } from 'mocha';
import * as sinon from 'sinon';
import { buildLocalEnv, Cluster, ClusterType } from '../src/utils/build';
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

	const dummyManagedCluster1: Cluster = 		{
		name: 'dummyCluster1',
		context: 'kind-dummyCluster1',
		type: ClusterType.managed
	};

	const dummyManagedCluster2: Cluster = 		{
		name: 'dummyCluster2',
		context: 'kind-dummyCluster2',
		type: ClusterType.managed
	};

	const fullClusterList = [dummyHubCluster1, dummyManagedCluster1, dummyManagedCluster2];

	beforeEach(() => {
		sinon.restore(); // unwrap previously wrapped sinon objects
		//shellExecutionStub = sinon.stub(shellTools, 'executeShellCommand'); // stub shell execution utility function
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
					.to.eventually.be.rejectedWith('OCM extension, expect 1 Hub-typed cluster, found 0'),
				// then the progress reporter should be incremented fully
				expect(fakeProgressReporter.firstCall.firstArg)
					.to.contain({increment: 100 , message: 'expect 1 Hub-typed cluster, found 0'})
			]);
		});

		test('When building with more the one hub, the build should be rejected', async () => {
			let fakeProgressReporter = sinon.fake(); // fake progress reporter
			// given the requested cluster list contains two hub clusters
			let clusters = [dummyHubCluster1, dummyHubCluster2];
			return Promise.all([
				// then the build should be rejected
				expect(buildLocalEnv(clusters, fakeProgressReporter))
					.to.eventually.be.rejectedWith('OCM extension, expect 1 Hub-typed cluster, found 2'),
				// then the progress reporter should be incremented full
				expect(fakeProgressReporter.firstCall.firstArg)
					.to.contain({increment: 100 , message: 'expect 1 Hub-typed cluster, found 2'})
			]);
		});
	});
});
