onmessage = function (leString) {
  postMessage(JSON.parse(leString.data));
};
