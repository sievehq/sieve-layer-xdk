/* eslint-disable */
describe("The LayerError Class", function() {
    describe("The constructor() method", function() {
        it("Should copy in object parameters", function() {
            expect(new Layer.Core.LayerError({url: "hey"}).url).toEqual("hey");
            expect(new Layer.Core.LayerError({httpStatus: "hey"}).httpStatus).toEqual("hey");
            expect(new Layer.Core.LayerError({message: "hey"}).message).toEqual("hey");
            expect(new Layer.Core.LayerError({code: "hey"}).code).toEqual("hey");
            expect(new Layer.Core.LayerError({id: "hey"}).errType).toEqual("hey");
            expect(new Layer.Core.LayerError({data: {"hey": "ho"}}).data).toEqual({"hey": "ho"});
        });

        it("Should clone an error", function() {
            var err = new Layer.Core.LayerError({
                url: "url",
                httpStatus: "status",
                message: "message",
                code: "code",
                id: "errType",
                data: {hey: "ho"}
            });

            expect(new Layer.Core.LayerError(err).url).toEqual("url");
            expect(new Layer.Core.LayerError(err).httpStatus).toEqual("status");
            expect(new Layer.Core.LayerError(err).message).toEqual("message");
            expect(new Layer.Core.LayerError(err).code).toEqual("code");
            expect(new Layer.Core.LayerError(err).errType).toEqual("errType");
            expect(new Layer.Core.LayerError(err).data).toEqual({hey: "ho"});
        });

        it("Should handle case where server didn't give us an object", function() {
            expect(new Layer.Core.LayerError("Server crapped out").message).toEqual("Server crapped out");
        });
    });

    describe("The getNonce() method", function() {
        it("Should return the nonce if present", function() {
            var err = new Layer.Core.LayerError({
                data: {
                    nonce: "fred"
                }
            });
            expect(err.getNonce()).toEqual("fred");
        });

        it("Should return the empty string if not present", function() {
            var err = new Layer.Core.LayerError({});
            expect(err.getNonce()).toEqual("");
        });
    });

    describe("The toString() method", function() {
        it("Should not fail", function() {
            var err = new Layer.Core.LayerError({
                url: "url",
                httpStatus: "status",
                message: "message",
                code: "code",
                id: "errType",
                data: {hey: "ho"}
            });

            expect(function() {
                err.toString();
            }).not.toThrow();
        });
    });

    describe("The log() method", function() {
        it("Should not fail", function() {
            var err = new Layer.Core.LayerError({
                url: "url",
                httpStatus: "status",
                message: "message",
                code: "code",
                id: "errType",
                data: {hey: "ho"}
            });

            expect(function() {
                err.log();
            }).not.toThrow();
        });

        it("Should not fail when logging is disabled", function() {
            Layer.Core.LayerEvent.disableLogging = true;
            var err = new Layer.Core.LayerError({
                url: "url",
                httpStatus: "status",
                message: "message",
                code: "code",
                id: "errType",
                data: {hey: "ho"}
            });

            expect(function() {
                err.log();
            }).not.toThrow();
            Layer.Core.LayerEvent.disableLogging = false;
        });
    });

});