var expressionEngine = require('.././os/nushi/stubmatic/expressions/engine');
var process = require('.././os/nushi/stubmatic/expressions/engine').process;
var evalMarker = require('.././os/nushi/stubmatic/expressions/engine').evaluateMarker;
var fetch = require('.././os/nushi/stubmatic/expressions/engine').fetch;

var markers = require('.././os/nushi/stubmatic/markers');
var fns = require('.././os/nushi/stubmatic/functions');

describe("Expression:: it ", function() {
  var today = new Date();

  it("should not change in data when no expression is found", function() {
  	var data = "This {data} has no { {expression}} ."
  	var expressions = expressionEngine.fetch(data);
  	expect(expressions.length).toBe(0);
  });

  it("should find expressions", function() {
  	var data = "This {data} has some {{expressions}}{{,and this.}} ."
  	var expressions = expressionEngine.fetch(data);
  	expect(expressions.length).toBe(2);//Test Actual Data
  });

  it("should replace expressions", function() {
  	spyOn(expressionEngine,'evaluate').and.callFake(() => "Amit Gupta");

  	var data = "This {data} has some {{expressions}}{{,and this.}} ."
  	expect(process(data,fetch(data))).toBe("This {data} has some Amit GuptaAmit Gupta .");

  	data = "{{expressions}}some{{,and this.}} ."
  	expect(process(data,fetch(data))).toBe("Amit GuptasomeAmit Gupta .");

  	data = "{data} has some {{expressions}}{{,and this.}}"
  	expect(process(data,fetch(data))).toBe("{data} has some Amit GuptaAmit Gupta");
  });

  it("should evaluated nested, flat, and unknown expressions", function() {
    markers.foo = {
      exp : "foo##",
      evaluate : function(result){
        return "bar$$";
      }
    };
    markers.bar = {
      exp : "bar\\$\\$",
      evaluate : function(result){
        return "amit";
      }
    };

    var data = "expressions {{foo##}},{{bar$$}},{{unknown}}.";
    expect(process(data,fetch(data))).toBe("expressions amit,amit,unknown.");

    delete markers.foo;
    delete markers.bar;
  });

  it("should evaluated flat, nested, and unknown functions with nexted expressions", function() {
    fns.foo = function(arg1,arg2){
      return arg1 + ":" + arg2;
    }
    fns.bar = function(data){
      return data;
    }

    markers.foo = {
      exp : "foo##",
      evaluate : function(result){
        return "bar$$";
      }
    };
    markers.bar = {
      exp : "bar\\$\\$",
      evaluate : function(result){
        return "gupta";
      }
    };


    var data = "expressions "
        +"{{foo('key','value')}},"
        +"{{foo(bar('amit'),foo##)}},"
        +"{{foo(bar('amit'),28)}},"
        +"{{foo('key',bar('amit'))}},"
        +"{{bar(35))}},"
        +"{{unknown()}}.";
    expect(process(data,fetch(data))).toBe("expressions key:value,amit:gupta,amit:28,key:amit,35),.");

    delete fns.foo;
    delete fns.bar;
    delete markers.foo;
    delete markers.bar;
  });
});