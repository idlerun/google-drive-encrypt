import $ from 'jquery';

//ref: http://stackoverflow.com/a/2880929/460976
var urlParams = {};
$(window).load(() => {
  var match,
      pl     = /\+/g,  // Regex for replacing addition symbol with a space
      search = /([^&=]+)=?([^&]*)/g,
      decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
      query  = window.location.search.substring(1);
  while (match = search.exec(query))
    urlParams[decode(match[1])] = decode(match[2]);
});

module.exports = urlParams;