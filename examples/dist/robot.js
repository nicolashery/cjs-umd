(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory(require('lodash'), require('moment'));
    }
    else if (typeof define === 'function' && define.amd) {
        define(['lodash', 'moment'], factory);
    }
    else {
        root['robot'] = factory(root['_'], root['moment']);
    }
}(this, function(_, moment) {
    function _requireDep(name) {
            return {'lodash': _, 'moment': moment}[name];
    }
    function _require(index) {
        var module = _require.cache[index];
        if (!module) {
            var exports = {};
            module = _require.cache[index] = {
                id: index,
                exports: exports
            };
            _require.modules[index].call(exports, module, exports);
        }
        return module.exports;
    }
    _require.cache = [];
    _require.modules = [
        function (module, exports) {
            var moment = _requireDep('moment');
            module.exports = {
                now: function () {
                    return moment().format();
                },
                greet: function () {
                    return 'Hello World';
                }
            };
        },
        function (module, exports) {
            var _ = _requireDep('lodash');
            var foo = _require(0);
            module.exports = function () {
                _.forEach(foo, function (fn, key) {
                    console.log(key + ': ' + fn());
                });
            };
        }
    ];
    return _require(1);
}));