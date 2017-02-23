var init =require('.././init');
var dircompare = require('dir-compare');
var path = require('path');

describe("Init", function() {

  it("should create sample repo with given name", function() {
      spyOn(console, "log");

      init.init("spec/stubrepo");
      
      var res = dircompare.compareSync(path.join(__dirname,"../lib/sample_repo"), path.join(__dirname,"stubrepo"), {compareSize: true});
      expect(res.equalFiles).toBe(7);
      expect(res.equalDirs).toBe(4);
      expect(res.totalFiles).toBe(7);
      expect(res.totalDirs).toBe(4);
      expect(console.log).toHaveBeenCalledWith("Created successfully.");
  });

  it("should not create repo if it already exist", function() {
      spyOn(console, "log");
      
      init.init("spec/stubrepo");
      
      expect(console.log).toHaveBeenCalledWith("spec/stubrepo already exists");
  });

  it("should not create repo if path doesn't exist", function() {
      spyOn(console, "log");
      
      init.init("temp/stubrepo");
      
      expect(console.log).toHaveBeenCalledTimes(1);
  });


  it("teardown", function() {
        deleteFolderRecursive(path.join(__dirname,"stubrepo"));
  });

});

var fs = require('fs');
var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};