/* eslint-disable */
describe("The LayerError Class", function() {
    describe("The constructor() method", function() {
        it("Should copy in object parameters", function() {
            expect(new layer.Core.LayerError({url: "hey"}).url).toEqual("hey");
            expect(new layer.Core.LayerError({httpStatus: "hey"}).httpStatus).toEqual("hey");
            expect(new layer.Core.LayerError({message: "hey"}).message).toEqual("hey");
            expect(new layer.Core.LayerError({code: "hey"}).code).toEqual("hey");
            expect(new layer.Core.LayerError({id: "hey"}).errType).toEqual("hey");
            expect(new layer.Core.LayerError({data: {"hey": "ho"}}).data).toEqual({"hey": "ho"});
        });

        it("Should clone an error", function() {
            var err = new layer.Core.LayerError({
                url: "url",
                httpStatus: "status",
                message: "message",
                code: "code",
                id: "errType",
                data: {hey: "ho"}
            });

            expect(new layer.Core.LayerError(err).url).toEqual("url");
            expect(new layer.Core.LayerError(err).httpStatus).toEqual("status");
            expect(new layer.Core.LayerError(err).message).toEqual("message");
            expect(new layer.Core.LayerError(err).code).toEqual("code");
            expect(new layer.Core.LayerError(err).errType).toEqual("errType");
            expect(new layer.Core.LayerError(err).data).toEqual({hey: "ho"});
        });

        it("Should handle case where server didn't give us an object", function() {
            expect(new layer.Core.LayerError("Server crapped out").message).toEqual("Server crapped out");
        });
    });

    describe("The getNonce() method", function() {
        it("Should return the nonce if present", function() {
            var err = new layer.Core.LayerError({
                data: {
                    nonce: "fred"
                }
            });
            expect(err.getNonce()).toEqual("fred");
        });

        it("Should return the empty string if not present", function() {
            var err = new layer.Core.LayerError({});
            expect(err.getNonce()).toEqual("");
        });
    });

    describe("The toString() method", function() {
        it("Should not fail", function() {
            var err = new layer.Core.LayerError({
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
            var err = new layer.Core.LayerError({
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
            layer.Core.LayerEvent.disableLogging = true;
            var err = new layer.Core.LayerError({
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
            layer.Core.LayerEvent.disableLogging = false;
        });
    });

});