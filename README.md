# Stubmatic
A stub server to mock behaviour of HTTP(s) / REST / SOAP services [<img align="right" src="https://www.paypalobjects.com/webstatic/en_US/btn/btn_donate_92x26.png" alt="Stubmatic donate button"/>](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=KQJAX48SPUKNC)

> Stubmatic is the new name for my other project [Stubby DB](https://github.com/NaturalIntelligence/StubbyDB). All the changes to stubby db after version **4.2.0** will be happend here only. Previous github & npm repo will be kept for old references.

<img align="right" src="http://naturalintelligence.github.io/StubbyDB/assets/img/stubbydb_logo_300.png?raw=true" width="180px" alt="Stubmatic logo"/>

1. Installation : `$npm install stubmatic -g`
2. Set up repo  : `$npm install init [repo-name]`
3. Start server : `$stubmatic [-d <repo-name>]`
4. Help         : `$stubmatic --help`

Important links : [Video Tutorial](https://youtu.be/7mA4-MXxwgk), [Wiki](https://github.com/NaturalIntelligence/StubbyDB/wiki), [NPM](https://www.npmjs.com/package/stubby-db), [Demo](https://github.com/NaturalIntelligence/stubby-db-test) application, [issues](https://github.com/NaturalIntelligence/StubbyDB/issues), [changelogs](https://github.com/NaturalIntelligence/StubbyDB/wiki/Changelog)

## Configuration
To install stubmatic, you need to install [nodejs](https://nodejs.org/en/download/) and npm first. It is recommanded to be on latest version of both. npm is bundeled with nodejs. Now follow above commands to install stubmatic and to set up a repo.

## How to start
Stubmatic works on request response mappings specified in a yaml file. A mapping can serve the response contents from body or from a file. 

When a request reache to stubmatic server, it matches the request against all mappings. Whichever mapping matches first, will be used to serve the response. A complete response can be built with multiple files. It can also have some placeholder to show dynamic data, like date, or some random number or some part from request itself. Stubmatic first process and build complete response then respond back to any HTTP(s) request.

Using regular expression, single mapping can be used to match multiple requests and serve response from different files.
