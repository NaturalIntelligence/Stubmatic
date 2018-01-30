var markers =require('.././lib/markers')
var jodaDateMarker =require('.././lib/markers').jodaDateMarker.evaluate
var jodaDateMarker2 =require('.././lib/markers').jodaDateMarker2.evaluate
var util =require('.././lib/util/util');
var LocalDateTime = require('js-joda').LocalDateTime;

describe("Marker", function() {
  //var today = new Date(2016,11,29,16,43,57);
  var today = new Date("Dec 29 2016 16:43:57 GMT+0000 (GMT)");

  beforeEach(function(){
    spyOn(markers, 'now').and.returnValue(new Date("Dec 29 2016 16:43:57 GMT+0000 (GMT)"));
  });

  it("TODAY should return current date", function() {
  	var result = markers.dateMarker.evaluate(['TODAY', null, null ]);
    result = new Date(result.valueOf() + result.getTimezoneOffset() * 60000);
    expect(result.toString()).toMatch(/Thu Dec 29 2016 16:43:57 GMT\+[0-9]{4} \([A-Z]{3}\)/);
  });

  it("TODAY-1 should return yesterday date", function() {
  	var result = markers.dateMarker.evaluate([ 'TODAY-1', '-', '1' ]);
    result = new Date(result.valueOf() + result.getTimezoneOffset() * 60000);
    expect(result.toString()).toMatch(/Wed Dec 28 2016 16:43:57 GMT\+[0-9]{4} \([A-Z]{3}\)/);
  });

  it("TODAY-1d should return yesterday date", function() {
  	var result = markers.dateMarker2.evaluate([ 'TODAY-1d', '-1d' ]);
    result = new Date(result.valueOf() + result.getTimezoneOffset() * 60000);
    expect(result.toString()).toMatch(/Wed Dec 28 2016 16:43:57 GMT\+[0-9]{4} \([A-Z]{3}\)/);
  });

  it("TODAY+1 should return tomorrow date", function() {
  	var result = markers.dateMarker.evaluate([ 'TODAY+1', '+', '1' ]);
    result = new Date(result.valueOf() + result.getTimezoneOffset() * 60000);
    expect(result.toString()).toMatch(/Fri Dec 30 2016 16:43:57 GMT\+[0-9]{4} \([A-Z]{3}\)/);
  });

  it("TODAY+1d should return tomorrow date", function() {
  	var result = markers.dateMarker2.evaluate([ 'TODAY+1d', '+1d' ]);
    result = new Date(result.valueOf() + result.getTimezoneOffset() * 60000);
    expect(result.toString()).toMatch(/Fri Dec 30 2016 16:43:57 GMT\+[0-9]{4} \([A-Z]{3}\)/);
  });

  it("TODAY+1y should return a date after an year", function() {
  	var result = markers.dateMarker2.evaluate([ 'TODAY+1y', '+1y']);
    result = new Date(result.valueOf() + result.getTimezoneOffset() * 60000);
    expect(result.toString()).toMatch(/Fri Dec 29 2017 16:43:57 GMT\+[0-9]{4} \([A-Z]{3}\)/);
	});

  it("TODAY+1y-2m should return a date after 10 months", function() {
	  var result = markers.dateMarker2.evaluate([ 'TODAY+1y-2m', '+1y','-2m']);
    result = new Date(result.valueOf() + result.getTimezoneOffset() * 60000);
    expect(result.toString()).toMatch(/Sun Oct 29 2017 16:43:57 GMT\+[0-9]{4} \([A-Z]{3}\)/);
  });

  it("TODAY+1y-2m+15d should return a date after 10 months and 3 days", function() {
	  var result = markers.dateMarker2.evaluate([ 'TODAY+1y-2m+15d', '+1y','-2m', '+15d']);
    result = new Date(result.valueOf() + result.getTimezoneOffset() * 60000);
    expect(result.toString()).toMatch(/Mon Nov 13 2017 16:43:57 GMT\+[0-9]{4} \([A-Z]{3}\)/);
  });

  it("TODAY+2m should return next month date when date spills in next month", function() {
    var result = markers.dateMarker2.evaluate([ 'TODAY+2m', '+2m']);
    result = new Date(result.valueOf() + result.getTimezoneOffset() * 60000);
    expect(result.toString()).toMatch(/Wed Mar 01 2017 16:43:57 GMT\+[0-9]{4} \([A-Z]{3}\)/);
  });

});

