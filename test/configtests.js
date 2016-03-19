var assert = require('./lib.js').assert;

function getConfig(options){
	var mod = '../os/nushi/stubbydb/configbuilder';
	delete require.cache[require.resolve(mod)];
	var configBuilder = require(mod);
	//configBuilder.reset();
	configBuilder.buildConfig(options,options.length+2);
	return configBuilder.getConfig();
}

//---------------- Default

var expectedConfig = {
	mappings: {
		default: {
			request:{
				method: 'GET'
			},
			response: {
				strategy: 'first-found',
				latency: 0,
				status: 200
			}
		},
		requests: ["response.yaml"]
	},
	server: {
		port: 9999,
		host: 'localhost'
	},
	logs:{
		path: 'logs'
	},
	stubs: 'stubs/',
	dbsets: 'dbsets'
};
actualConfig = getConfig([]);

assert(actualConfig,expectedConfig);

//---------------- -p,-m,-s

var options = {
	'-C' : '{"mappings":{"default":{"request":{"method":"XYZ"},"response":{"strategy":"first-found","status":202}},"requests":["mapping.yaml"]}}'
	,'-p' : 7789
	,'-m' : 'some.yaml'
	,'-s' : 'stub/'
}

var expectedConfig = {
	mappings: {
		default: {
			request:{
				method: 'XYZ'
			},
			response: {
				strategy: 'first-found',
				latency: 0,
				status: 202
			}
		},
		requests: ["some.yaml"]
	},
	server: {
		port: 7789		,
		host: 'localhost'
	},
	stubs: 'stub/',
	logs:{
		path: 'logs'
	}
};

actualConfig = getConfig(options);

assert(actualConfig,expectedConfig);

//---------------- -c

var options = {
	'-c' : __dirname + '/config.json'
	,'-p' : 7789
	,'-m' : 'some.yaml'
	,'-s' : 'stub/'
}

var expectedConfig = {
	mappings: {
		default: {
			request:{
				method: 'GET'
			},
			response: {
				strategy: 'first-found',
				latency: 0,
				status: 200
			}
		},
		requests: ["some.yaml"]
	},
	server: {
		port: 7789,
		host: 'localhost'
	},
	stubs: 'stub/',
	logs:{
		path: 'logs'
	},
	dbsets: "dbsets"
};

actualConfig = getConfig(options);

assert(actualConfig,expectedConfig);

//---------------- -d : project location and different host

var options = {
	'-d' : __dirname + '/testdir'
	,'-p' : 7790
	,'--host' : 'abcd.com'
}

var expectedConfig = {
	dbsets: __dirname + "/testdir/dbsets/",
	stubs: __dirname + "/testdir/stubs/",
	mappings: {
		default: {
			request:{
				method: 'GET'
			},
			response: {
				strategy: 'first-found',
				latency: 0,
				status: 200
			}
		},
		requests: [__dirname + "/testdir/mappings/some.yaml"]
	},
	server: {
		port: 7790,
		host: 'abcd.com'
	},
	logs:{
		path: __dirname + "/testdir/"
	}
	//,dumps: __dirname + "/testdir/dumps/"
};

actualConfig = getConfig(options);

assert(actualConfig,expectedConfig);