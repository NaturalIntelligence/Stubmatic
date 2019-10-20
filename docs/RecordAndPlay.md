# Record And Play

This feature can be used to record the response coming from different server.

## Configuration

* If the stubmatic runs as proxy, `record` property is used to specified the path for recordings and stubs.
```bash
$ stubmatic --from http://www.google.com --record some/path
```

* If the stubmatic runs as simulator and construct properties based on directory structure then `recordings` folder is used to save the recordings. If it is not present then `stubs` follder will be used.
* If the stubmatic runs as simulator and construct properties from a configuration file then following block should be present;

```
mappings:{
      "loadFromRecording": true,
},
"record" : {
    "path" : "recordings",
    "mapping": {
      "headers" : true,
      "queryParam" : true,
      "hashStrig" : true,
      "skipHeaders" : []
    }
  }
```
if above configuration is missing or at least the path for recordings is missing then stubs folder path will be used.

By default all the recordings and relevant mappings are saved in recordings folder. Mappings are also saved in memory. So once the simulator is restarted, recorded mappings will not picked. Set `mappings.loadFromRecording": true` in config to pick recorded mappings on next server started. Please note that the path of recordings folder should not be changed on restart as stubmatic loads the mappings for given recordings path.

Recording can be played only for the mappings who has `from` property and need to be set explicitly.

```yaml
#not recommanded as record will work but play will not work.
-  request:
      url: /search?q=*

   response:
      from: http://www.google.com
      record: true

#or
- WhenMappingNotFound:
    response:
        from: http://www.google.com
        record: true
```


RecordPath can be given from command line, configuration, or from particular mapping. If the recording path is not given in the mapping then `record=true` is required to be set. Otherwise, recording will not play. When the recording path is not given in mapping as well as in configuration then stubs path will be used. However, it is not recomanded becase if `mappings.loadFromRecording: true` in config then Stubmatic will try to load all the yaml files from the recording path which is `stubs` in this case.

TODO
1. load record and play configuration
2. load mapping configuration
3. mapping builder to load recorded mappings
4. config builder:
      a) 

## CLI

Following command can be used to use stubmatic as proxy server for debugging and record&play.

```bash
$ stubmatic --from http://www.google.com --record some/path
```

You can also use `-v` and `--debug` arguments in above command to watch on request/response in commandline.
