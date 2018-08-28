# Watch.js 1.4.2 [Download](https://raw.github.com/melanke/Watch.JS/master/src/watch.js)

## About

Watch.JS is a small library with a lot of possibilities. You may know that the "Observer" design pattern involves executing some function when an observed object changes. Other libraries exist that do this, but with Watch.JS you will not have to change the way you develop. Take a look at the examples to see how simple it is to add Watch.JS to your code.

## Compatible with all serious browsers :P
Works with: IE 9+, FF 4+, SF 5+, WebKit, CH 7+, OP 12+, BESEN, Node.JS , Rhino 1.7+

# Installing

#### HTML Script TAG
```html
<script src="watch.js" type="text/javascript"></script>
<!-- watch will be a global variable -->
```

#### Via NPM
```
npm install melanke-watchjs
```

# Importing

#### Import as ECMA2015 module

```javascript
import WatchJS from 'melanke-watchjs';

var watch = WatchJS.watch;
var unwatch = WatchJS.unwatch;
var callWatchers = WatchJS.callWatchers;
```

#### Require

```javascript
var WatchJS = require("melanke-watchjs")
var watch = WatchJS.watch;
var unwatch = WatchJS.unwatch;
var callWatchers = WatchJS.callWatchers;
```

#### RequireJS
```javascript
require("watch", function(WatchJS){
    var watch = WatchJS.watch;
    var unwatch = WatchJS.unwatch;
    var callWatchers = WatchJS.callWatchers;
});
```

# Examples

## Observe the changes of one object attribute

```javascript
//defining our object however we like
var ex1 = {
	attr1: "initial value of attr1",
	attr2: "initial value of attr2"
};

//defining a 'watcher' for an attribute
watch(ex1, "attr1", function(){
	alert("attr1 changed!");
});

//when changing the attribute its watcher will be invoked
ex1.attr1 = "other value";
```

