var config = require(".././os/nushi/stubmatic/configbuilder");


describe("Config Builder ", function() {

  it("should build configurations based on directory structure", function() {
  	var expected = {
  		mappings: {},
  		server: {
  			port: 7777,
  			host: '0.0.0.0'
  		}
  	}
  	config.build([]);
  	var actual = config.getConfig();
  	expect(actual).toEqual(expected);
  });

  it("should build configurations based on directory structure from specified path", function() {
  	var expected = {
  		mappings: {
  			files: ["spec/test_assets/mappings/mapping1.yaml","spec/test_assets/mappings/mapping2.yaml"]
  		},
  		server: {
  			port: 7777,
  			host: '0.0.0.0'
  		},
  		dbsets: "spec/test_assets/dbsets"
  	}
  	var options = [];
  	options['-d'] = "spec/test_assets";
  	options['-c'] = "wrong.json";
  	config.build(options);
  	var actual = config.getConfig();
  	expect(actual).toEqual(expected);
  });

  it("should build configurations based on directory structure from specified path and config.json", function() {
  	var expected = {
  		dbsets: "spec/test_assets/dbsets/",
  		mappings: {
  			default: {
		      request: {
		        method: "GET"
		      },
		      response: {
		        strategy: "first-found",
		        latency: 0,
		        status: 200
		      }
		    },
  			files: ["spec/test_assets/mappings/mapping2.yaml","spec/test_assets/mappings/mapping1.yaml"]
  		},
  		server: {
  			port: 9999,
  			host: "0.0.0.0"
  		}
  	};
  	
  	var options = [];
  	options['-d'] = "spec/test_assets";

  	config.build(options);
  	var actual = config.getConfig();
  	expect(JSON.stringify(actual)).toBe(JSON.stringify(expected));
  	//expect(actual).toEqual(expected);//Not working
  });


  it("should build configurations based on directory structure from specified path and other arguments", function() {
  	var expected = {
  		mappings: {
  			files: ["spec/test_assets/mappings/mapping1.yaml","spec/test_assets/mappings/mapping2.yaml"]
  		},
  		server: {
  			port: 8888,
  			host: '127.0.0.1',
  			securePort: 9000,
  			mutualSSL: true
  		},
  		dbsets: "spec/test_assets/dbsets"
  	}

  	var options = [];
  	options['-d'] = "spec/test_assets";
  	options['-c'] = "wrong.json";
  	options['-p'] = 8888;
  	options['--host'] = '127.0.0.1';
  	options['-P'] = 9000;
  	options['--mutualSSL'] = true;

  	config.build(options);
  	var actual = config.getConfig();
  	expect(actual).toEqual(expected);
  });

  it("should build configurations based on directory structure from specified path and configuration", function() {
  	var expected = {
  		mappings: {
  			default: {
		      request: {
		        method: "GET"
		      },
		      response: {
		        strategy: "first-found",
		        latency: 0,
		        status: 200
		      }
		    },
  			files: ["spec/test_assets/mappings/mapping2.yaml"]
  		},
  		server: {
  			port: 9999,
  			host: '0.0.0.0',
  			securePort: 8000,
  			mutualSSL: true,
  			ca: ["spec/test_assets/truststore/ca/ca.crt"],
	        key: "spec/test_assets/truststore/server.key",
	        cert: "spec/test_assets/truststore/server.crt"
  		},
  		dbsets: "spec/test_assets/dbsets/",
	    stubs: "spec/test_assets/stubs/",
	    logs: { path: "logs/" },
	    dumps: "spec/test_assets/"

  	}
  	
  	var options = [];
  	options['-d'] = "spec/test_assets";
  	options['-c'] = "stubmatic_config.json";

  	config.build(options);
  	var actual = config.getConfig();
  	expect(actual).toEqual(expected);
  });


  it("should build configurations based on directory structure from specified path and configuration overwritten by args", function() {
  	var expected = {
  		mappings: {
  			default: {
		      request: {
		        method: "GET"
		      },
		      response: {
		        strategy: "first-found",
		        latency: 0,
		        status: 200
		      }
		    },
  			files: ["spec/test_assets/mappings/mapping2.yaml"]
  		},
  		server: {
  			port: 8888,
  			host: '127.0.0.1',
  			securePort: 9000,
  			mutualSSL: true,
  			ca: ["spec/test_assets/truststore/ca/ca.crt"],
	        key: "spec/test_assets/truststore/server.key",
	        cert: "spec/test_assets/truststore/server.crt"
  		},
  		dbsets: "spec/test_assets/dbsets/",
	    stubs: "spec/test_assets/stubs/",
	    logs: { path: "logs/" },
	    dumps: "spec/test_assets/"

  	}
  	
  	var options = [];
  	options['-d'] = "spec/test_assets";
  	options['-c'] = "stubmatic_config.json";
  	options['-p'] = 8888;
  	options['--host'] = '127.0.0.1';
  	options['-P'] = 9000;
  	options['--mutualSSL'] = true;

  	config.build(options);
  	var actual = config.getConfig();
  	expect(actual).toEqual(expected);
  });

});