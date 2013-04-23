
exports.Config = { debug : true };

exports.log = function (message) {
    if (exports.Config.debug) console.log(message);
}
