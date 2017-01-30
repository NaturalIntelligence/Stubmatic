

var Response = function(writer) {
    this.writer = writer;
};

Response.prototype.bulk = function(value) {
    if (value === null) {
        return this.writer.write('$-1\r\n');
    }

    var b = new Buffer(value.toString());
    this.writer.write('$' + b.length + '\r\n');
    this.writer.write(b);
    this.writer.write('\r\n');
};

// Automatic encoding. Binary safe.
Response.prototype.encode = function(value) {
    var that = this;
    if(Array.isArray(value)) {
        this.writer.write('*' + value.length + '\r\n');
        value.forEach(function(v) { that.bulk(v); });
    } else {
        switch(typeof value) {
            case 'number':
                this.writer.write(':' + value + '\r\n');
                break;
            case 'boolean':
                this.writer.write(':' + (value ? '1':'0') + '\r\n');
                break;
            default:
                this.bulk(value);
                break;
        }
    }
};

// An error.
Response.prototype.error = function(msg) {
    this.writer.write('-' + msg + '\r\n');
};

// A simple response.
Response.prototype.singleline = function(line) {
    this.writer.write('+' + line + '\r\n');
};

exports.Response = Response;