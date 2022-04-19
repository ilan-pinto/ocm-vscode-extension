import { expect, use as chaiUse } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { beforeEach } from 'mocha';
import * as sinon from 'sinon';
import * as buildTools from '../src/utils/build';

chaiUse(chaiAsPromised);

suite('Test cases for the build utility functions', () => {
	beforeEach(() => sinon.restore()); // unwrap previously wrapped sinon objects

	suite('Testing local environment creation ', () => {
		test('When initializing cluster, the promise should be resolved', async () => {
			// TODO: impelement unit test
			expect(true).to.be.true;
		} );

		test('When initializing cluster and cluster name exists, the promise should be rejected', async () => {
			// TODO: impelement unit test
			expect(true).to.be.true;
		} );

		test('When initializing hub, the promise should be resolved and return a string', async () => {
			// TODO: impelement unit test
			expect(true).to.be.true;
		} );

		test('When joining clusters spoke , the promise should be resolved and all clusters should be joined' , async () => {
			// TODO: impelement unit test
			expect(true).to.be.true;
		} );

		test('When joining clusters and no spoke ,  promise should be approved  and all clusters should be joined' , async () => {
			// TODO: impelement unit test
			expect(true).to.be.true;
		} );

		test('When approving clusters and no spoke , the promise should be rejected' , async () => {
			// TODO: impelement unit test
			expect(true).to.be.true;
		} );

		test('When approving clusters and no spoke , the promise should be rejected' , async () => {
			// TODO: impelement unit test
			expect(true).to.be.true;
		} );
	});
});
