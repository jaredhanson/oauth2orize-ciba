var uid = require('uid2');

function MemoryStore() {
  this.transactions = Object.create(null);
}

MemoryStore.prototype.load = function(id, cb) {
  console.log('LOAD THE TXN: ' + id);
  
  var txn = this.transactions[id];
  if (txn) {
    txn = JSON.parse(txn);
  }
  
  process.nextTick(function() {
    cb(null, txn);
  });
}

MemoryStore.prototype.store = function(req, txn, cb) {
  var id = uid(20);
  
  console.log('STORE TRANSACTION');
  console.log(id);
  console.log(txn);
  
  this.transactions[id] = JSON.stringify(txn);
  console.log(this.transactions);
  
  process.nextTick(function() {
    cb(null, id);
  });
};

MemoryStore.prototype.update = function(req, id, txn, cb) {
  console.log('UPDATING TXN!');
  console.log(txn);
  
  this.transactions[id] = JSON.stringify(txn);
  console.log(this.transactions);
  
  process.nextTick(function() {
    cb(null, id);
  });
};


module.exports = MemoryStore;
