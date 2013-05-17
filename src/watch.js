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
        noMore: false
    },
    lengthsubjects = [];

    var isFunction = function (functionToCheck) {
            var getType = {};
            return functionToCheck && getType.toString.call(functionToCheck) == '[object Function]';
    };

    var isInt = function (x) {
        return x % 1 === 0;
    };

    var isArray = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };

    var getObjDiff = function(a, b){
        var aplus = [],
        bplus = [];

        if(!(typeof a == "string") && !(typeof b == "string") && !isArray(a) && !isArray(b)){

            for(var i in a){
                if(!b[i]){
                    aplus.push(i);
                }
            }

            for(var j in b){
                if(!a[j]){
                    bplus.push(j);
                }
            }
        }

        return {
            added: aplus,
            removed: bplus
        }
    };

    var clone = function(obj){

        if (null == obj || "object" != typeof obj) {
            return obj;
        }

        var copy = obj.constructor();

        for (var attr in obj) {
            copy[attr] = obj[attr];
        }

        return copy;

    }

    var defineGetAndSet = function (obj, propName, getter, setter) {
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
                throw new Error("watchJS error: browser not supported :/")
            }
        }
    };

    var defineProp = function (obj, propName, value) {
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
    };

    var watch = function () {

        if (isFunction(arguments[1])) {
            watchAll.apply(this, arguments);
        } else if (isArray(arguments[1])) {
            watchMany.apply(this, arguments);
        } else {
            watchOne.apply(this, arguments);
        }

    };


    var watchAll = function (obj, watcher, level, addNRemove) {

        if ((typeof obj == "string") || (!(obj instanceof Object) && !isArray(obj))) { //accepts only objects and array (not string)
            return;
        }

        var props = [];


        if(isArray(obj)) {
            for (var prop = 0; prop < obj.length; prop++) { //for each item if obj is an array
                props.push(prop); //put in the props
            }
        } else {
            for (var prop2 in obj) { //for each attribute if obj is an object
                props.push(prop2); //put in the props
            }
        }

        watchMany(obj, props, watcher, level, addNRemove); //watch all itens of the props
    };


    var watchMany = function (obj, props, watcher, level, addNRemove) {

        if ((typeof obj == "string") || (!(obj instanceof Object) && !isArray(obj))) { //accepts only objects and array (not string)
            return;
        }

        for (var prop in props) { //watch each attribute of "props" if is an object
            watchOne(obj, props[prop], watcher, level, addNRemove);
        }

    };

    var watchOne = function (obj, prop, watcher, level, addNRemove) {

        if ((typeof obj == "string") || (!(obj instanceof Object) && !isArray(obj))) { //accepts only objects and array (not string)
            return;
        }

        if(isFunction(obj[prop])) { //dont watch if it is a function
            return;
        }

        if(obj[prop] != null && (level === undefined || level > 0)){
            if(level !== undefined){
                level--;
            }
            watchAll(obj[prop], watcher, level); //recursively watch all attributes of this
        }

        defineWatcher(obj, prop, watcher);

        if(addNRemove){
            pushToLengthSubjects(obj, prop, watcher, level);
        }

    };

    var unwatch = function () {

        if (isFunction(arguments[1])) {
            unwatchAll.apply(this, arguments);
        } else if (isArray(arguments[1])) {
            unwatchMany.apply(this, arguments);
        } else {
            unwatchOne.apply(this, arguments);
        }

    };

    var unwatchAll = function (obj, watcher) {

        if (obj instanceof String || (!(obj instanceof Object) && !isArray(obj))) { //accepts only objects and array (not string)
            return;
        }

        var props = [];


        if (isArray(obj)) {
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

        for (var prop2 in props) { //watch each attribute of "props" if is an object
            unwatchOne(obj, props[prop2], watcher);
        }
    };

    var defineWatcher = function (obj, prop, watcher) {

        var val = obj[prop];

        watchFunctions(obj, prop);

        if (!obj.watchers) {
            defineProp(obj, "watchers", {});
        }

        if (!obj.watchers[prop]) {
            obj.watchers[prop] = [];
        }

        for(var i in obj.watchers[prop]){
            if(obj.watchers[prop][i] === watcher){
                return;
            }
        }


        obj.watchers[prop].push(watcher); //add the new watcher in the watchers array


        var getter = function () {
            return val;
        };


        var setter = function (newval) {
            var oldval = val;
            val = newval;

            if (obj[prop]){
                watchAll(obj[prop], watcher);
            }

            watchFunctions(obj, prop);

            if (!WatchJS.noMore){
                if (JSON.stringify(oldval) !== JSON.stringify(newval)) {
                    callWatchers(obj, prop, "set", newval, oldval);
                    WatchJS.noMore = false;
                }
            }
        };

        defineGetAndSet(obj, prop, getter, setter);

    };

    var callWatchers = function (obj, prop, action, newval, oldval) {
        if (prop) {
            for (var wr in obj.watchers[prop]) {
                if (isInt(wr)) {
                    obj.watchers[prop][wr].call(obj, prop, action, newval || obj[prop], oldval);
                }
            }
        } else {
            for (var prop in obj) {//call all
                callWatchers(obj, prop, action, newval, oldval);
            }
        }
    };

    // @todo code related to "watchFunctions" is certainly buggy
    var methodNames = ['pop', 'push', 'reverse', 'shift', 'sort', 'slice', 'unshift'];
    var defineArrayMethodWatcher = function (obj, prop, original, methodName) {
        defineProp(obj[prop], methodName, function () {
            var response = original.apply(obj[prop], arguments);
            watchOne(obj, obj[prop]);
            if (methodName !== 'slice') {
                callWatchers(obj, prop, methodName,arguments);
            }
            return response;
        });
    };

    var watchFunctions = function(obj, prop) {

        if ((!obj[prop]) || (obj[prop] instanceof String) || (!isArray(obj[prop]))) {
            return;
        }

        for (var i = methodNames.length, methodName; i--;) {
            methodName = methodNames[i];
            defineArrayMethodWatcher(obj, prop, obj[prop][methodName], methodName);
        }

    };

    var unwatchOne = function (obj, prop, watcher) {
        for(var i in obj.watchers[prop]){
            var w = obj.watchers[prop][i];

            if(w == watcher) {
                obj.watchers[prop].splice(i, 1);
            }
        }

        removeFromLengthSubjects(obj, prop, watcher);
    };

    var loop = function(){

        for(var i in lengthsubjects){

            var subj = lengthsubjects[i];
            var difference = getObjDiff(subj.obj[subj.prop], subj.actual);
            
            if(difference.added.length || difference.removed.length){
                if(difference.added.length){
                    for(var j in subj.obj.watchers[subj.prop]){
                        watchMany(subj.obj[subj.prop], difference.added, subj.obj.watchers[subj.prop][j], subj.level - 1, true);
                    }
                }

                callWatchers(subj.obj, subj.prop, "differentattr", difference, subj.actual);
            }
            subj.actual = clone(subj.obj[subj.prop]);

        }

    };

    var pushToLengthSubjects = function(obj, prop, watcher, level){
        

        lengthsubjects.push({
            obj: obj,
            prop: prop,
            actual: clone(obj[prop]),
            watcher: watcher,
            level: level
        });
    };

    var removeFromLengthSubjects = function(obj, prop, watcher){

        for (var i in lengthsubjects) {
            var subj = lengthsubjects[i];

            if (subj.obj == obj && subj.prop == prop && subj.watcher == watcher) {
                lengthsubjects.splice(i, 1);
            }
        }

    };

    setInterval(loop, 50);

    WatchJS.watch = watch;
    WatchJS.unwatch = unwatch;
    WatchJS.callWatchers = callWatchers;

    return WatchJS;

}));
