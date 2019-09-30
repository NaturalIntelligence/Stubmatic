const intoStream = require('into-stream');
const pump = require('pump');
const Accept = require('accept');
var zlib = require('zlib');
var fsUtil = require('./util/fileutil');
var fs = require('fs');
var logger = require('./log');

const supportedEncodings = {
    "gzip" : zlib.createGzip,
    "deflate" : zlib.createDeflate
};

const isStream = function(data){
    return data && data.pipe && (typeof data.pipe === "function")
}

module.exports = function(response, data, opt, encodingHeader){

    if(encodingHeader){
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

        let dataStream;

        if(opt.sendasfile){
            if(fsUtil.isExist(data)){
                dataStream = fs.createReadStream(data);//data is filename in this case
            }else{
                logger.error(data + " doesn't exist");
                response.removeHeader("content-type");
                response.statusCode = 500;
                response.end("");
                return;
            }
        }else{
            const isItAStream = isStream(data);
            
            response.setHeader("content-encoding",  encodingName);
            response.removeHeader("content-length")

            if( !isItAStream ){
                dataStream = intoStream(data);    
            }else{
                dataStream = data;
            }
        }
        pump( pump(dataStream,   encodingStream() ), response);
    }else{
        response.setHeader("content-length", data.length);
        response.write(data);
		response.end("");	
    }

	

}