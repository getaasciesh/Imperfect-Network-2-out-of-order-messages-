const NetworkClient = require('../../src/NetworkClient.js');

function randomTimeout() {
  return Math.random()*100;
}

function makeRandomlyDuplicateAndOutOfOrderCalls(fn, onFnCallResolve) {
  const duplicateTimes = Math.floor(Math.random() * 3) + 1  // generate random no. 1 to 3
  var noOfCalls = 0;
  Array.from(Array(duplicateTimes)).forEach(()=>{ //sends duplicate data up to 3 times
    setTimeout(()=>{fn(); onFnCallResolve();}, randomTimeout());
    noOfCalls++;
  })
  return noOfCalls;
}

function ImperfectNetwork(callbackA, callbackB, onSentAll) {
  const network = this;
  this.onSentAll = onSentAll;
  this.toSend = 0; // no of packets to send
  this.clientA = new NetworkClient(
    (data) => {
      this.toSend += makeRandomlyDuplicateAndOutOfOrderCalls(
        network.clientB.recv.bind(network.clientB, data),
        this.updateToSendCount.bind(this)
      );
    }, callbackA);
  this.clientB = new NetworkClient(
    (data) => {
      this.toSend += makeRandomlyDuplicateAndOutOfOrderCalls(
        network.clientA.recv.bind(network.clientA, data),
        this.updateToSendCount.bind(this) );
    }, callbackB);
};

ImperfectNetwork.prototype.updateToSendCount = function() {
  this.toSend--;
  if (!this.toSend) this.onSentAll();
}

function imperfectNetworkRunner(packets){
  const recieved = {a: [], b: []};
  const promise = new Promise((resolve, reject) => {
    const imperfectNetwork = new ImperfectNetwork(
      (data) => { recieved.a.push(data) },
      (data) => { recieved.b.push(data) },
      () => { resolve(recieved); }
    );
    packets.forEach((data)=>{
      if (data.a) imperfectNetwork.clientA.send(data.a);
      if (data.b) imperfectNetwork.clientB.send(data.b);
    });
  })
  return promise;
}

module.exports = {ImperfectNetwork: ImperfectNetwork, runner: imperfectNetworkRunner};
