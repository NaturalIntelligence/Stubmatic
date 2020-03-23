// @ts-check
var fs = require('fs');
var fileutil = require('./util/fileutil');
var path = require('path');
var logger = require('./log');

module.exports = class ConfigBuilder {

	constructor(){
		this.config = {}
	}

	/**
	use current directory if -d is not given
	use config.json if -c is not given
	use directory structure if config.json is missing and -c is not given
	**/
	build(options){
		this.config = {
			mappings: {},
			server:{},
			recordAndPlay : {
				mapping: {
				  headers : true,
				  queryParam : true,
				  hashStrig : true,
				  skipHeaders : []
				}
			  }
		};
		var repoPath = options['-d'] || ".";
		var configFile = path.join(repoPath,options['-c'] || "config.json");
	
		

		if( fileutil.isExist(configFile) ){ //based config.json
			this.config = Object.assign( this.config, JSON.parse(fs.readFileSync(configFile,{encoding: 'utf-8'})));
			this._updateBasePath(repoPath);
		}else{ //based on directory structure
			logger.warn("Not able to read "+ configFile+".Building configuration from directory structure");
			this._buildFromDirectory(repoPath);
		}
		this.config.repoPath = repoPath;
		if(!this.config.server){
			this.config.server = {};
		}
		if(options['--from']) this.config.from = options['--from'];
		if(options['--record']) {
			this.config.stubs = options['--record'];
			this.config.recordAndPlay.path = options['--record'];
			this.config.mappings.loadFromRecording = true;
		}
		if(! this.config.recordAndPlay.path) this.config.recordAndPlay.path = this.config.stubs;

		this.config.server.port = options['-p'] || this.config.server.port || 7777;
		this.config.server.host = options['--host'] || this.config.server.host || '0.0.0.0';
		if(options['-P']) this.config.server.securePort = options['-P'];
		if(options['--mutualSSL'])this.config.server.mutualSSL = options['--mutualSSL'];

		logger.debug("Configuration:");
		logger.debug(JSON.stringify(this.config,null,4));

		if(this.config.server.securePort){
			this.config.server.httpsOptions = buildSecureServerConfig(this.config);
			this.config.server.httpsOptions.port = this.config.server.securePort;
			delete this.config.server.securePort;
		}

		return this.config;
	}

	/**
	transforms all the path given in cofiguration file to absolute path
	**/
	_updateBasePath(basePath){

		this.config.datatables = joinPath(basePath , this.config.datatables);
		this.config.stubs = joinPath(basePath , this.config.stubs);
		this.config.dumps = joinPath(basePath , this.config.dumps);

		this.config.recordAndPlay.path = joinPath(basePath , this.config.recordAndPlay.path);
	
		var files = this.config.mappings.files;
		var newMappings = [];
		for(let i=0; i<files.length; i++){
			newMappings.push(path.join(basePath , files[i]));
		}
	
		//TODO: if mappings.loadFromRecording: true
		this.config.mappings.files = newMappings;
	
		if(this.config.server){
			if(this.config.server.key){
				this.config.server.key = path.join(basePath , this.config.server.key);
			}
	
			if(this.config.server.cert){
				this.config.server.cert = path.join(basePath , this.config.server.cert);
			}
	
			if(this.config.server.ca){
				var newcerfiles = [];
				this.config.server.ca.forEach(function(cert){
					newcerfiles.push(path.join(basePath , cert));
				});
				this.config.server.ca = newcerfiles;
			}
	
		}
	}
	
	/*
	build configurtaion on the basis of directory structure
	It'll ignore if there is any config file in specified directory.
	It update the path of : mappings, dbsets, and stubs, whichever is present
	*/
	_buildFromDirectory(dirPath){
		this.config.datatables = joinPathIfExists(dirPath, "datatables");
		this.config.stubs = joinPathIfExists(dirPath, "stubs");
		this.config.dumps = joinPathIfExists(dirPath, "dumps");
		this.config.recordAndPlay.path = joinPathIfExists(dirPath, "recordings");
	
		var mappingsPath = path.join(dirPath,"mappings");
		var files = fileutil.ls(mappingsPath);
		if(files.length > 0){
			this.config.mappings.files = [];
			for(let i=0; i<files.length; i++){
				this.config.mappings.files.push(path.join(mappingsPath , files[i]));
			}
		}
	
		var trustStorePath = path.join(dirPath,"truststore");
		if(fileutil.isExist(trustStorePath)){
			this.config.server.key = path.join(trustStorePath , "server.key");
			this.config.server.cert = path.join(trustStorePath , "server.crt");
	
			var cacertPath = path.join(trustStorePath,"ca");
			var cacerts = fileutil.ls(cacertPath);
	
			if(cacerts.length > 0){
				this.config.server.ca = [];
				for(let i=0; i<cacerts.length; i++){
					this.config.server.ca.push(path.join(cacertPath , cacerts[i]));
				}
			}
		}
	
	}

}

 
function buildSecureServerConfig(config){
	let options = {};

	if( config.server.key && config.server.cert ){
		const options = {
			key: fs.readFileSync(config.server.key),
			cert: fs.readFileSync(config.server.cert)
		};
		if(config.server.ca){
			options.ca = [];
			config.server.ca.forEach(function(cert){
				options.ca.push(fs.readFileSync(cert));
			});
		}
	}else{
		const certPath = path.join(__dirname, "./certs");
		const options = {
			key: fs.readFileSync(path.join( certPath, "server.key") ),
			cert: fs.readFileSync(path.join( certPath, "server.crt") ),
			ca: [ fs.readFileSync(path.join( certPath, "server.csr") ) ]
		};
	}
    if(config.server.mutualSSL === true){
        options.requestCert= true;
        options.rejectUnauthorized= true;
    }

    return options;
}

/**
 * Join path if given
 * @param {string} basePath 
 * @param {string} relativePath 
 */
function joinPath(basePath, relativePath){
	if(relativePath){
		return path.join(basePath , relativePath);
	}else{
		return;
	}
}

/**
 * Join path if exists
 * @param {string} basePath 
 * @param {string} relativePath 
 */
function joinPathIfExists(basePath, relativePath){
	const newRelativePath = path.join(basePath , relativePath);
	if( fileutil.isExist(newRelativePath) ){
		return newRelativePath;
	}else{
		return;
	}
}