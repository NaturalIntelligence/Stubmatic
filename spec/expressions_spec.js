var expressionHandler =require('.././os/nushi/stubmatic/expressions_handler');
var jasmine = require("jasmine-core");
var markers =require('.././os/nushi/stubmatic/markers');
var LocalDateTime = require('js-joda').LocalDateTime;

describe("Expression handler", function() {

  it("should process Date marker", function() {
  	spyOn(markers, 'now').and.callFake(() => new Date(2016,11,29,16,43,57));
    spyOn(markers, 'nowJoda').and.callFake(() => LocalDateTime.of(2016,12,29,16,43,57));

  	var expected = "today is Thu Dec 29 2016 16:43:57 GMT+0000 (GMT), tomorrow is Fri Dec 30 2016 16:43:57 GMT+0000 (GMT), and yesterday it was Wed Dec 28 2016 16:43:57 GMT+0000 (GMT)";

  	var result = expressionHandler.handle("today is {{TODAY}}, tomorrow is {{TODAY+1}}, and yesterday it was {{TODAY-1}}");
  	expect(result).toBe(expected);

  	result = expressionHandler.handle("today is {{JODA_TODAY}}, tomorrow is {{JODA_TODAY+1}}, and yesterday it was {{JODA_TODAY-1}}");
  	expect(result).toBe(expected);


  	expected = "today is Thu Dec 29 2016 16:43:57 GMT+0000 (GMT), tomorrow is Fri Dec 30 2016 16:43:57 GMT+0000 (GMT), and yesterday it was Wed Dec 28 2016 16:43:57 GMT+0000 (GMT)";

  	result = expressionHandler.handle("today is {{TODAY}}, tomorrow is {{TODAY+1d}}, and yesterday it was {{TODAY-1d}}");
  	expect(result).toBe(expected);

  	result = expressionHandler.handle("today is {{JODA_TODAY}}, tomorrow is {{JODA_TODAY+1d}}, and yesterday it was {{JODA_TODAY-1d}}");
  	expect(result).toBe(expected);

  });

  it("should process urlEncode function", function() {
  	var expected = "Encode the URL: https://www.google.co.uk/?gws_rd=ssl#safe=strict&q=ola%20ola";

  	var result = expressionHandler.handle("Encode the URL: {{urlEncode('https://www.google.co.uk/?gws_rd=ssl#safe=strict&q=ola ola')}}");
  	expect(result).toBe(expected);
  });

  it("should process formatDate function", function() {
  	var expected = "So the date is Fri Friday Dec 2016, 23:45:23";

  	var result = expressionHandler.handle("So the date is {{formatDate(new Date(2016,11,2,23,45,23),'D DD MMM YYYY, HH:mm:ss')}}");
  	expect(result).toBe(expected);
  });

  it("should process any JS function", function() {
  	var expected = "This is JS Math.floor function result 45";

  	var result = expressionHandler.handle("This is JS Math.floor function result {{ JS(Math.floor( 45.95))}}");
  	expect(result).toBe(expected);
  });

  it("should process any JS exp", function() {
  	var expected = "This is JS exp 3+5-6 results in 2";

  	var result = expressionHandler.handle("This is JS exp 3+5-6 results in {{ JS(3+5-6) garbage}}");
  	expect(result).toBe(expected);
  });

  it("should process random function", function() {
  	var result = expressionHandler.handle("This is randome function results {{random(5)}}");
  	expect(result.length).toBe(38);

  	result = expressionHandler.handle("This is randome function results {{random(5,'alpha_num')}}");
  	expect(result.length).toBe(38);
  });

  it("should process markers firsts then function", function() {
  	spyOn(markers, 'now').and.callFake(() => new Date(2016,11,29,16,43,57));

  	var expected = "So the date is Mon 26 Monday Feb 2018, 16:43:57";

  	var result = expressionHandler.handle("So the date is {{formatDate(TODAY+2m-3d+1y,'D dd DD MMM YYYY, HH:mm:ss')}}");
  	expect(result).toBe(expected);
  });  
});

