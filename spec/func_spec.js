var formatDate =require('.././os/nushi/stubmatic/functions').formatDate;
var random =require('.././os/nushi/stubmatic/functions').random;
var dump =require('.././os/nushi/stubmatic/functions').dump;
//var anyDateBetween =require('.././os/nushi/stubmatic/functions').anyDateBetween;
var config = require(".././os/nushi/stubmatic/configbuilder");

describe("Function ", function() {
  var today = new Date();

  it("formatDate should format date", function() {
  	var result = formatDate(new Date(2016,11,2,23,45,23), "D DD MMM YYYY, HH:mm:ss");
  	expect("Fri Friday Dec 2016, 23:45:23").toBe(result);
  });	

  it("random should give random string of specified length ", function() {
  	expect(random(3)).toMatch(/[0-9]{3}/);
  	expect(0).toBe(random(-1).length);
  	expect(random(3,'num')).toMatch(/[0-9]{3}/);
  	expect(random(3,'alpha')).toMatch(/[a-z]{3}/);
  	expect(random(5,'alpha_num')).toMatch(/[a-z0-9]{5}/);
  });

  /*it("anyDateBetween should give random date between 2 dates ", function() {
  	var today = new Date();
  	var pastDate = new Date();
  	pastDate.setDate(pastDate.getDate - 5);

  	var dt = anyDateBetween(pastDate,today);

  	console.log(dt);
  	expect(true).toBe(today > dt);
  	expect(true).toBe(pastDate < dt);
  	

  });*/

  it("dump should include files", function() {
    spyOn(config,'getConfig').and.callFake(() => { return {dumps : __dirname } });
    var result = dump("",['dummy.txt','dummy.txt']);
    expect(result).toBe("This is dummy file to test dump {{randome(5)}}.This is dummy file to test dump {{randome(5)}}.");

    result = dump("",['dummy.txt','notexist']);
    expect(result).toBe("This is dummy file to test dump {{randome(5)}}.");

    expect(dump("",[])).toBe("");
  }); 

});