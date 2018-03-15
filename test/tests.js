/**
 * WatchJS Test
 * 
 */


// Force dirty checks 
// ------------------------
// WatchJS.useDirtyCheck = true;

QUnit.module("Watch object")
QUnit.config.testTimeout = 30000;
QUnit.test( "Observe changes on an object property", function( assert ) {
    assert.expect(6);
    var done1 = assert.async();
    var done2 = assert.async();
    var o = {
        name: 'Mary',
        email:'mary@domain.com'
    };
    
    WatchJS.watch(o,"name", function(prop, action, newvalue, oldvalue) {
        assert.equal( "name",prop, "name: property name matched" );
        assert.equal( "Paul",newvalue, "new value matched" );
        assert.equal( "Mary",oldvalue, "old value matched" );
        done1();
    });

    WatchJS.watch(o,"email", function(prop, action, newvalue, oldvalue) {
        assert.equal( "email",prop, "eamil: property name matched" );
        assert.equal( "paul@domain.com",newvalue, "new value matched" );
        assert.equal( "mary@domain.com",oldvalue, "old value matched" );
        done2();
    });
    
    o.name = 'Paul';
    o.email = 'paul@domain.com';
});

QUnit.test("Observe the changes of more than one object properties", function( assert ) {
    assert.expect(4);
    var done1 = assert.async();
    var done2 = assert.async();
    var obj = {
        attr1: 1,
        attr2: 2,
        attr3: 3
    };
    
    WatchJS.watch(obj, ["attr2", "attr3"], function(prop, action, newvalue, oldvalue){
        if (prop==='attr2') {
            assert.strictEqual(50, newvalue, "attr2: new value matched ");
            assert.strictEqual(2, oldvalue, "attr2: old value matched ");            
            done1();
        }
        else if (prop==='attr3') {
            assert.strictEqual(100, newvalue, "attr3: new value matched " );        
            assert.strictEqual(3, oldvalue, "attr3: old value matched " );        
            done2();
        }
        else {
            throw new Exception(prop+": Invalid property");
        }
    });
    
    obj.attr2 = 50;
    obj.attr3 = 100;
});

QUnit.test("Observe the changes of all properties of the object", function( assert ) {
    assert.expect(3);
    var done1 = assert.async();
    var obj = {
        dummy: undefined,
        attr1: 1,
        attr2: 2,
        attr3: 3
    };
    
    WatchJS.watch(obj, function(prop, action, newvalue, oldvalue){
        assert.equal( "attr3",prop, "attr3: name match" );
        assert.strictEqual(100, newvalue, "attr2: new value matched ");
        assert.strictEqual(3, oldvalue, "attr2: old value matched ");            
        done1();
    });
    
    obj.attr3 = 100;
});

QUnit.test("Add and remove watcher", function( assert ) {
    assert.expect(2);
    var done1 = assert.async();
    var done2 = assert.async();
    var obj = {
        attr1: 1,
        attr2: 2,
        attr3: 3
    };

    var callback = function(prop, action, newvalue, oldvalue){
        changeDetected++ ;
        assert.ok(changeDetected===1, "attr1: Watcher added");
        done1();
        
        if (changeDetected===1) {
            setTimeout(function() {
                assert.ok(changeDetected === 1, "attr1: Watcher removed");
                done2();
            },60);
            WatchJS.unwatch(obj,"attr1", callback);  // remove watcher from attr1  
            obj.attr1 = 125;
            
        }
    }
    
    var changeDetected = 0;
    WatchJS.watch(obj, "attr1", callback);
    
    obj.attr1 = 250;        
});


QUnit.test("Add and remove multiple watchers", function( assert ) {
    assert.expect(3);
    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();
    var obj = {
        attr1: 1,
        attr2: 2,
        attr3: 3
    };

    var callback1 = function(prop, action, newvalue, oldvalue){
        changeDetected++ ;
        assert.ok(changeDetected===1, "attr1: Watcher 1 added");
        done1();        
    }
    
    var callback2 = function(prop, action, newvalue, oldvalue){
        changeDetected++ ;
        assert.ok(changeDetected===2, "attr1: Watcher 2 added");
        done2();
        
        if (changeDetected===2) {
            setTimeout(function() {
                assert.ok(changeDetected === 2, "attr1: Watchers removed");
                done3();
            },100);            
            WatchJS.unwatch(obj,"attr1");    // remove all watchers of attr1
            obj.attr1 = 1245;
        }
    }    
    
    var changeDetected = 0;
    WatchJS.watch(obj, "attr1", callback1);
    WatchJS.watch(obj, "attr1", callback2);
    obj.attr1 = 10;
        
});

