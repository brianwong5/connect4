const TranspositionTable = function() {
  this.table = [];
  this.size = 8388593;

  const index = key => key % this.size;

  this.delete = key => this.table[index(key)] = undefined;
  this.get = key => this.table[index(key)];
  this.reset = () => this.table = [];
  this.set = (key, value) => this.table[index(key)] = value;
}
