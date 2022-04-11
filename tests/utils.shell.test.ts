import { expect, use as chaiUse } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { beforeEach } from 'mocha';
import * as shell from 'shelljs';
import * as sinon from 'sinon';
import { checkToolExists, executeShellCommand } from '../src/utils/shell';

chaiUse(chaiAsPromised);

suite('Test cases for the shell utility functions', () => {

	suite('Testing checkToolExists', () => {
		beforeEach(() => sinon.restore());

		test('When checking with an existing tool, the promise should be fulfilled', async () => {
			// @ts-ignore
			sinon.stub(shell, 'exec').withArgs('command -v existing-tool').returns({code: 0});
			return expect(checkToolExists('existing-tool')).to.eventually.be.fulfilled;
		});

		test('When checking with a non-existing tool, the promise should be rejected', async () => {
			// @ts-ignore
			sinon.stub(shell, 'exec').withArgs('command -v non-existing-tool').returns({code: 999});
			return expect(checkToolExists('non-existing-tool')).to.eventually.be.rejected;
		});
	});

	suite('Testing executeShellCommand', () => {
		beforeEach(() => sinon.restore());

		test('When executing a successful command, the promise should be fulfilled with the stdout', async () => {
			let dummyCommand = 'dummy-successful-command';
			let dummyExecution = {code: 0, stdout: 'all is good in the hood'}; // note stdout and not stderr
			// @ts-ignore
			sinon.stub(shell, 'exec').withArgs(dummyCommand).returns(dummyExecution);
			return expect(executeShellCommand(dummyCommand)).to.eventually.be.fulfilled.and.equal(dummyExecution.stdout);
		});

		test('When executing a failed command, the promise should be rejected with the stderr', async () => {
			let dummyCommand = 'dummy-failed-command';
			let dummyExecution = {code: 999, stderr: 'oh my god they killed kenny'}; // note stderr and not stdout
			// @ts-ignore
			sinon.stub(shell, 'exec').withArgs(dummyCommand).returns(dummyExecution);
			return expect(executeShellCommand(dummyCommand)).to.eventually.be.rejectedWith(dummyExecution.stderr);
		});
	});
});
