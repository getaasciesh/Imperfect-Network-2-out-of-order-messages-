const runImperfectNetwork = require('./helpers/ImperfectNetwork').runner,
  chai = require('chai'),
  expect = require('chai').expect,
  should = require('chai').should,
  chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

describe("NetworkClient", function(){
  it("should be able to deduplicate and stream data packets in the order the data was sent: 1", function(){
    return expect(runImperfectNetwork([{a: 'A1'},{a: 'A2'},{b: 'B1'},{a: 'A3'}]))
      .to.eventually.deep.equal({a:['B1'], b: ['A1','A2','A3']});
  });
  it("should be able to deduplicate and stream data packets in the order the data was sent: 2", function(){
    return expect(runImperfectNetwork([{b: 'B1'},{a: 'A1'},{b: 'B2'},{a: 'A2'}]))
      .to.eventually.deep.equal({a:['B1','B2'], b: ['A1','A2']});
  });
  it("should be able to deduplicate and stream data packets in the order the data was sent: 3", function(){
    return expect(runImperfectNetwork([{a: 'A1'},{a: 'A2'},{b: 'B1'},{b: 'B2'},{a: 'A3'},{a: 'A4'},{b: 'B3'}]))
      .to.eventually.deep.equal({a:['B1','B2','B3'], b: ['A1','A2','A3','A4']});
  });
  it("should be able to deduplicate and stream data packets in the order the data was sent: 4", function(){
    return expect(runImperfectNetwork([{a: 'A1'},{b: 'B1'},{a: 'A2'},{a: 'A3'},{b: 'B2'},{b: 'B3'},{b: 'B4'}]))
      .to.eventually.deep.equal({a:['B1','B2','B3','B4'], b: ['A1','A2','A3']});
  });
});
