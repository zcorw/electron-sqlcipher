/* eslint-disable no-underscore-dangle */
import _ from 'lodash';

const queue = {};
function init(id, instance, type) {
  const _instance = queue[id];
  if (_instance) {
    instance.times = _instance.times;
    instance.times[type] = 1;
  } else {
    instance.times = {};
    instance.times[type] = 1;
  }
  queue[id] = instance;
}

function remove(id, type) {
  const _instance = queue[id];
  delete _instance[type];
  if (_.isEmpty(_instance.times)) {
    delete queue[id];
  }
}

function get(id) {
  return queue[id];
}

function update(id, instance, type) {
  const _instance = queue[id];
  if (_instance) {
    instance.times = _instance.times;
    queue[id] = instance;
  } else {
    init(id, instance, type);
  }
}

export default class Base {
  constructor(id, instance, type) {
    init(id, instance, type);
    this.id = id;
    this._type = type;
  }

  get base() {
    return get(this.id);
  }

  set base(instance) {
    update(this.id, instance, this._type);
  }

  remove() {
    remove(this.id, this._type);
  }
}