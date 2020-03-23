const intoStream = require('into-stream');
const pump = require('pump');
const Accept = require('accept');
var zlib = require('zlib');
var fsUtil = require('./util/fileutil');
var util = require('./util/util');
var fs = require('fs');
var logger = require('./log');

const supportedEncodings = {
    "gzip" : zlib.createGunzip,
    "deflate" : zlib.createInflate
};


/**
 * Check response data if compressed and write it to the filesystem.
 */
module.exports = function(response, responseRecieved, fileName){
    let encodingName = responseRecieved.headers["content-encoding"];
    if(encodingName){
        let encodingStream = supportedEncodings[ encodingName ];//when only one encoding name is given
        if( !encodingStream ){//when multiple encoding schems are acceptable 
            const acceptTypes = Accept.encodings( encodingName );
            for(let i=0;i<acceptTypes.length && !encodingStream; i++){
                encodingName = acceptTypes[i];
                /* if(encodingName === "*"){
                    encodingName = "gzip";
                } */
                encodingStream = supportedEncodings[ encodingName  ];
            }
        }
        pump(pump(responseRecieved.data, encodingStream()), fs.createWriteStream(fileName));

    }else{
        pump(responseRecieved.data, fs.createWriteStream(fileName));
    }
    response.headers = util.clone(responseRecieved.headers);
    response.statusCode = responseRecieved.status;
    response.writeHead(responseRecieved.status, responseRecieved.headers); 
    responseRecieved.data.on('end', function(){
        response.end();
        //responseRecieved.data.destroy();
     });
     responseRecieved.data.pipe(response);
}