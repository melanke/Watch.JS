# Watch.js 1.0.13 [Download](https://raw.github.com/melanke/Watch.JS/master/src/watch.js)

##compatibility
Works with: IE 9+, FF 4+, SF 5+, WebKit, CH 7+, OP 12+, BESEN, Rhino 1.7+
If you want a similar API that works for all browser try [MultiGetSet](https://gist.github.com/2956493)

## About

Watch.JS is a small library that brings a lot of possibilities. Maybe you know the design pattern called "Observer", imagine the possibility of executing some function always that some object changes. Well, already exists other libraries that do this, but with Watch.JS you will not have to change your way to develop. Give a chance to Watch.JS, take a look at the examples and how is simple to embody Watch.JS to your routine.

## Observe the changes of one object attribute

```javascript
//defining our object no matter which way we want
var ex1 = {
	attr1: "initial value of attr1",
	attr2: "initial value of attr2"
};

//defining a 'watcher' for an attribute
ex1.watch("attr1", function(){
	alert("attr1 changes!");
});

//when changing the attribute its watcher will be invoked
ex1.attr1 = "other value";
```

[Try out](http://jsfiddle.net/NbJuh/)

## Observe the changes of more than one object attribute

```javascript
//defining our object no matter which way we want
var ex2 = {
	attr1: 0,
	attr2: 0,
	attr3: 0
};

//defining a 'watcher' for the attributes
ex2.watch(["attr2", "attr3"], function(){
	alert("attr2 or attr3 changes!");
});

//when changing one of the attributes its watcher will be invoked
ex2.attr2 = 50;
```

[Try out](http://jsfiddle.net/2zT4C/)

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
	alert("some attribute of ex3 changes!");
});

//when changing one of the attributes of the object the watcher will be invoked
ex3.attr3.push("new value");
```

[Try out](http://jsfiddle.net/C83pW/)

## Don't worry about the Inifinite Loop

Different of some libraries, with Watch.JS you will never have to worry about inifinite loop when change the object inside its own watcher, the watcher will not be invoked from itself.

```javascript
//defining our object no matter which way we want
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
    alert("attr2 changes");
});


ex1.attr1 = "other value to 1"; //attr1 will be changed but will not invoke the attr2`s watcher
```

[Try out](http://jsfiddle.net/z2sJr/6/)

## Chill out, no surprises, new attributes will not be considered

After declaring a watcher for some object, when you add new attributes for this object and/or change it, the watcher will not be invoked. If you want the new attributes to be observed you only need to add the watcher to these new attributes again.

```javascript
//defining our object no matter which way we want
var ex6 = {
	attr1: 0,
	attr2: 1
};

//defining a 'watcher' for the object
ex6.watch(function(){
	alert("some attribute of ex6 changes!")
});

ex6.attr3 = null; //no watcher will be invoked
ex6.attr3 = "value"; //no watcher will be invoked
```

[Try out](http://jsfiddle.net/NFmUc/)

## Invoke the watcher anytime you want

```javascript
//defining our object no matter which way we want
var ex7 = {
	attr1: 0,
	attr2: 1
};

//defining a 'watcher' for the object
ex7.watch(function(){
	alert("some attribute of ex6 changes!")
});

ex7.callWatchers(); //invoke the watcher
```

[Try out](http://jsfiddle.net/98MmB/)

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
[Try out](http://jsfiddle.net/fj2Yb/)