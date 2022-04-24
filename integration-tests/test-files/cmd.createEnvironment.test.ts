import * as buildTools from '../../src/utils/build';
import * as environmentTools from '../../src/utils/environment';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as vscode from 'vscode';
import { use as chaiUse, expect } from 'chai';
import { YesNo } from '../../src/commands/createEnvironment';
import { beforeEach } from 'mocha';

chaiUse(sinonChai);

async function sleep(ms: number): Promise<void> {
	return new Promise((resolve, _reject) => setTimeout(() => resolve(), ms));
}

// Test cases for the the ocm-vscode-extension.ocmNewProject command
suite('Create local environment command Suite', () => {
	var quickPickStub: sinon.SinonStub;
	var infoBoxSpy: sinon.SinonSpy;
	var errorBoxSpy: sinon.SinonSpy;

	const matchDefaultConfigQuickPick = sinon.match(
		op => op['title'] === 'use default configuration, 1 hub and 2 managed clusters?');

	beforeEach(() => {
		sinon.restore(); // unwrap previously wrapped sinon objects
		quickPickStub = sinon.stub(vscode.window, 'showQuickPick'); // stub the show quick pick
		infoBoxSpy = sinon.spy(vscode.window, 'showInformationMessage'); // wrap a spy around the information box
		errorBoxSpy = sinon.spy(vscode.window, 'showErrorMessage'); // wrap a spy around the error box
	});

	suite('Verify with the default configuration', () => {
		beforeEach(() =>
			// given the the user will choose to use the default configuration
			quickPickStub.withArgs([YesNo.yes, YesNo.no], matchDefaultConfigQuickPick).resolves(YesNo.yes));

		test('Selecting to build with the default configuration, the command should be successful', async () => {
			// given all the required tools are installed
			sinon.stub(environmentTools, 'verifyTools').resolves();
			// given the build tool utility function will be resolved with a fake message
			let buildLocalEnvSpy = sinon.stub(buildTools, 'buildLocalEnv').resolves('this is a fake message');
			// when invoking the command
			await vscode.commands.executeCommand('ocm-vscode-extension.createLocalEnvironment');
			// then expect info message to be called
			expect(infoBoxSpy).to.be.calledOnceWith('this is a fake message');
			// then expect the build environment utility function will be invoked with default configuration
			expect(buildLocalEnvSpy).to.be.calledOnceWith(
				buildTools.defaultClusters,
				sinon.match.func
			);
		});

		test('When the required tools for building the environment are missing, the command should fail', async () => {
			sinon.stub(console, 'error'); // TODO: silence the stderr prints (not working)
			// given kind and clusteradm are missing
			sinon.stub(environmentTools, 'verifyTools').rejects(['kind not found', 'clusteradm not found']);
			// when invoking the command
			await vscode.commands.executeCommand('ocm-vscode-extension.createLocalEnvironment');
			// the expect a failure message
			expect(errorBoxSpy).to.be.calledWith('OCM extension, unable to verify the existence of the required tools');
		});

		test('When the required tools are present but the build fails, the command should fail', async () => {
			// given all the required tools are installed
			sinon.stub(environmentTools, 'verifyTools').resolves();
			// given the build tool utility function will be rejected with a fake message
			sinon.stub(buildTools, 'buildLocalEnv').rejects('oops try again');
			// when invoking the command
			await vscode.commands.executeCommand('ocm-vscode-extension.createLocalEnvironment');
			//the expect a failure message
			expect(errorBoxSpy).to.be.calledOnceWith('oops try again');
		});
	});
});
