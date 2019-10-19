var util = require(".././lib/util/util");

describe("Util fileNameFromUrl ", function() {

    it("when no url", function() {
        const result = util.fileNameFromUrl("")
        expect(result.name).toEqual("");
        expect(result.ext).toEqual("");
    });

    it("when only slash", function() {
        const result = util.fileNameFromUrl("/")
        expect(result.name).toEqual("");
        expect(result.ext).toEqual("");
    });

    it("when extenstion", function() {
        const result = util.fileNameFromUrl("/this/is/index.php")
        expect(result.name).toEqual("index");
        expect(result.ext).toEqual(".php");
    });

    it("when no extenstion", function() {
        const result = util.fileNameFromUrl("/this/is/indexphp")
        expect(result.name).toEqual("indexphp");
        expect(result.ext).toEqual("");
    });

    it("when extenstion with long name", function() {
        const result = util.fileNameFromUrl("/this/is/veryVeryLongUnexpectedName.php")
        expect(result.name).toEqual("veryVeryLongUnexpect");
        expect(result.ext).toEqual(".php");
    });

    it("when extenstion with long name with givin limit", function() {
        const result = util.fileNameFromUrl("/this/is/veryVeryLongUnexpectedName.php", 50)
        expect(result.name).toEqual("veryVeryLongUnexpectedName");
        expect(result.ext).toEqual(".php");
    });
    
    it("temp", function() {
        const result = util.fileNameFromUrl("/images/searchbox/desktop_searchbox_sprites302_hr.png", 30)
        expect(result.name).toEqual("desktop_searchbox_sprites302_h");
        expect(result.ext).toEqual(".png");
    });
});