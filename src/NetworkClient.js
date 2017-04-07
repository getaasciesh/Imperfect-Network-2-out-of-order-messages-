function NetworkClient (sendFunction, callback) {
    this.sendFunction = sendFunction;
    this.callback = callback;
    this.sequenceNumber = 0;
    this.buffer = []; // buffer for recieved data
    //E.g. this.buffer = [true, true, undefined, 'string1', 'string2'] means first and second data packets in the sequence have arrived,
    // and have been provided to the callback. Third hasn't arrived yet. Fourth and fifth have arrived but ..
    // waiting for for third to arrive before they can be provided to the callback in their respective order.
}

NetworkClient.prototype.send = function (data) {
    var packet = { sequenceNumber: this.sequenceNumber, data: data }; // attach data with sequenceNo
    this.sequenceNumber++;
    this.sendFunction(JSON.stringify(packet));
};

NetworkClient.prototype.recv = function(packet) {
    var unpacked = JSON.parse(packet);
    if (!this.buffer[unpacked.sequenceNumber]) { //ignore if duplicate
      this.buffer[unpacked.sequenceNumber] = unpacked.data;
      this.streamBuffer();
    }
};
//streamBuffer is run whenever new data is received via recv
NetworkClient.prototype.streamBuffer = function() {
    // having undefined in buffer means some of previous packets are missing
    if (~this.buffer.findIndex((x) => { return x == undefined})) return;
    this.buffer.forEach((bufferItem, i) => {
      if (typeof bufferItem === 'string') {
        this.callback(bufferItem);
        this.buffer[i] = true; // set item to be true, which means callback called with data
      }
    });
};

module.exports = NetworkClient;
