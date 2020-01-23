function importTest(name, path) {
    describe(name, function () {
        require(path);
    });
}


describe("top", function () {
    beforeEach(function () {
        console.log("running something before each test");
    });
    importTest("working on datazbase", './DB.test');
    after(function () {
        console.log("after all tests");
    });
});
