var config = require('.././lib/configbuilder');
var dbsetsLoader = require('.././lib/loaders/dbset_loader');
//var hashes = require('hashes');
var path = require('path');
var fs = require('fs');
var dbkeys =require('.././lib/markers').dbkeys.evaluate;


describe("DBsetloader ", function() {



  /*it("dbkeys (#key) should return empty string", function() {
    
    

  });

  
  beforeEach(function(){
    spyOn(config,'getConfig').and.callFake(() => { return {dbsets : path.join(__dirname , 'test_assets/dbsets') } }); 
  });

  it("dbkeys (#key) should return value from dbset", function() {
    dbsetsLoader.load();

    console.log(dbsetsLoader.getDBsets());
    var rc = { resolved : { dbset : { db: "emp", key: "3456" }}};
    var result = dbkeys(['#name', 'name', null ],rc);
    expect(result).toBe("amit gupta");

    rc = { resolved : { dbset : { db: "emp", key: "1234" }}};
    result = dbkeys(['#name', 'name', null ],rc);
    expect(result).toBe("arti gupta");

  });*/

  /*it("dbkeys (#key) should return default value from dbset", function() {
    var rc = { resolved : { dbset : { db: "emp", key: "7890" }}};
    var result = dbkeys(['#name', 'name', null ],rc);
    expect(result).toBe("unknown name");
  });

  it("dbkeys (#key) should return empty string", function() {
    var rc = { resolved : { dbset : { db: "dept", key: "7890" }}};
    var result = dbkeys(['#name', 'name', null ],rc);
    expect(result).toBe("");
  });*/

});