QUnit.test("Suspend object watchers", function( assert ) {
    assert.expect(5);
    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();
    var done4 = assert.async();
    var obj = {
        attr1: 'value 1',
        attr2: 'value 2',
        attr3: 'value 3'
    };
    
    var obj2 = {
        attrA: 123,
        attrB: 456,
        attrC: 789
    };    
   
    WatchJS.watch(obj, 'attr1', function(prop, action, newvalue, oldvalue){
        assert.equal( "new value 1",newvalue, "attr1: changed" );
        obj.attr2 = "new value 2";
        
        // temporarily suspend all watchers on obj2
        WatchJS.suspend(obj2);
        obj2.attrA = 19;
        obj2.attrB = 712;
        obj2.attrC = 143;
        
        // set timeout to trigger changes to obj2 in next update cycle
        setTimeout(function(){ 
            obj2.attrA = 2192; // this change will trigger watchers;
        }, 200)
        
        done1();
    });

    WatchJS.watch(obj, 'attr2', function(prop, action, newvalue, oldvalue){
        WatchJS.suspend(obj,'attr1'); // temporarily suspend changes to attr1 to prevent inifite loop
        assert.equal( "new value 2",newvalue, "attr2: changed");
        obj.attr1 = 'new value 3'; // this change should  not trigger wattchers
        obj.attr3 = 'new value 4'; // this change should invoke watchers
        done2();
    });
    
    WatchJS.watch(obj, 'attr3', function(prop, action, newvalue, oldvalue){
        assert.equal( "new value 4",newvalue, "attr3: changed" );
        done3();
    });
    
    WatchJS.watch(obj2, function(prop, action, newvalue, oldvalue) {
        assert.equal(prop, 'attrA', prop+": changed" ); // only changes to attrA should trigger watcher 
        assert.equal(newvalue, 2192, "value set to " + newvalue); // only changes to attrA should trigger watcher 
        done4();
    });
    
    obj.attr1 = 'new value 1';
        
});


QUnit.test("Observe changes on all nested objects", function( assert ) {
    assert.expect(6);
    var done1 = assert.async();
    var done2 = assert.async();
    var obj = {
        attr1: 1,
        attr2: 2,
        object1:  {
            attrA: 3,
            attrB: 4,
            object2: {
                attrD: 123
            }
        }
    };
    
    WatchJS.watch(obj, function(prop, action, newvalue, oldvalue){
        if (obj.object1 === this) {
            assert.equal( "attrA",prop, "obj.object1.attrA: name matched" );
            assert.strictEqual(100, newvalue, "obj.object1.attrA: new value matched ");
            assert.strictEqual(3, oldvalue, "obj.object1.attrA: old value matched ");            
            done1();
        }
        else if (obj.object1.object2 === this) {
            assert.equal( "attrD",prop, "obj.object1.object2.attrD: name matched" );
            assert.strictEqual(240, newvalue, "obj.object1.object2.attrD: new value matched ");
            assert.strictEqual(123, oldvalue, "obj.object1.object2.attrD: old value matched ");            
            done2();
        }
    });
    
    obj.object1.attrA = 100;
    obj.object1.object2.attrD = 240;
});


QUnit.test("Observe changes on level 1 nested objects", function( assert ) {
    assert.expect(3);
    var done1 = assert.async();
    var obj = {
        attr1: 1,
        attr2: 2,
        object1:  {
            attrA: 3,
            attrB: 4,
            object2: {
                attrD: 123
            }
        }
    };
    
    var level = 1; // set watch level
    WatchJS.watch(obj, function(prop, action, newvalue, oldvalue){
        assert.equal( "attrA",prop, "obj.object1.attrA: name matched" );
        assert.strictEqual(100, newvalue, "obj.object1.attrA: new value matched ");
        assert.strictEqual(3, oldvalue, "obj.object1.attrA: old value matched ");            
        done1();
    }, level);
    
    obj.object1.attrA = 100;    // this should trigger the obj watchers
    obj.object1.object2.attrD = 240; // this will not triggers obj watchers
});

