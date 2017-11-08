# Web XDK Change Log

# 1.0.0-pre1.14

* Fixes bug in Message Grouping where Status Messages are treated as part of the grouping
* Adds a `filter` callback to `Layer.Core.Query` and a `filterMessages` property to the `ConversationView`: ```
render() {
  return <ConversationView
    filterMessages={(message) => return isAcceptableMessage(message)} />
}
```

## 1.0.0-pre1.13

* Adds Message Tests for all message types
* Adds `customResponseData` per choice item for the Choice Model (experimental/risky feature)

## 1.0.0-pre1.11

* Adds `Layer.UI.statusMimeTypes.push(MyCustomModel.MIMEType)` as the way to register a Message Type to be rendered as a Status Message instead of a Sent or Received Message.

## 1.0.0-pre1.10

* Adds `<layer-conversation-item-date />` added to simplify Conversation Item Date customizations

## 1.0.0-pre1.9

* Adds `enabledFor` to Choice Model
* Some refactoring of enabled detection for Choice Models
* Adds CSS class name`layer-message-item-${Message View Class Name}` to the `<layer-message-item-sent />`, `<layer-message-item-received />` and `<layer-message-item-status />` elements; `layer-message-item-layer-text-view`

## 1.0.0-pre1.8

* Adds a Status Message Type
* Adds a `Layer.UI.statusMimeTypes` array of mime types that are treated as Status Messages

## 1.0.0-pre1.7

* Test Framework
* Bug fixes
* React Sample App

## 1.0.0-pre1.6

* Fixes `nodeId` property which was missing from the prototype, and breaking attempts to set `parentNodeId`

## 1.0.0-pre1.5

* Updates React adapter's getInitialProps method to work with new class definitions
* Updates reauthentication to not reauthenticate based on no-longer-used session tokens

## 1.0.0-pre1.4

* Fixes error in static client property `QUERIED_CACHE_PURGE_INTERVAL` which should have been `CACHE_PURGE_INTERVAL`, causing new messages to be instantly destroyed

## 1.0.0-pre1.3

* Updates React adapter for React 16
* Removes old nodejs support code; runs in browser only for now

## 1.0.0-pre1.2

* Fixes package.json `main`
* Fixes folder references

## 1.0.0-pre1.1

* Prerelease of the Web XDK merges the WebSDK and Layer UI for Web into a single project and evolves the concept of Messaging Experiences beyond slapping a message onto a page.
