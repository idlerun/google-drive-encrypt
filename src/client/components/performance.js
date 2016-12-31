
const ENABLED=false;

function profile(name, fn) {
  var t0 = performance.now();
  var result = fn();
  var t1=performance.now();
  console.log(name, " took ", (t1-t0), "ms");
  return result;
};

function no_profile(name, fn) {
  return fn();
};

if(ENABLED) {
  module.exports = {profile};
} else {
  module.exports = {profile:no_profile};
}