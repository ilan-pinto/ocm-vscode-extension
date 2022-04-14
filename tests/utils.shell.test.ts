import { expect, use as chaiUse } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { beforeEach } from 'mocha';
import * as shell from 'shelljs';
import * as sinon from 'sinon';
import { checkToolExists, executeShellCommand } from '../src/utils/shell';

chaiUse(chaiAsPromised);

suite('Test cases for the shell utility functions', () => {
	beforeEach(() => sinon.restore()); // unwrap any previously wrapped sinon objects

	suite('Testing checkToolExists', () => {
		test('When checking with an existing tool, the promise should be resolved', async () => {
			// @ts-ignore given the command in question exists
			sinon.stub(shell, 'exec').withArgs('command -v existing-tool').returns({code: 0});
			// then expect the promise to be resolved
			return expect(checkToolExists('existing-tool')).to.eventually.be.fulfilled;
		});

		test('When checking with a non-existing tool, the promise should be rejected', async () => {
			// @ts-ignore given the command in question doesn't exist
			sinon.stub(shell, 'exec').withArgs('command -v non-existing-tool').returns({code: 999});
			// then expect the promise to be rejected
			return expect(checkToolExists('non-existing-tool')).to.eventually.be.rejected;
		});
	});

	suite('Testing executeShellCommand', () => {
		test('When executing a successful command, the promise should be resolved', async () => {
			let dummyCommand = 'dummy-successful-command';
			let dummySuccessExecution = {code: 0, stdout: 'all is good in the hood'}; // note stdout and not stderr
			// @ts-ignore given the dummy success execution will return for the dummy command
			sinon.stub(shell, 'exec').withArgs(dummyCommand).returns(dummySuccessExecution);
			// then expect the promise to be resolved with the standard output from the succeeded execution
			return expect(executeShellCommand(dummyCommand))
				.to.eventually.be.fulfilled.and.equal(dummySuccessExecution.stdout);
		});

		test('When executing a failed command, the promise should be rejected', async () => {
			let dummyCommand = 'dummy-failed-command';
			let dummyFailedExecution = {code: 999, stderr: 'oh my god they killed kenny'}; // note stderr and not stdout
			// @ts-ignore given the dummy failed execution will return for the dummy command
			sinon.stub(shell, 'exec').withArgs(dummyCommand).returns(dummyFailedExecution);
			// then expect the promise to be rejected with the error output from the failed execution
			return expect(executeShellCommand(dummyCommand))
				.to.eventually.be.rejectedWith(dummyFailedExecution.stderr);
		});
	});
});
