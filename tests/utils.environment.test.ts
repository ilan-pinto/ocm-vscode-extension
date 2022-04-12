import { expect, use as chaiUse } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { beforeEach } from 'mocha';
import * as sinon from 'sinon';
import { parseClusteradmVersion, verifyTools, RequiredTool } from '../src/utils/environment';
import * as shellUtils from '../src/utils/shell';

chaiUse(chaiAsPromised);

suite('Test cases for the environment utility functions', () => {
	var successfulLoggerSpy: sinon.SinonSpy;
	var failedLoggerSpy: sinon.SinonSpy;

	beforeEach(() => {
		sinon.restore(); // unwrap previously wrapped sinon objects
		successfulLoggerSpy = sinon.spy(); // wrap a spy around a successful consumer logger callback
		failedLoggerSpy = sinon.spy(); // wrap a spy around a failed consumer logger callback
	});

	suite('Testing verifyTools', () => {
		// dummy tools used for testing purposes
		const dummyTool1: RequiredTool = {
			'name': 'find-wally',
			'installUrl': 'https://you.can/find/install/instructions/#here'
		};

		const dummyTool2: RequiredTool = {
			'name': 'kill-wally',
			'installUrl': 'https://we.dont/have/install/instructions/#forthat'
		};

		test('When verifying with one existing tool, the successful logger should be called', async () => {
			// given the shell utility will resolve the request, indicating the tool was found
			sinon.stub(shellUtils, 'checkToolExists').withArgs(dummyTool1.name).resolves();
			// then expect the promise to be resolved, the and the message consumers to be called accordingly
			return expect(verifyTools(successfulLoggerSpy, failedLoggerSpy, dummyTool1))
				.to.eventually.be.fulfilled
				.then(() => {
					expect(successfulLoggerSpy.calledOnceWith(
						'OCM extension, all tools are accessible, we\'re good to go')).to.be.true;
					expect(failedLoggerSpy.notCalled).to.be.true;
				});
		});

		test('When verifying with one non-existing tool, the failure logger should be called', async () => {
			// given the shell utility will reject the request, indicating the for tool was NOT found
			sinon.stub(shellUtils, 'checkToolExists').withArgs(dummyTool2.name).rejects();
			// then expect the promise to be rejected, the and the message consumers to be called accordingly
			return expect(verifyTools(successfulLoggerSpy, failedLoggerSpy, dummyTool2))
				.to.eventually.be.rejected
				.then(() => {
					expect(successfulLoggerSpy.notCalled).to.be.true;
					expect(failedLoggerSpy.calledTwice).to.be.true;
					expect(failedLoggerSpy.firstCall.firstArg).to.equal(`OCM extension, ${dummyTool2.name} is missing, please install it: ${dummyTool2.installUrl}`);
					expect(failedLoggerSpy.lastCall.firstArg).to.equal('OCM extension, we\'re missing some tools');
				});
		});

		test('When verifying with two existing tools, the successful logger should be called', async () => {
			// given the shell utility will resolve for both requests, indicating the both tools were found
			let checkToolExistsStub = sinon.stub(shellUtils, 'checkToolExists');
			checkToolExistsStub.withArgs(dummyTool1.name).resolves();
			checkToolExistsStub.withArgs(dummyTool2.name).resolves();
			// then expect the promise to be resolved, the and the message consumers to be called accordingly
			return expect(verifyTools(successfulLoggerSpy, failedLoggerSpy, dummyTool1))
				.to.eventually.be.fulfilled
				.then(() => {
					expect(failedLoggerSpy.notCalled).to.be.true;
					expect(successfulLoggerSpy.calledOnceWith(
						'OCM extension, all tools are accessible, we\'re good to go')).to.be.true;
				});
		});

		test('When verifying with two tools, but only one exists, the failure logger should be called', async () => {
			// given the shell utility will reject one request and resolve the other, indicating only one tool was found
			let checkToolExistsStub = sinon.stub(shellUtils, 'checkToolExists');
			checkToolExistsStub.withArgs(dummyTool1.name).rejects();
			checkToolExistsStub.withArgs(dummyTool2.name).resolves();
			// then expect the promise to be rejected, the and the message consumers to be called accordingly
			return expect(verifyTools(successfulLoggerSpy, failedLoggerSpy, ...[dummyTool1, dummyTool2]))
				.to.eventually.be.rejected
				.then(() => {
					expect(successfulLoggerSpy.notCalled).to.be.true;
					expect(failedLoggerSpy.calledTwice).to.be.true;
					expect(failedLoggerSpy.firstCall.firstArg).to.equal(`OCM extension, ${dummyTool1.name} is missing, please install it: ${dummyTool1.installUrl}`);
					expect(failedLoggerSpy.lastCall.firstArg).to.equal('OCM extension, we\'re missing some tools');
				});
		});
	});

	suite('Testing parseClusteradmVersion', () => {
		// dummy "clusteradm version" output
		const outputConnectedServer = `client version	:v0.2.0
		server version	:v1.2.3`;

		test('When clusteradm is installed and connected to a server, both client and server versions should be displayed', async () => {
			// given the clusteradm tool exists
			sinon.stub(shellUtils, 'checkToolExists').withArgs('clusteradm').resolves();
			// given the version command will resolved to a correct output
			sinon.stub(shellUtils, 'executeShellCommand').withArgs('clusteradm version').resolves(outputConnectedServer);
			// then expect the promise to be resolved, the and the message consumers to be called accordingly
			return expect(parseClusteradmVersion(successfulLoggerSpy, failedLoggerSpy))
				.to.eventually.be.fulfilled
				.then(() => {
					expect(successfulLoggerSpy.calledTwice).to.be.true;
					expect(successfulLoggerSpy.firstCall.firstArg).to.equal(
						'OCM extension, found clusteradm client version v0.2.0'
					);
					expect(successfulLoggerSpy.lastCall.firstArg).to.equal(
						'OCM extension, found clusteradm server version v1.2.3'
					);
					expect(failedLoggerSpy.notCalled).to.be.true;
				});
		});

		test('When failed to get clusteradm version, the reject error should be displayed', async () => {
			// given the clusteradm tool exists
			sinon.stub(shellUtils, 'checkToolExists').withArgs('clusteradm').resolves();
			// given the version command will rejected with a custom error
			let rejectMessage = 'You are not elias\'s younger brother';
			sinon.stub(shellUtils, 'executeShellCommand').withArgs('clusteradm version').rejects(rejectMessage);
			// then expect the promise to be rejected, the and the message consumers to be called accordingly
			return expect(parseClusteradmVersion(successfulLoggerSpy, failedLoggerSpy))
				.to.eventually.be.rejected
				.then(() => {
					expect(successfulLoggerSpy.notCalled).to.be.true;
					expect(failedLoggerSpy.calledOnceWith(
						`OCM extension, unable to detect clusteradm version: ${rejectMessage}`
					)).to.be.true;
				});
		});

		test('When clusteradm is not installed, an error should be displayed', async () => {
			// given the clusteradm tool does NOT exists
			sinon.stub(shellUtils, 'checkToolExists').withArgs('clusteradm').rejects();
			// then expect the promise to be rejected, the and the message consumers to be called accordingly
			return expect(parseClusteradmVersion(successfulLoggerSpy, failedLoggerSpy))
				.to.eventually.be.rejected
				.then(() => {
					expect(successfulLoggerSpy.notCalled).to.be.true;
					expect(failedLoggerSpy.calledOnceWith('OCM extension, looks like clusteradm is not installed')).to.be.true;
				});
		});
	});
});