describe("Marker", function() {
	var today = LocalDateTime.of(2016,12,29,16,43,57);
  var yesterday = LocalDateTime.of(2016,12,28,16,43,57);
  var tomorrow = LocalDateTime.of(2016,12,30,16,43,57);

  beforeEach(function(){
    spyOn(markers, 'nowJoda').and.returnValue(LocalDateTime.of(2016,12,29,16,43,57));
  });

  it("JODA_TODAY should return current date", function() {
  	var result = jodaDateMarker(['JODA_TODAY', null, null ]);
    expect(result.toString()).toMatch(/Thu Dec 29 2016 16:43:57 GMT\+[0-9]{4} \([A-Z]{3}\)/);
  });

  it("JODA_TODAY-1 should return yesterday date", function() {
  	var result = jodaDateMarker([ 'JODA_TODAY-1', '-', '1' ]);
    expect(result.toString()).toMatch(/Wed Dec 28 2016 16:43:57 GMT\+[0-9]{4} \([A-Z]{3}\)/);

  });

  it("JODA_TODAY-1d should return yesterday date", function() {
  	result = jodaDateMarker2([ 'JODA_TODAY-1d', '-1d' ]);
    expect(result.toString()).toMatch(/Wed Dec 28 2016 16:43:57 GMT\+[0-9]{4} \([A-Z]{3}\)/);
  });

  it("JODA_TODAY+1 should return tomorrow date", function() {
  	var result = jodaDateMarker([ 'JODA_TODAY+1', '+', '1' ]);
    expect(result.toString()).toMatch(/Fri Dec 30 2016 16:43:57 GMT\+[0-9]{4} \([A-Z]{3}\)/);
  });

  it("JODA_TODAY+1d should return tomorrow date", function() {
  	result = jodaDateMarker2([ 'JODA_TODAY+1d', '+1d' ]);
    expect(result.toString()).toMatch(/Fri Dec 30 2016 16:43:57 GMT\+[0-9]{4} \([A-Z]{3}\)/);
  });

  it("JODA_TODAY+1y should return appropriate date", function() {
  	var result = jodaDateMarker2([ 'JODA_TODAY+1y', '+1y']);
    expect(result.toString()).toMatch(/Fri Dec 29 2017 16:43:57 GMT\+[0-9]{4} \([A-Z]{3}\)/);

  });

  it("JODA_TODAY+1y-2m should return appropriate date", function() {
	  result = jodaDateMarker2([ 'JODA_TODAY+1y-2m', '+1y','-2m']);
    expect(result.toString()).toMatch(/Sun Oct 29 2017 16:43:57 GMT\+[0-9]{4} \([A-Z]{3}\)/);
	});

  it("JODA_TODAY+1y-2m+15d should return appropriate date", function() {
    result = jodaDateMarker2([ 'JODA_TODAY+1y-2m+15d', '+1y','-2m', '+15d']);
    expect(result.toString()).toMatch(/Mon Nov 13 2017 16:43:57 GMT\+[0-9]{4} \([A-Z]{3}\)/);

  });
  
  it("TODAY+2m should return last date of previous month when date spills in next month", function() {
    var result = markers.jodaDateMarker2.evaluate([ 'TODAY+2m', '+2m']);
    expect(result.toString()).toMatch(/Tue Feb 28 2017 16:43:57 GMT\+[0-9]{4} \([A-Z]{3}\)/);

  });

});

function assertDatePart(expected,actual){
  expect(expected.getDate()).toBe(actual.getDate());
  expect(expected.getMonth()).toBe(actual.getMonth());
  expect(expected.getYear()).toBe(actual.getYear());
}

var dbsetsLoader = require('.././lib/loaders/dbset_loader');
var hashes = require('hashes');
var dbkeys =require('.././lib/markers').dbkeys.evaluate;
describe("Marker", function() {

  beforeEach(function(){
    var empTable = new hashes.HashTable();
    empTable.add("3456",{ "id" : "3456","name":"amit gupta", "age" : "30"});
    empTable.add("1234",{ "id" : "1234","name":"arti gupta", "age" : "30"});
    empTable.add("*",{ "id" : "*","name":"unknown name", "age" : "100"});

    var deptTable = new hashes.HashTable();
    deptTable.add("d1",{ "dept_id" : "d1","name":"Science department"});
    deptTable.add("d2",{ "dept_id" : "d2","name":"Physics department"});

    var fakedbset = [];
    fakedbset["emp"]= empTable;
    fakedbset["dept"]= deptTable;

    spyOn(dbsetsLoader, 'getDBsets').and.callFake(() => { return fakedbset} );
  });

  it("dbkeys (#key) should return value from dbset", function() {
    var rc = { resolved : { dbset : { db: "emp", key: "3456" }}};
    var result = dbkeys(['#name', 'name', null ],rc);
    expect(result).toBe("amit gupta");

    rc = { resolved : { dbset : { db: "emp", key: "1234" }}};
    result = dbkeys(['#name', 'name', null ],rc);
    expect(result).toBe("arti gupta");

  });

  it("dbkeys (#key) should return empty string", function() {
    var rc = { resolved : { dbset : { db: "dept", key: "7890" }}};
    var result = dbkeys(['#name', 'name', null ],rc);
    expect(result).toBe("");
  });

});