QUnit.test("Observe new object properties", function( assert ) {
    assert.expect(4);
    var done1 = assert.async();
    var obj = {
        dummy: undefined,
        attr1: 1,
        attr2: 2,
        attr3: 3
    };
    
    var observeNewProp = true; // observer new and deleted props
    WatchJS.watch(obj, function(prop, action, newvalue, oldvalue){
        
        var oldObj = {
            dummy: undefined,
            attr1: 1,
            attr2: 2,
            attr3: 3
        };
        
        var diff =  {
            added: ['attrA'],
            removed: []
        }
        assert.equal( "root" ,prop, "root property matched" );
        assert.equal( "differentattr" ,action, "action matched" );
        assert.deepEqual( diff ,newvalue, "New property attrA added" );
        assert.deepEqual(oldObj, oldvalue, "Old value matched ");
        done1();
    },undefined,observeNewProp);
    
    obj.attrA = 100;    // new property
});


QUnit.test("Observe deleted object properties", function( assert ) {
    assert.expect(3);
    var done1 = assert.async();
    var obj = {
        attr1: 1,
        attr2: 2,
        attr3: 3
    };
    
    var observeNewProp = true; // observer new and deleted props
    WatchJS.watch(obj, function(prop, action, newvalue, oldvalue){
        
        var oldObj = {
            attr1: 1,
            attr2: 2,
            attr3: 3
        };
        
        var diff =  {
            added: [],
            removed: ['attr1']
        }
        
        assert.equal( "root" ,prop, " root property matched" );
        assert.deepEqual( diff ,newvalue, "attr1 property removed" );
        assert.deepEqual(oldObj, oldvalue, "Old value matched ");
        done1();
    },undefined,observeNewProp);
    
    delete obj.attr1;    // delete property
});

QUnit.test("Invoke object property watchers", function( assert ) {
    assert.expect(4);
    var done1 = assert.async();
            
    var obj = {
        attr1: 1,
        attr2: 2,
        attr3: 3
    };    
    
    WatchJS.watch(obj, function(prop, action, newvalue, oldvalue){
        assert.equal( "attr2",prop, "attr2: name matched" );
        assert.equal( "set",action, "action matched" );
        assert.strictEqual(20, newvalue, "attr2: new value matched ");
        assert.strictEqual(2, oldvalue, "attr2: old value matched ");            
        done1();
    });
    
    // invoke watchers
    var newval = 20, oldval = obj.attr2;
    WatchJS.callWatchers(obj,'attr2', 'set', newval, oldval);
});    

// -- array test -------

QUnit.module("Watch array")
QUnit.test("Observe array push changes", function( assert ) {
    assert.expect(8);
    var done1 = assert.async();
    var done2 = assert.async();
            
    var list = [1,2,3,4];
    var obj = { 
        items: [1,2,3,4] 
    }
    
    var fn = function(prop, action, newvalue, oldvalue){
        assert.equal( "4",prop, "index of new item matched" );
        assert.equal( "push",action, "action matched" );
        assert.strictEqual(5, newvalue, "new value matched ");
        assert.strictEqual(undefined, oldvalue, "old value matched ");            
        if (this===obj.items) {
            done2();
        } 
        else {
            done1();
        }
    };
    
    WatchJS.watch(list, fn);
    WatchJS.watch(obj,'items', fn); 
        
    list.push(5);
    obj.items.push(5);
}); 

QUnit.test("Observe array pop changes", function( assert ) {
    assert.expect(8);
    var done1 = assert.async();
    var done2 = assert.async();
            
    var list = [1,2,3,4]
    var obj = { 
        items: [1,2,3,4] 
    }
    
    var fn = function(prop, action, newvalue, oldvalue){
        assert.equal( "3",prop, "index of removed item matched" );
        assert.equal( "pop",action, "action matched" );
        assert.strictEqual(undefined, newvalue, "new value matched ");
        assert.strictEqual(4, oldvalue, "old value matched ");            
        if (this===obj.items) {
            done2();
        } 
        else {
            done1();
        }
    };
    
    WatchJS.watch(list, fn);
    WatchJS.watch(obj,'items', fn); 
    
    list.pop();
    obj.items.pop();
});

