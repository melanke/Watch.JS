/**
 * DEVELOPED BY
 * GIL LOPES BUENO
 * gilbueno.mail@gmail.com
 *
 * WORKS WITH:
 * IE 9+, FF 4+, SF 5+, WebKit, CH 7+, OP 12+, BESEN, Rhino 1.7+
 *
 * FORK:
 * https://github.com/melanke/Watch.JS
 */

"use strict";
(function (factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals
        window.WatchJS = factory();
        window.watch = window.WatchJS.watch;
        window.unwatch = window.WatchJS.unwatch;
        window.callWatchers = window.WatchJS.callWatchers;
    }
}(function () {

    var WatchJS = {

        noMore: false,

        isFunction: function (functionToCheck) {
            var getType = {};
            return functionToCheck && getType.toString.call(functionToCheck) == '[object Function]';
        },

        isInt: function (x) {
            return x % 1 === 0;
        },
        isArray: function(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        },
        defineGetAndSet: function (obj, propName, getter, setter) {
            try {
                    Object.defineProperty(obj, propName, {
                            get: getter,
                            set: setter,
                            enumerable: true,
                            configurable: true
                    });
            } catch(error) {
                try{
                    Object.prototype.__defineGetter__.call(obj, propName, getter);
                    Object.prototype.__defineSetter__.call(obj, propName, setter);
                }catch(error2){
                    throw "watchJS error: browser not supported :/"
                }
            }
        },
        defineProp: function (obj, propName, value) {
            try {
                Object.defineProperty(obj, propName, {
                    enumerable: false,
                    configurable: true,
                    writable: false,
                    value: value
                });
            } catch(error) {
                obj[propName] = value;
            }
        }
    };

    var watch = function () {

        if (arguments.length == 2) 
            watchAll.apply(this, arguments);
        else if (WatchJS.isArray(arguments[1])) 
            watchMany.apply(this, arguments);
        else
            watchOne.apply(this, arguments);

    };


    var watchAll = function (obj, watcher) {

        if (obj instanceof String || (!(obj instanceof Object) && !WatchJS.isArray(obj))) //accepts only objects and array (not string)
            return;

        var props = [];


        if(WatchJS.isArray(obj)) {
            for (var prop = 0; prop < obj.length; prop++) { //for each item if obj is an array 
                props.push(prop); //put in the props
            }
        } else {
            for (var prop2 in obj) { //for each attribute if obj is an object
                props.push(prop2); //put in the props
            }
        }

        watchMany(obj, props, watcher); //watch all itens of the props
    };


    var watchMany = function (obj, props, watcher) {

        if(WatchJS.isArray(obj)) {
            for (var prop in props) { //watch each iten of "props" if is an array
                watchOne(obj, props[prop], watcher);
            }
        } else {
            for (var prop2 in props) { //watch each attribute of "props" if is an object
                watchOne(obj, props[prop2], watcher);
            }
        }
    };

    var watchOne = function (obj, prop, watcher) {

        var val = obj[prop];

        if(obj[prop] === undefined || WatchJS.isFunction(obj[prop])) { //dont watch if it is null or a function
            return;
        }

        if(obj[prop] != null) {
            watchAll(obj[prop], watcher); //recursively watch all attributes of this
        }

        watchFunctions(obj, prop);


        if (!obj.watchers) {
            WatchJS.defineProp(obj, "watchers", {});
        }

        if (!obj.watchers[prop]) {
            obj.watchers[prop] = [];
        }


        obj.watchers[prop].push(watcher); //add the new watcher in the watchers array


        var getter = function () {
            return val;
        };


        var setter = function (newval) {
            var oldval = val;
            val = newval;

            if(obj[prop]){
                watchAll(obj[prop], watcher);
            }

            watchFunctions(obj, prop);

            if (JSON.stringify(oldval) !== JSON.stringify(newval)) {
                if (!WatchJS.noMore){
                    callWatchers(obj, prop, newval, oldval);
                    WatchJS.noMore = false;
                }
            }
        };

            WatchJS.defineGetAndSet(obj, prop, getter, setter);


    };

    var unwatch = function () {

        if (arguments.length == 2) 
            unwatchAll.apply(this, arguments);
        else if (WatchJS.isArray(arguments[1])) 
            unwatchMany.apply(this, arguments);
        else
            unwatchOne.apply(this, arguments);

    };

    var unwatchAll = function (obj, watcher) {

        if (obj instanceof String || (!(obj instanceof Object) && !WatchJS.isArray(obj))) { //accepts only objects and array (not string)
            return;
        }

        var props = [];


        if (WatchJS.isArray(obj)) {
            for (var prop = 0; prop < obj.length; prop++) { //for each item if obj is an array 
                props.push(prop); //put in the props
            }
        } else {
            for (var prop2 in obj) { //for each attribute if obj is an object
                props.push(prop2); //put in the props
            }
        }

        unwatchMany(obj, props, watcher); //watch all itens of the props
    };


    var unwatchMany = function (obj, props, watcher) {

        if (WatchJS.isArray(obj)) {
            for (var prop in props) { //watch each iten of "props" if is an array
                unwatchOne(obj, props[prop], watcher);
            }
        } else {
            for (var prop2 in props) { //watch each attribute of "props" if is an object
                unwatchOne(obj, props[prop2], watcher);
            }
        }
    };

    var unwatchOne = function (obj, prop, watcher) {
        for(var i in obj.watchers[prop]){
            var w = obj.watchers[prop][i];

            if(w == watcher)
                obj.watchers[prop].splice(i, 1);
        }
    };

    var callWatchers = function (obj, prop, newval, oldval) {

        for (var wr in obj.watchers[prop]) {
            if (WatchJS.isInt(wr)){
                obj.watchers[prop][wr](prop, newval, oldval);
            }
        }
    };

     // @todo code related to "watchFunctions" is certainly buggy
    var methodNames = ['pop', 'push', 'reverse', 'shift', 'sort', 'slice', 'unshift'];
    var defineArrayMethodWatcher = function (obj, prop, original, methodName) {
        WatchJS.defineProp(obj[prop], methodName, function () {
            var response = original.apply(obj, arguments);
            watchOne(obj, obj[prop]);
            if (methodName !== 'slice') {
                callWatchers(obj, prop);
            }
            return response;
        });
    };

    var watchFunctions = function(obj, prop) {

        if ((!obj[prop]) || (obj[prop] instanceof String) || (!WatchJS.isArray(obj[prop]))) {
            return;
        }

        for (var i = methodNames.length, methodName; i--;) {
            methodName = methodNames[i];
            defineArrayMethodWatcher(obj, prop, obj[prop][methodName], methodName);
        }

    };

    WatchJS.watch = watch;
    WatchJS.unwatch = unwatch;
    WatchJS.callWatchers = callWatchers;

    return WatchJS;

}));
