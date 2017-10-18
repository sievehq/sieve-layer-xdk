# Web XDK Change Log

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
