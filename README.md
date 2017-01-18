# Stubmatic
A stub server to mock behaviour of HTTP(s) / REST / SOAP services 

[![Travis ci Build Status](https://travis-ci.org/NaturalIntelligence/Stubmatic.svg?branch=master)](https://travis-ci.org/NaturalIntelligence/Stubmatic) [![Gitter](https://img.shields.io/gitter/room/Stubmatic/Stubmatic.svg)](https://gitter.im/Stubmatic/Lobby#) [![Known Vulnerabilities](https://snyk.io/test/github/naturalintelligence/stubmatic/badge.svg)](https://snyk.io/test/github/naturalintelligence/stubmatic) [![bitHound Overall Score](https://www.bithound.io/github/NaturalIntelligence/Stubmatic/badges/score.svg)](https://www.bithound.io/github/NaturalIntelligence/Stubmatic) [![Code Climate](https://codeclimate.com/github/NaturalIntelligence/Stubmatic/badges/gpa.svg)](https://codeclimate.com/github/NaturalIntelligence/Stubmatic)

> Stubmatic is the new name for my other project [Stubby DB](https://github.com/NaturalIntelligence/StubbyDB). All the changes to stubby db after version **4.2.0** will be happend here only. Previous github & npm repo will be kept for old references.

<img align="right" src="https://naturalintelligence.github.io/Stubmatic/img/stubmatic_logo.png?raw=true" width="180px" alt="Stubmatic logo"/> 

1. Installation : `$npm install stubmatic -g`
2. Set up repo  : `$stubmatic init [repo-name]`
3. Start server : `$stubmatic [-d <repo-name>]`
4. Help         : `$stubmatic --help`

Important links : [Video Tutorial](https://youtu.be/7mA4-MXxwgk), [Wiki](https://github.com/NaturalIntelligence/Stubmatic/wiki), [NPM](https://www.npmjs.com/package/stubmatic), [Demo](https://github.com/NaturalIntelligence/stubby-db-test) application, [issues](https://github.com/NaturalIntelligence/Stubmatic/issues), [changelogs](https://github.com/NaturalIntelligence/Stubmatic/wikiChangelog)
[<img width="180px" src="https://naturalintelligence.github.io/Stubmatic/img/showcase_btn.png" alt="Stubmatic donate button"/>](https://naturalintelligence.github.io/Stubmatic/#showcase)   [<img src="https://www.paypalobjects.com/webstatic/en_US/btn/btn_donate_92x26.png" alt="Stubmatic donate button"/>](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=KQJAX48SPUKNC) 

## Configuration
To install stubmatic, you need to install [nodejs](https://nodejs.org/en/download/) and npm first. It is recommanded to be on latest version of both. npm is bundeled with nodejs. Now follow above commands to install stubmatic and to set up a repo.

## How to start
Stubmatic works on request response mappings specified in a yaml file. Response contents can be read from *body* or *file* attribute of a maping. 

```yaml
-  request:
      url: /stubs/(admin|staff|customer|security)/([0-9]+)/2

   response:
      body: >
        multiple line response
        another line
```
When a request reaches to stubmatic server, it matches the request against all mappings. Whichever mapping matches first(top to bottom), will be used to serve the response. A complete response can be built with multiple files. It can also have some placeholder to show dynamic data, like date, or some random number or some part from request itself. Stubmatic first process and build complete response then respond back to any HTTP(s) request.

Using regular expression, single mapping can be used to match multiple requests and serve response from different files.

#### Sample SOAP request mapping
```yaml
-  request:
     method: POST
     url: /soap-simulator/services/ServiceName
     post: actionName[\s\S]*mobile.([0-9]+)
  response:
     headers:
           content-type: text/xml
     strategy: "first-found"
     files: ["stubs/<% post.1 %>/response.xml","stubs/ServiceName/actionName/default.xml"]
```
#### Sample REST request mapping
```yaml
-  request:
     method: GET
     url: /rest-simulator/services/ServiceName/actionName/([0-9]+)
  response:
     headers:
           content-type: text/xml
     strategy: "first-found"
     files: ["stubs/<% url.1 %>/response.xml","stubs/ServiceName/actionName/default.xml"]
```
To make the response dynamic, stubmatic comes with various features

* **Strategy**: it helps to pick specific or random file to serve the response.
* **Default mapping and short notations**: Helps to keep mapping file as small as possible whitout verbosing same information
* **Multiple mapping files**: Helps to keep the project organized.
* **Regular Expressions**: You can use RE to match a request, capture some part of the request, to decide response file at runtime, to change contents of response at runtime etc. You can capture request part from URL, request body, headers, and query parameters.
* **Expressions**: Stubmatic has support for inbuilt functions and markers to display date, random number etc.
* **Dumps**: You can devide the response from multiple files to keep it simplified. And join them at runtime using dumps.
* **DB sets**: Instead of creating multiple response files for each request, you can create *response skeleton*. Later you can fill data in this skeleton from dumps and data tables (DB sets).
* **Latency**: You can set fix or random delay to serve the response
* **HTTPS**: It supports HTTP and HTTPS both. You can set up 1 way and 2 way SSL hanshaking.
* **Attachments**: You can write mapping to response a file.
* **Compression**: If accept-encoding header is set to deflate or gzip then Stubmatic serves compressed response.
* **Configuration**: If configuration file is missing, Stubmatic can build the response on the basis of directory structure.
* **Other**: There are also many other small features, like set response code, response headers, logging, debugging etc.

#### Other highlitghs
* Stubmatic consumes very less memory and CPU
* It is performance ready and being used by many organizations
* No bug reported yet (from Apr 2016 to till date)


#### Breaking changes in 5.0.0
* `{{TODAY+1}}` is dpreicated. Use `{{TODAY+1d}}` instead
* `{{JODA_TODAY+1}}` is dpreicated. Use `{{JODA_TODAY+1d}}` instead
* 'err' property for dbset mapping is invalid. If a key doesn't match it'll look for default key ('*') otherwise it'll skip matching.
* Use of `##dbset_key##` is depricated. Use `{{#dbset_key}}` instead
* Use of `[[dumpspath:file1,file2]]` is depricated. Use `{{dump(dumpspath,[file1,file2])}}` instead.
* options `-m`, and `-s` or `--stub` have been removed from stubmatic command
* Check syntax for short notations
* 'post' property of request mapping is deprecated. Use 'bodyText' or 'body' attributes.
* In config.json, `mappings.requests` is changed to `mappings.files`