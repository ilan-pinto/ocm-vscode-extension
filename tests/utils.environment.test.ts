import { expect, use as chaiUse } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { beforeEach } from 'mocha';
import * as sinon from 'sinon';
import { verifyTools, RequiredTool } from '../src/utils/environment';
import * as shellUtils from '../src/utils/shell';

chaiUse(chaiAsPromised);

suite('Test cases for the environment utility functions', () => {

	const dummyTool1: RequiredTool = {
		'name': 'find-wally',
		'installUrl': 'https://you.can/find/install/instructions/#here'
	};

	const dummyTool2: RequiredTool = {
		'name': 'kill-wally',
		'installUrl': 'https://we.dont/have/install/instructions/#forthat'
	};

	suite('Testing verifyTools', () => {
		var successfulLoggerSpy: sinon.SinonSpy;
		var failedLoggerSpy: sinon.SinonSpy;

		beforeEach(() => {
			sinon.restore();
			successfulLoggerSpy = sinon.spy();
			failedLoggerSpy = sinon.spy();
		});

		test('When verifying with one existing tool, the successful logger should be called', async () => {
			// stub the checkToolExists shell utility to resolve, indicating the for tool was found
			sinon.stub(shellUtils, 'checkToolExists').withArgs(dummyTool1.name).resolves();

			return expect(verifyTools(successfulLoggerSpy, failedLoggerSpy, dummyTool1))
				.to.eventually.be.fulfilled
				.then(() => {
					expect(successfulLoggerSpy.calledOnceWith(
						'OCM extension, all tools are accessible, we\'re good to go')).to.be.true;
					expect(failedLoggerSpy.notCalled).to.be.true;
				});
		});

		test('When verifying with one non-existing tool, the failure logger should be called', async () => {
			// stub the checkToolExists shell utility to reject, indicating the for tool was not found
			sinon.stub(shellUtils, 'checkToolExists').withArgs(dummyTool2.name).rejects();

			return expect(verifyTools(successfulLoggerSpy, failedLoggerSpy, dummyTool2))
				.to.eventually.be.fulfilled // TODO: this should work with rejected and not fulfilled
				.then(() => {
					expect(successfulLoggerSpy.notCalled).to.be.true;
					expect(failedLoggerSpy.calledTwice).to.be.true;
					expect(failedLoggerSpy.firstCall.firstArg).to.equal(`OCM extension, ${dummyTool2.name} is missing, please install it: ${dummyTool2.installUrl}`);
					expect(failedLoggerSpy.lastCall.firstArg).to.equal('OCM extension, we\'re missing some tools');
				});
		});

		test('When verifying with two existing tools, the successful logger should be called', async () => {
			let checkToolExistsStub = sinon.stub(shellUtils, 'checkToolExists');
			// stub the checkToolExists shell utility to resolve for dummyTool1, indicating the for tool was found
			checkToolExistsStub.withArgs(dummyTool1.name).resolves();
			// stub the checkToolExists shell utility to resolve for dummyTool2, indicating the for tool was found
			checkToolExistsStub.withArgs(dummyTool2.name).resolves();

			return expect(verifyTools(successfulLoggerSpy, failedLoggerSpy, dummyTool1))
				.to.eventually.be.fulfilled
				.then(() => {
					expect(failedLoggerSpy.notCalled).to.be.true;
					expect(successfulLoggerSpy.calledOnceWith(
						'OCM extension, all tools are accessible, we\'re good to go')).to.be.true;
				});
		});

		test('When verifying with two tools, but only one exists, the failure logger should be called', async () => {
			let checkToolExistsStub = sinon.stub(shellUtils, 'checkToolExists');
			// stub the checkToolExists shell utility to reject for dummyTool1, indicating the for tool was not found
			checkToolExistsStub.withArgs(dummyTool1.name).rejects();
			// stub the checkToolExists shell utility to resolve for dummyTool2, indicating the for tool was found
			checkToolExistsStub.withArgs(dummyTool2.name).resolves();

			return expect(verifyTools(successfulLoggerSpy, failedLoggerSpy, ...[dummyTool1, dummyTool2]))
				.to.eventually.be.fulfilled // TODO: this should work with rejected and not fulfilled
				.then(() => {
					expect(successfulLoggerSpy.notCalled).to.be.true;
					expect(failedLoggerSpy.calledTwice).to.be.true;
					expect(failedLoggerSpy.firstCall.firstArg).to.equal(`OCM extension, ${dummyTool1.name} is missing, please install it: ${dummyTool1.installUrl}`);
					expect(failedLoggerSpy.lastCall.firstArg).to.equal('OCM extension, we\'re missing some tools');
				});
		});
	});
});
