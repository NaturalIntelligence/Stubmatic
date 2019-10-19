//@ts-check
const intoStream = require('into-stream');
const pump = require('pump');
const Accept = require('accept');
var zlib = require('zlib');
var fsUtil = require('./util/fileutil');
var util = require('./util/util');
var fs = require('fs');
var logger = require('./log');
var ApplicationError = require('./ApplicationError');

const supportedEncodings = {
    "gzip" : zlib.createGzip,
    "deflate" : zlib.createDeflate
};

module.exports = function(response, data, opt, encodingHeader){
    let dataStream;

    if(opt.skipProcessing ){ //file content can be sent as stream
        dataStream = getFileStream(data, response)//data is filename in this case
    }else{
        dataStream = intoStream(data);
    }
    if(encodingHeader){
        dataStream = getEncodingStream(encodingHeader, response, dataStream);
    }
    pump( dataStream , response);
        
        // //dataStream.pipe( encodingStream() ).pipe(response);
        // //pump( dataStream,   encodingStream() , response);
        // response.setHeader("content-length", data.length);
        // response.write(data);
		// response.end("");
}

function getEncodingStream(encodingHeader, response, dataStream){
    let encodingName = encodingHeader;
    if(encodingName === "*"){
        encodingName = "gzip";
    }

    let encodingStream = supportedEncodings[ encodingName ];//when only one encoding name is given

    if( !encodingStream ){//when multiple encoding schems are acceptable 
        const acceptTypes = Accept.encodings( encodingHeader );
        for(let i=0;i<acceptTypes.length && !encodingStream; i++){
            encodingName = acceptTypes[i];
            if(encodingName === "*"){
                encodingName = "gzip";
            }
            encodingStream = supportedEncodings[ encodingName  ];
        }
    }

    if(encodingStream){//supported
        response.setHeader("content-encoding",  encodingName);
        response.removeHeader("content-length")
        return pump( dataStream,   encodingStream());
    }else{
        return dataStream;
    }
}

function getFileStream(fileName, response){
    if(fsUtil.isExist(fileName)){
        //pump( fs.createReadStream(fileName) , response);
        return fs.createReadStream(fileName);
    }else{
        throw new ApplicationError(fileName + " doesn't exist", response);
    }
}

