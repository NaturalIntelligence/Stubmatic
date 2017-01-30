var path = require('path');
var fs = require('fs');


var copyRecursiveSync = function(src, dest, cb) {
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
  	copyFile(src,dest,function(err){
  		cb(err);
  	});
  }
};

function copyFile(source, target) {
  fs.writeFileSync(target, fs.readFileSync(source));
}

exports.init = function(dest){
	var srcPath = path.join(__dirname, '/lib/sample_repo/'); 
	var destPath = path.join(process.cwd(), dest) ;
	copyRecursiveSync(srcPath, destPath, function(err){
    if(err) {
      console.log("Error in creating quick repo.");
    }else{
      console.log('stubmatic repo is ready for use.');
    }
  });
  
}
