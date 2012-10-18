/**
 * DEVELOPED BY
 * GIL LOPES BUENO
 * gilbueno.mail@gmail.com
 * 
 * WORKS WITH:
 * IE 9+, FF 4+, SF 5+, WebKit, CH 7+, OP 12+, BESEN, Rhino 1.7+
 * 
 * FORK:
 * https://gist.github.com/1627705
 */

var $watchjs$ = {
    isFunction: function(functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) == '[object Function]';
    },

    isInt: function(x) {
        var y = parseInt(x);
        if (isNaN(y)) return false;
        return x == y && x.toString() == y.toString();
    },
    isArray: function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    },
    defineGetAndSet: function(obj, propName, getter, setter){
        try{
                Object.defineProperty(obj, propName, {
                        get: getter,
                        set: setter,
                        enumerable: true,
                        configurable: true
                });
        }catch(error){
            try{
                Object.prototype.__defineGetter__.call(obj, propName, getter);
                Object.prototype.__defineSetter__.call(obj, propName, setter);
            }catch(error2){
                throw "watchJS error: browser not supported :/"
            }
        }
    },
    defineProp: function(obj, propName, value){
        try{
            Object.defineProperty(obj, propName, {
                    enumerable: false
                , configurable: true
                , writable: false
                , value: value
                });
        }catch(error){
            obj[propName] = value;
        }
    }
};

$watchjs$.defineProp(Object.prototype, "watch", function() {

    if (arguments.length == 1) 
        this.watchAll.apply(this, arguments);
    else if ($watchjs$.isArray(arguments[0])) 
        this.watchMany.apply(this, arguments);
    else
        this.watchOne.apply(this, arguments);

});


$watchjs$.defineProp(Object.prototype, "watchAll", function(watcher) {
                        
    var obj = this;

    if (obj instanceof String || (!(obj instanceof Object) && !$watchjs$.isArray(obj))) //accepts only objects and array (not string)
        return;

    var props = [];


    if($watchjs$.isArray(obj)){
        for (var prop=0; prop<obj.length; prop++) { //for each item if obj is an array 
            props.push(prop); //put in the props
        }
    }else{
        for (var prop2 in obj) { //for each attribute if obj is an object
            props.push(prop2); //put in the props
        }
    }

    obj.watchMany(props, watcher); //watch all itens of the props
});


$watchjs$.defineProp(Object.prototype, "watchMany", function(props, watcher) {
    var obj = this;

    if($watchjs$.isArray(obj)){
        for (var prop in props) { //watch each iten of "props" if is an array
            obj.watchOne(props[prop], watcher);
        }
    }else{
        for (var prop2 in props) { //watch each attribute of "props" if is an object
            obj.watchOne(props[prop2], watcher);
        }
    }
});

$watchjs$.defineProp(Object.prototype, "watchOne", function(prop, watcher) {
    var obj = this;

    var val = obj[prop];

    if(obj[prop]===undefined || $watchjs$.isFunction(obj[prop])) //dont watch if it is null or a function
        return;

    if(obj[prop]!=null)
        obj[prop].watchAll(watcher); //recursively watch all attributes of this

    obj.watchFunctions(prop);


    if (!obj.watchers) {
        $watchjs$.defineProp(obj, "watchers", {});
    }

    if (!obj.watchers[prop]) 
        obj.watchers[prop] = [];


    obj.watchers[prop].push(watcher); //add the new watcher in the watchers array


    var getter = function() {
        return val;
    };


    var setter = function(newval) {
        var oldval = val;
        val = newval;

        if(obj[prop])
            obj[prop].watchAll(watcher);

        obj.watchFunctions(prop);

        if (JSON.stringify(oldval) != JSON.stringify(newval) && arguments.callee.caller != watcher) {
            obj.callWatchers(prop);
        }
    };

        $watchjs$.defineGetAndSet(obj, prop, getter, setter);


});

$watchjs$.defineProp(Object.prototype, "callWatchers", function(prop) {
    var obj = this;

    for (var wr in obj.watchers[prop]) {
        if ($watchjs$.isInt(wr)){
            obj.watchers[prop][wr]();
        }
    }
});



$watchjs$.defineProp(Object.prototype, "watchFunctions", function(prop) {
    var obj = this;

    if((!obj[prop]) || (obj[prop] instanceof String) || (!$watchjs$.isArray(obj[prop])))
        return;

    var originalpop = obj[prop].pop;
    $watchjs$.defineProp(obj[prop], "pop", function() {
        var response = originalpop.apply(this, arguments);

        obj.watchOne(obj[prop]);
        obj.callWatchers(prop);

        return response;
    });


    var originalpush = obj[prop].push;
    $watchjs$.defineProp(obj[prop], "push",  function() {
        var response = originalpush.apply(this, arguments);

        obj.watchOne(obj[prop]);
        obj.callWatchers(prop);

        return response;
    });


    var originalreverse = obj[prop].reverse;
    $watchjs$.defineProp(obj[prop], "reverse", function() {
        var response = originalreverse.apply(this, arguments);

        obj.watchOne(obj[prop]);
        obj.callWatchers(prop);

        return response;
    });


    var originalshift = obj[prop].shift;
    $watchjs$.defineProp(obj[prop], "shift", function() {
        var response = originalshift.apply(this, arguments);

        obj.watchOne(obj[prop]);
        obj.callWatchers(prop);

        return response;
    });


    var originalsort = obj[prop].sort;
    $watchjs$.defineProp(obj[prop], "sort",  function() {
        var response = originalsort.apply(this, arguments);

        obj.watchOne(obj[prop]);
        obj.callWatchers(prop);

        return response;
    });


    var originalslice = obj[prop].slice;
    $watchjs$.defineProp(obj[prop], "slice",  function() {
        var response = originalslice.apply(this, arguments);

        obj.watchOne(obj[prop]);

        return response;
    });


    var originalunshift = obj[prop].unshift;
    $watchjs$.defineProp(obj[prop], "unshift", function() {
        var response = originalunshift.apply(this, arguments);

        obj.watchOne(obj[prop]);
        obj.callWatchers(prop);

        return response;
    });

});