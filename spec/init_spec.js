var init =require('.././init');
var dircompare = require('dir-compare');
var path = require('path');

xdescribe("Init", function() {

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