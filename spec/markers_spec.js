var markers =require('.././os/nushi/stubmatic/markers')
var jodaDateMarker =require('.././os/nushi/stubmatic/markers').jodaDateMarker.evaluate
var jodaDateMarker2 =require('.././os/nushi/stubmatic/markers').jodaDateMarker2.evaluate
var expressions =require('.././os/nushi/stubmatic/expressions_handler')
var util =require('.././os/nushi/stubmatic/util/util')

describe("TODAY Marker", function() {
  var today = new Date();

  it("should return current date", function() {
  	var result = markers.dateMarker.evaluate(['TODAY', null, null ]);
  	assertDatePart(today,result);
  });

  it("should return yesterday date", function() {
  	var yesterday = new Date();
	yesterday.setDate(today.getDate() - 1);

  	var result = markers.dateMarker.evaluate([ 'TODAY-1', '-', '1' ]);
    assertDatePart(yesterday,result);

  	result = markers.dateMarker2.evaluate([ 'TODAY-1d', '-1d' ]);
    assertDatePart(yesterday,result);
  });

  it("should return tomorrow date", function() {
  	var tomorrow = new Date();
	tomorrow.setDate(today.getDate() + 1);

  	var result = markers.dateMarker.evaluate([ 'TODAY+1', '+', '1' ]);
    assertDatePart(tomorrow,result);

  	result = markers.dateMarker2.evaluate([ 'TODAY+1d', '+1d' ]);
    assertDatePart(tomorrow,result);
  });

  it("should return appropriate date", function() {
  	var futuredt = new Date();
	futuredt.setFullYear(today.getFullYear() + 1);

  	var result = markers.dateMarker2.evaluate([ 'TODAY+1y', '+1y']);
    assertDatePart(futuredt,result);

	futuredt.setMonth(today.getMonth() - 2);
	result = markers.dateMarker2.evaluate([ 'TODAY+1y-2m', '+1y','-2m']);
    assertDatePart(futuredt,result);
	
	futuredt.setDate(today.getDate() + 3);
	result = markers.dateMarker2.evaluate([ 'TODAY+1y-2m+3d', '+1y','-2m', '+3d']);
    assertDatePart(futuredt,result);

  });
});

describe("JODA_TODAY Marker", function() {
	var JODA_today = require('js-joda').LocalDateTime.now();

  it("should return current date", function() {
  	var result = jodaDateMarker(['JODA_TODAY', null, null ]);
  	assertJodaDatePart(JODA_today,result);
  });

  it("should return yesterday date", function() {
  	var yesterday = JODA_today.minusDays(1);
  	var result = jodaDateMarker([ 'JODA_TODAY-1', '-', '1' ]);
    assertJodaDatePart(yesterday,result);

  	result = jodaDateMarker2([ 'JODA_TODAY-1d', '-1d' ]);
    assertJodaDatePart(yesterday,result);
  });

  it("should return tomorrow date", function() {
  	var tomorrow = JODA_today.plusDays(1);
  	var result = jodaDateMarker([ 'JODA_TODAY+1', '+', '1' ]);
    assertJodaDatePart(tomorrow,result);

  	result = jodaDateMarker2([ 'JODA_TODAY+1d', '+1d' ]);
    assertJodaDatePart(tomorrow,result);
  });

  it(" should return appropriate date", function() {
  	var futuredt = JODA_today;

  	futuredt = futuredt.plusYears(1);
  	var result = jodaDateMarker2([ 'JODA_TODAY+1y', '+1y']);
    assertJodaDatePart(futuredt,result);

	futuredt = futuredt.minusMonths(2);
	result = jodaDateMarker2([ 'JODA_TODAY+1y-2m', '+1y','-2m']);
    assertJodaDatePart(futuredt,result);
	
	futuredt = futuredt.plusDays(3);
	result = jodaDateMarker2([ 'JODA_TODAY+1y-2m+3d', '+1y','-2m', '+3d']);
    assertJodaDatePart(futuredt,result);

  });
  
});

function assertDatePart(expected,actual){
	expect(expected.getDate()).toBe(actual.getDate());
    expect(expected.getMonth()).toBe(actual.getMonth());
    expect(expected.getYear()).toBe(actual.getYear());
}

function assertJodaDatePart(expected,actual){
	expect(expected.dayOfMonth()).toBe(actual.dayOfMonth());
    expect(expected.monthValue()).toBe(actual.monthValue());
    expect(expected.year()).toBe(actual.year());
}