QUnit.test("Observe array shift changes", function( assert ) {
    assert.expect(8);
    var done1 = assert.async();
    var done2 = assert.async();
    
    var list = [1,2,3,4]
    var obj = { 
        items: [1,2,3,4] 
    }
    
    var fn = function(prop, action, newvalue, oldvalue){
        assert.equal( "0",prop, "index of removed item matched" );
        assert.equal( "shift",action, "action matched" );
        assert.strictEqual(undefined, newvalue, "new value matched ");
        assert.strictEqual(1, oldvalue, "old value matched ");            
        if (this===obj.items) {
            done2();
        } 
        else {
            done1();
        }
    };
    
    WatchJS.watch(list, fn);
    WatchJS.watch(obj,'items', fn); 
    
    
    list.shift();
    obj.items.shift();
});

QUnit.test("Observe array unshift changes", function( assert ) {
    assert.expect(8);
    var done1 = assert.async();
    var done2 = assert.async();
            
    var list = [1,2,3,4]
    var obj = { 
        items: [1,2,3,4] 
    }
    
    var fn = function(prop, action, newvalue, oldvalue){
        assert.equal( "0",prop, "index of new item matched" );
        assert.equal( "unshift",action, "action matched" );
        assert.strictEqual(12, newvalue, "new value matched ");
        assert.strictEqual(undefined, oldvalue, "old value matched ");            
        if (this===obj.items) {
            done2();
        } 
        else {
            done1();
        }
    };
    
    WatchJS.watch(list, fn);
    WatchJS.watch(obj,'items', fn); 
    
    list.unshift(12);
    obj.items.unshift(12);
});

QUnit.test("Observe array sort changes", function( assert ) {
    assert.expect(8);
    var done1 = assert.async();
    var done2 = assert.async();
            
    var list = [5,8,1,3]
    var obj = { 
        items: [5,8,1,3]
    }
    
    var fn = function(prop, action, newvalue, oldvalue){
        assert.equal( "0",prop, "index matched" );
        assert.equal( "sort",action, "action matched" );
        assert.deepEqual(newvalue, [1,3,5,8], "new value matched ");
        assert.strictEqual(oldvalue, undefined, "old value matched ");            
        if (this===obj.items) {
            done2();
        } 
        else {
            done1();
        }
    };
    
    WatchJS.watch(list, fn);
    WatchJS.watch(obj,'items', fn); 
    
    list.sort();
    obj.items.sort();
});

QUnit.test("Observe array reverse changes", function( assert ) {
    assert.expect(8);
    var done1 = assert.async();
    var done2 = assert.async();
            
    var list = [1,2,3,4,5]
    var obj = { 
        items: [1,2,3,4,5]
    }
    
    var fn = function(prop, action, newvalue, oldvalue){
        assert.equal( "0",prop, "index  matched" );
        assert.equal( "reverse",action, "action matched" );
        assert.deepEqual(newvalue, [5,4,3,2,1], "new value matched ");
        assert.deepEqual(oldvalue, undefined, "old value matched ");            
        if (this===obj.items) {
            done2();
        } 
        else {
            done1();
        }
    };
    
    WatchJS.watch(list, fn);
    WatchJS.watch(obj,'items', fn); 
    
    list.reverse();
    obj.items.reverse();
});

QUnit.test("Observe array splice changes - add items", function( assert ) {
    assert.expect(10);
    var done1 = assert.async();
    var done2 = assert.async();
            
    var list = [1,2,3,4,5]
    var obj = { 
        items: [1,2,3,4,5]
    }
    var expectedResult = [1,6,8,9,2,3,4,5];
    
    var fn = function(prop, action, newvalue, oldvalue){
        assert.equal( "1",prop, "start index of spliced items matched" );
        assert.equal( "splice",action, "action matched" );
        assert.deepEqual(newvalue, [6,8,9], "new value matched");
        assert.deepEqual(oldvalue, [], "old value matched");            
        assert.deepEqual(this, expectedResult, "result matched");            
        if (this===obj.items) {
            done2();
        } 
        else {
            done1();
        }
    };
    
    WatchJS.watch(list, fn);
    WatchJS.watch(obj,'items', fn); 
    
    list.splice(1,0,6,8,9);
    obj.items.splice(1,0,6,8,9);
});

