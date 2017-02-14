var path = require('path');
var fs = require('fs');

var copyRecursiveSync = function(src, dest) {
  var exists = fs.existsSync(src);
  var stats = exists && fs.statSync(src);
  var isDirectory = exists && stats.isDirectory();
  if(stats.isDirectory()) {
    fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursiveSync(path.join(src, childItemName),
                        path.join(dest, childItemName));
    });
  } else {
    fs.writeFileSync(dest, fs.readFileSync(src));
  }
};

exports.init = function(dest){
	var srcPath = path.join(__dirname, '/lib/sample_repo/'); 
	var destPath = path.join(process.cwd(), dest) ;
  try{
	  copyRecursiveSync(srcPath, destPath);
    console.log("Created successfully.");
  }catch(err){
    if(err.code === "EEXIST"){
      console.log(dest + " already exists");
    }else{
      console.log(err);
    }
  }
}
