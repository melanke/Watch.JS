# Watch.js 1.1.0 [Download](https://raw.github.com/melanke/Watch.JS/master/src/watch.js)

##compatibility
Works with: IE 9+, FF 4+, SF 5+, WebKit, CH 7+, OP 12+, BESEN, Rhino 1.7+
If you want a similar API that works for all browsers, try [MultiGetSet](https://gist.github.com/2956493)

## About

Watch.JS is a small library that brings a lot of possibilities. You may know that the "Observer" design pattern involves executing some function when an observed object changes. Other libraries exist that do this, but with Watch.JS you will not have to change the way you develop. Take a look at the examples to see how simple it is to add Watch.JS to your code.

## Observe the changes of one object attribute

```javascript
//defining our object however we like
var ex1 = {
	attr1: "initial value of attr1",
	attr2: "initial value of attr2"
};

//defining a 'watcher' for an attribute
ex1.watch("attr1", function(){
	alert("attr1 changed!");
});

//when changing the attribute its watcher will be invoked
ex1.attr1 = "other value";
```

[Try out](http://jsfiddle.net/NbJuh/13/)

## Observe the changes of more than one object attribute

```javascript
//defining our object however we like
var ex2 = {
	attr1: 0,
	attr2: 0,
	attr3: 0
};

//defining a 'watcher' for the attributes
ex2.watch(["attr2", "attr3"], function(){
	alert("attr2 or attr3 changed!");
});

//when changing one of the attributes its watcher will be invoked
ex2.attr2 = 50;
```

[Try out](http://jsfiddle.net/2zT4C/2/)

## Observe the changes of all attributes of the object

```javascript
//defining our object no matter which way we want
var ex3 = {
	attr1: 0,
	attr2: "initial value of attr2",
	attr3: ["a", 3, null]
};

//defining a 'watcher' for the object
ex3.watch(function(){
	alert("some attribute of ex3 changed!");
});

//when changing one of the attributes of the object the watcher will be invoked
ex3.attr3.push("new value");
```

[Try out](http://jsfiddle.net/C83pW/1/)

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

obj.watch("name", obj.alert);
obj.watch("name", obj.alert2);

obj.name = "johnny";

obj.unwatch("name", obj.alert);

obj.name = "phil";​
```

[Try out](http://jsfiddle.net/SZ2Ut/)

## More information about the change

```javascript
//defining our object however we like
var ex1 = {
    attr1: "initial value of attr1",
    attr2: "initial value of attr2"
};

//defining a 'watcher' for an attribute
ex1.watch("attr1", function(prop, newvalue, oldvalue){
    alert(prop+" - new: "+newvalue+", old: "+oldvalue);
});

//when changing the attribute its watcher will be invoked
ex1.attr1 = "other value";​
```

[Try out](http://jsfiddle.net/XnbXS/1/)

## Don't worry about the Infinite Loop

If you don't want to call a second watcher in the current scope just set WatchJS.noMore to true and it will be reset to false when this watcher finishes.

```javascript
//defining our object however we like
var ex1 = {
    attr1: "inicial value of attr1",
    attr2: "initial value of attr2"
};

//defining a 'watcher' for an attribute
ex1.watch("attr1", function(){
    WatchJS.noMore = true; //prevent invoking watcher in this scope
    ex1.attr2 = ex1.attr1 + " + 1";
});

//defining other 'watcher' for another attribute
ex1.watch("attr2", function(){
    alert("attr2 changed");
});


ex1.attr1 = "other value to 1"; //attr1 will be changed but will not invoke the attr2`s watcher
```

[Try out](http://jsfiddle.net/z2sJr/8/)

## Chill out, no surprises, new attributes will not be considered

After declaring a watcher for some object, when you add new attributes to this object and/or change it, the watcher will not be invoked. If you want the new attributes to be observed you only need to add the watcher to these new attributes again.

```javascript
//defining our object however we like
var ex6 = {
	attr1: 0,
	attr2: 1
};

//defining a 'watcher' for the object
ex6.watch(function(){
	alert("some attribute of ex6 changed!")
});

ex6.attr3 = null; //no watcher will be invoked
ex6.attr3 = "value"; //no watcher will be invoked
```

[Try out](http://jsfiddle.net/NFmUc/1/)

## Invoke the watcher anytime you want

```javascript
//defining our object however we like
var ex7 = {
	attr1: 0,
	attr2: 1
};

//defining a 'watcher' for the object
ex7.watch(function(){
	alert("some attribute of ex6 changed!")
});

ex7.callWatchers("attr1"); //invoke the watcher
```

[Try out](http://jsfiddle.net/98MmB/4/)

## Compatible with JQuery

```javascript
$(function(){

    var obj = {cont: 0};

    obj.watch("cont", function(){
        alert("obj.cont = "+obj.cont);
    });

    $("#button").click(function(){
        obj.cont++;
    });
});
```
[Try out](http://jsfiddle.net/fj2Yb/5/)

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

    this.watch(function(){
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

    this.watch(function(){
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

orange.watch(function(){
    console.log("although we are using Watch.js the orange structure remains the same");

    for(var i in orange){
        console.log(i+": "+orange[i]);
    }
});

orange.type = "other";
​
//try other ways to build objects ;)
```
[Try out](http://jsfiddle.net/t94Vv/)
