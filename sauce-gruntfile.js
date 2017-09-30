/*eslint-disable */
module.exports = function(grunt, version) {
  var result = {
    tasks: {}
  };

  // Specifying a specific browser:
// grunt test --browsers=chrome-1,edge-0

// Naming pattern:
// * -0: Latest
// * -1: Latest - 1 version
// ** Number: A hardcoded version number
var supportedBrowsers = {
  'ie11': {
    browserName: 'internet explorer',
    platform: 'Windows 8.1',
    version: '11.0'
  },
  'edge-1': {
    browserName: 'MicrosoftEdge',
     'platform': 'Windows 10',
     version: '13.10586'
  },
  'edge-0': {
     browserName: 'MicrosoftEdge',
     'platform': 'Windows 10',
     version: 'latest'
  },
  'safari-1': {
    browserName: 'safari',
    version: '9.0',
    platform: 'OS X 10.11'
  },
  'safari-0': {
    browserName: 'safari',
    version: '10.0',
    platform: 'macOS 10.12'
  },
  'ios-1': {
    browserName: 'iphone',
    version: 'latest-1',
    platform: 'OS X 10.9'
  },
  'ios-0': {
    browserName: 'iphone',
    version: 'latest',
    platform: 'OS X 10.9'
  },
  'chrome-1': {
    browserName: 'chrome',
    platform: 'OSX 10.9',
    version: 'latest-1'
  },
  'chrome-0': {
    browserName: 'chrome',
    platform: 'WIN8',
    version: 'latest'
  },
  'firefox-1': {
    browserName: 'firefox',
    version: 'latest-1',
    platform: 'WIN8'
  },
  'firefox-0': {
    browserName: 'firefox',
    version: 'latest',
    platform: 'OS X 10.9'
  }
};

// These do not support websockets, so are not supported by layer-websdk
var unsupportedBrowsers = {
  'safari8': {
    browserName: 'safari',
    version: '8.0',
    platform: 'OS X 10.10'
  },
  'ios-2': {
    browserName: 'iphone',
    version: 'latest-2',
    platform: 'OS X 10.9'
  },
};

  var browsers;
  if (grunt.option('browsers')) {
    browsers = grunt.option('browsers').split(/\s*,\s*/).map(function(name) {
      if (supportedBrowsers[name]) return supportedBrowsers[name];
      if (unsupportedBrowsers[name]) return unsupportedBrowsers[name];
      throw new Error(name + ' not found');
    });
  } else {
    browsers = Object.keys(supportedBrowsers).map(function(key) {return supportedBrowsers[key]});
  }

  // Why this? Travis tunnel to saucelabs only sometimes survives long
  // enough for all 11 tests to run.  So randomly test 3 browsers each run.
  function getRandomThree() {
    var browsersHash = {};
    while(Object.keys(browsersHash).length < 3) {
      var randomIndex = Math.floor(Math.random() * Object.keys(supportedBrowsers).length);
      var key = Object.keys(supportedBrowsers)[randomIndex];
      browsersHash[key] = supportedBrowsers[key];
    }
    var browserArray = Object.keys(browsersHash).map(function(key) {return browsersHash[key]});;
    console.dir(browserArray);
    return browserArray;
  }

  if (process.env.TRAVIS_JOB_NUMBER) {
    browsers = getRandomThree();
    browsers.forEach(function(item) {
      item['tunnel-identifier'] = process.env.TRAVIS_JOB_NUMBER;
    });
  }

  result.tasks.saucelabs = {
    all: {
      options: {
        browsers: browsers,
        build: "Layer UI Web <%= pkg.version %>" + (process.env.TRAVIS_JOB_NUMBER ? ' ' + process.env.TRAVIS_JOB_NUMBER : ''),
        urls: ["http://127.0.0.1:9999/test/SpecRunner.html"],
        tunneled: true,
        concurrency: 1,
        throttled: 1,
        testname: "Running LUI Web <%= pkg.version %> Unit Test",
        tags: ["master", 'Unit Test', 'Web'],

        // WARNING: If tests are timing out, adjust these values; they are documented in grunt-saucelabs README.md
        pollInterval: 10000, // Check for test results every 10 seconds (miliseconds)
        statusCheckAttempts: 180, // Allow up to 30 minutes (presumed to be 30 from start of first browser to end of last)
        // max-duration should insure that the tunnel stays alive for the specified period.  Large values however cause
        // saucelabs to just hang and not start any jobs on their servers.  This time appears to be per-job, not total
        // runtime
        "max-duration": 400,
        maxRetries: 2,
        onTestComplete: function(result, callback) {
          console.log("----------------------------------------\nSaucelabs Results:" + result.passed);
          require("request").put({
              url: ['https://saucelabs.com/rest/v1', process.env.SAUCE_USERNAME, 'jobs', result.job_id].join('/'),
              auth: { user: process.env.SAUCE_USERNAME, pass: process.env.SAUCE_ACCESS_KEY },
              json: {
                passed: Boolean(result.passed),
                name: "Completed LUI Web " + version + " Unit Test"
              }
            }, function (error, response, body) {
              if (response.statusCode != 200) {
                console.error("Error updating sauce results: " + body.error  + '/' + response.statusCode);
              }
            });

            if (result.passed) {
              callback();
            } else if (!result.result || !result.result.errors) {
              console.error("Unexpected result passed from server");
              console.error(JSON.stringify(result, null, 4));
              callback(false);
            } else {
              console.error("Unit Test Errors for " + result.platform.join(', ') + "\n •", result.result.errors.join("\n • "));
              callback(false);
            }
        }
      }
    }
  };
  return result;
};