[Try out](http://jsfiddle.net/NbJuh/62/)

## Observe the changes of more than one object attribute

```javascript
//defining our object however we like
var ex2 = {
    attr1: 0,
    attr2: 0,
    attr3: 0
};

//defining a 'watcher' for the attributes
watch(ex2, ["attr2", "attr3"], function(){
    alert("attr2 or attr3 changed!");
});

//when changing one of the attributes its watcher will be invoked
ex2.attr2 = 50;​
```

[Try out](http://jsfiddle.net/2zT4C/23/)

## Observe the changes of all attributes of the object

```javascript
//defining our object however we like
var ex3 = {
    attr1: 0,
    attr2: "initial value of attr2",
    attr3: ["a", 3, null]
};

//defining a 'watcher' for the object

watch(ex3, function(){
    alert("some attribute of ex3 changes!");
});

//when changing one of the attributes of the object the watcher will be invoked
ex3.attr3.push("new value");​
```

[Try out](http://jsfiddle.net/C83pW/27/)

## Remove a Watcher

```javascript
var obj = {
    phrase: "hey",
    name: "buddy",
    alert: function(){
        alert(obj.phrase + " " + obj.name);
    },
    alert2: function(){
        alert(obj.name + ", " + obj.phrase);
    }
}
    
watch(obj, "name", obj.alert);
watch(obj, "name", obj.alert2);

obj.name = "johnny";

unwatch(obj, "name", obj.alert);

obj.name = "phil";​
```

[Try out](http://jsfiddle.net/SZ2Ut/9/)

## More information about the change

```javascript
//defining our object no matter which way we want
var ex1 = {
    attr1: "initial value of attr1",
    attr2: "initial value of attr2"
};

//defining a 'watcher' for an attribute
watch(ex1, "attr1", function(prop, action, newvalue, oldvalue){
    alert(prop+" - action: "+action+" - new: "+newvalue+", old: "+oldvalue+"... and the context: "+JSON.stringify(this));
});

//when changing the attribute its watcher will be invoked
ex1.attr1 = "other value";​
```

[Try out](http://jsfiddle.net/XnbXS/21/)

## Don't worry about the Infinite Loop

If you don't want to call a second watcher in the current scope just set WatchJS.noMore to true and it will be reset to false when this watcher finishes.

```javascript
//defining our object however we like
var ex1 = {
    attr1: "inicial value of attr1",
    attr2: "initial value of attr2"
};

//defining a 'watcher' for an attribute
watch(ex1, "attr1", function(){
    WatchJS.noMore = true; //prevent invoking watcher in this scope
    ex1.attr2 = ex1.attr1 + " + 1";
});

//defining other 'watcher' for another attribute
watch(ex1, "attr2", function(){
    alert("attr2 changed");
});


ex1.attr1 = "other value to 1"; //attr1 will be changed but will not invoke the attr2`s watcher
```

[Try out](http://jsfiddle.net/z2sJr/16/)

## How deep you wanna go? Provide a level of children

```javascript
//defining our object no matter which way we want
var ex = {
    //level 0
    l1a: "bla bla",
    l1b: {
        //level 1 or less
        l2a: "lo lo",
        l2b: {
            //level 2 or less
            deeper: "so deep"
        }           
    }
};

watch(ex, function(){
    alert("ex changed at lvl 2 or less");
}, 1);

watch(ex, function(){
    alert("ex changed at lvl 3 or less");
}, 2);


ex.l1b.l2b.deeper = "other value";


ex.l1b.l2b = "other value";
```

[Try out](http://jsfiddle.net/7AwbW/5/)

## By default new attributes will be ignored

After declaring a watcher for some object, when you add new attributes to this object and/or change it, the watcher will not be invoked.

```javascript
//defining our object however we like
var ex6 = {
    attr1: 0,
    attr2: 1
};

//defining a 'watcher' for the object
watch(ex6, function(){
    alert("some attribute of ex6 changed!")
});

ex6.attr3 = null; //no watcher will be invoked
ex6.attr3 = "value"; //no watcher will be invoked​​​
```

[Try out](http://jsfiddle.net/NFmUc/7/)

## Do you want to know when new attributes change too?

Well this is not perfect, you may have to wait 50 miliseconds

```javascript
//defining our object no matter which way we want
var ex = {
    l1a: "bla bla",
    l1b: {
        l2a: "lo lo",
        l2b: "hey hey"        
    }
};

watch(ex, function (prop, action, difference, oldvalue){
    
    alert("prop: "+prop+"\n action: "+action+"\n difference: "+JSON.stringify(difference)+"\n old: "+JSON.stringify(oldvalue)+"\n ... and the context: "+JSON.stringify(this));    
    
}, 0, true);


ex.l1b.l2c = "new attr"; //it is not instantaneous, you may wait 50 miliseconds

setTimeout(function(){
    ex.l1b.l2c = "other value";
}, 100);
```
[Try out](http://jsfiddle.net/wXWPQ/4/)

## Invoke the watcher anytime you want

```javascript
//defining our object however we like
var ex7 = {
    attr1: 0,
    attr2: 1
};

//defining a 'watcher' for the object
watch(ex7, function(){
    alert("some attribute of ex6 changed!")
});

callWatchers(ex7, "attr1"); //invoke the watcher​​
```

[Try out](http://jsfiddle.net/98MmB/10/)

## Compatible with JQuery

```javascript
$(function(){

    var obj = {cont: 0};
    
    watch(obj, "cont", function(){
        alert("obj.cont = "+obj.cont);
    });

    $("#button").click(function(){
        obj.cont++;
    });
});
```
[Try out](http://jsfiddle.net/fj2Yb/24/)

## Different ways to build Classes/Objects and use Watch.JS

```javascript
//open the browser log to view the messages

var Apple = function(type) {
    var _thisApple = this;
    this.type = type;
    this.color = "red";

    this.getInfo = function() {
        return this.color + ' ' + this.type + ' apple';
    };

    watch(this, function(){
        console.log("although we are using Watch.js the apple structure remains the same");
        for(var i in _thisApple){
            console.log(i+": "+_thisApple[i]);
        }
    });
};


var apple = new Apple("macintosh");
apple.type = "other";


var Banana = function(type) {
    var _thisBanana = this;
    this.type = type;
    this.color = "yellow";

    watch(this, function(){
        console.log("although we are using Watch.js the banana structure remains the same");
        for(var i in _thisBanana){
            console.log(i+": "+_thisBanana[i]);
        }
    });
};

Banana.prototype.getInfo = function() {
    return this.color + ' ' + this.type + ' banana';
};

var banana = new Banana("Cavendish");
banana.type = "other";

var orange = {
    type: "pocan",
    color: "orange",
    getInfo: function () {
        return this.color + ' ' + this.type + ' apple';
    }
};

watch(orange, function(){
    console.log("although we are using Watch.js the orange structure remains the same");

    for(var i in orange){
        console.log(i+": "+orange[i]);
    }
});

orange.type = "other";
```
[Try out](http://jsfiddle.net/t94Vv/58/)