QUnit.test("Observe array splice changes - remove items", function( assert ) {
    assert.expect(10);
    var done1 = assert.async();
    var done2 = assert.async();
            
    var list = [1,2,3,4,5]
    var obj = { 
        items: [1,2,3,4,5]
    }
    var expectedResult = [1,4,5];
    
    var fn = function(prop, action, newvalue, oldvalue){
        assert.equal( "1",prop, "start index of spliced items matched" );
        assert.equal( "splice",action, "action matched" );
        assert.deepEqual(newvalue, [], "new value matched");
        assert.deepEqual(oldvalue, [2,3], "old value matched");            
        assert.deepEqual(this, expectedResult, "result matched");            
        if (this===obj.items) {
            done2();
        } 
        else {
            done1();
        }
    };
    
    WatchJS.watch(list, fn);
    WatchJS.watch(obj,'items', fn); 
    
    list.splice(1,2);
    obj.items.splice(1,2);
});

QUnit.test("Observe array splice changes - add andremove items", function( assert ) {
    assert.expect(10);
    var done1 = assert.async();
    var done2 = assert.async();
            
    var list = [1,2,3,4,5,6]
    var obj = { 
        items: [1,2,3,4,5,6]
    }
    var expectedResult = [1,2,9,0,4,'A',2,6];
    
    var fn = function(prop, action, newvalue, oldvalue){
        assert.equal( "2",prop, "start index of spliced items matched" );
        assert.equal( "splice",action, "action matched" );
        assert.deepEqual(newvalue, [9,0,4,'A',2], "new value matched");
        assert.deepEqual(oldvalue, [3,4,5], "old value matched");            
        assert.deepEqual(this, expectedResult, "result matched");            
        if (this===obj.items) {
            done2();
        } 
        else {
            done1();
        }
    };
    
    WatchJS.watch(list, fn);
    WatchJS.watch(obj,'items', fn); 
    
    list.splice(2,3,9,0,4,'A',2);
    obj.items.splice(2,3,9,0,4,'A',2);
});


QUnit.test("Observe array splice changes - add andremove items", function( assert ) {
    assert.expect(10);
    var done1 = assert.async();
    var done2 = assert.async();
            
    var list = [1,2,3,4,5,6]
    var obj = { 
        items: [1,2,3,4,5,6]
    }
    var expectedResult = [1,2,9,0,4,'A',2,6];
    
    var fn = function(prop, action, newvalue, oldvalue){
        assert.equal( "2",prop, "start index of spliced items matched" );
        assert.equal( "splice",action, "action matched" );
        assert.deepEqual(newvalue, [9,0,4,'A',2], "new value matched");
        assert.deepEqual(oldvalue, [3,4,5], "old value matched");            
        assert.deepEqual(this, expectedResult, "result matched");            
        if (this===obj.items) {
            done2();
        } 
        else {
            done1();
        }
    };
    
    WatchJS.watch(list, fn);
    WatchJS.watch(obj,'items', fn); 
    
    list.splice(2,3,9,0,4,'A',2);
    obj.items.splice(2,3,9,0,4,'A',2);
});


// -- WatchJS.onChange test ---

QUnit.module("onChange")
QUnit.test("Track object changes", function( assert ) {
    assert.expect(3);
    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();
            
    var obj = { 
        attr1:  23,
        attr2:  40,
        color:  'green',
        items: [1,2,3,4,5,6]
    }
    var expectedChange1 = {
        type: 'update',
        value : obj,        
        splices: null
    };
    
    var expectedChange2 = {
        type: 'update',
        value : obj.items,        
        splices: [
            {
                index: 2,
                deleteCount: 3,
                addedCount: 5,
                added: [9,0,4,'A',2],
                deleted: [3,4,5]
            }
        ]
    };    
    
    WatchJS.onChange(obj,function(change){
        assert.deepEqual(change, expectedChange1, "change result matched");            
        done1();
    });
    
    WatchJS.onChange(obj,'color',function(change){
        assert.equal(change.value, 'red', "color property change result matched");            
        done2();
    });
    WatchJS.onChange(obj,'items',function(change){
        assert.deepEqual(change, expectedChange2, "items array change result matched");            
        done3();
    });
        
    obj.attr2 = 124;
    obj.color = 'red';
    obj.items.splice(2,3,9,0,4,'A',2);
});



