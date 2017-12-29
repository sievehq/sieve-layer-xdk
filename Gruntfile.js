var fs = require('fs');
var path = require('path');
var version = require('./package.json').version;
var HTML_HEAD = fs.readFileSync('./jsduck-config/head.html').toString();
var CSS = fs.readFileSync('./jsduck-config/style.css').toString();
var babel = require('babel-core');

module.exports = function (grunt) {
  var saucelabsTests = require('./sauce-gruntfile')(grunt, version);


  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    webcomponents: {
      build: {
        files: [
          {
            src: ['src/ui/**/*.js', '!src/ui/**/test.js', '!src/ui/**/tests/*.js']
          }
        ],
        options: {
        }
      }
    },
    custom_babel: {
      dist: {
        files: [
          {
            src: ['lib-es6/**/*.js'],
            dest: 'lib-es5'
          }
        ],
        options: {
        }
      }
    },
    remove: {
      build: {
        fileList: ['build']
      },
      theme: {
        fileList: ['themes/build']
      },
      lib: {
        dirList: ['lib', 'lib-es6']
      },
      libes5: {
        dirList: ['lib-es5']
      },
    },
    browserify: {
      options: {
        verbose: true,
        separator: ';',
        transform: [ ],
        browserifyOptions: {

        }
      },
      samples: {
        files: [
          {
            dest: 'samples/build.js',
            src: 'samples/index.js'
          }
        ],
        options: {
          transform: [['babelify', {
            presets: ['es2015']}]],
        }
      },
      build: {
        files: [
          {
            dest: 'build/layer-xdk.js',
            src: 'lib/index.js'
          }
        ]
      },
      core: {
        files: [
          {
            dest: 'build/layer-xdk-core.js',
            src: 'lib/index-core.js'
          }
        ]
      },
      coverage: {
        files: {
          'test/coverage-build.js': ['lib/index.js']
        },
        options: {
          transform: [[fixBrowserifyForIstanbul], ["istanbulify"]],
          browserifyOptions: {
            standalone: false,
            debug: false
          }
        }
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %> */ ',
        mangle: {
          except: [
            "layer",
            "Client"]
        },
        sourceMap: false,
        screwIE8: true
      },
      build: {
        files: {
          'build/layer-xdk.min.js': ['build/layer-xdk.js']
        }
      }
    },


    less: {
      themes: {
        files: [
          {src: ['themes/src/layer-basic-blue/theme.less'], dest: 'themes/build/layer-basic-blue.css'},
          {src: ['themes/src/layer-groups/theme.less'], dest: 'themes/build/layer-groups.css'}
        ]
      }
    },
    custom_copy: {
      src: {
        src: ['src/core/*', 'src/*.js', 'src/util'],
        dest: 'lib-es6/'
      },
    },
    copy: {
      themes: {
        src: ["themes/src/*/**.html", "themes/src/*/**.js"],
        dest: "themes/build/",
        flatten: true,
        expand: true
      },

      // Adds support for the ignoreFiles parameter, which is needed for removing generated files from the result
      fixIstanbul: {
        src: "grunt-template-jasmine-istanbul_src-main-js-template.js",
        dest: "node_modules/grunt-template-jasmine-istanbul/src/main/js/template.js"
      }
    },
    move: {
      lib: {
        src: 'lib-es5',
        dest: 'lib'
      }
    },

    cssmin: {
      build: {
        files: [
          {src: ['themes/build/layer-basic-blue.css'], dest: 'themes/build/layer-basic-blue.min.css'},
          {src: ['themes/build/layer-groups.css'], dest: 'themes/build/layer-groups.min.css'}
        ]
      }
    },


    // Testing and Coverage tasks
    jasmine: {
      options: {
        helpers: ['test/lib/mock-ajax.js', 'test/core/specs/responses.js'],
        specs: ['test/core/specs/unit/*Spec.js', 'test/core/specs/unit/**/*Spec.js'],
        summary: true
      },
      debug: {
        src: ["build/layer-xdk-core.js"]
      }
    },

    // Documentation
    jsduck: {
      build: {
        src: ["lib/**/*.js"],
        dest: 'docs',
        options: {
          'builtin-classes': false,
          'warnings': ['-no_doc', '-dup_member', '-link_ambiguous', '-cat_class_missing'],
          'external': ['HTMLTemplateElement', 'Websocket', 'Blob', 'KeyboardEvent', 'DocumentFragment', 'IDBVersionChangeEvent', 'IDBKeyRange', 'IDBDatabase'],
          'title': 'Layer UI for Web - API Documentation',
          'categories': ['jsduck-config/categories.json'],
          'head-html': HTML_HEAD,
          'css': [CSS],
          'footer': 'Layer Web XDK v' + version
        }
      }
    },
    jsducktemplates: {
      build: {
        files: [
          {
            src: ['src/ui/components/**/*.html']
          }
        ],
        options: {
        }
      }
    },
    jsduckfixes: {
      build: {
        files: [
          {
            src: ['docs/output/*.js']
          }
        ],
        options: {
        }
      }
    },
    version: {
      build: {
        files: [
          {
            dest: 'src/version.js',
            src: 'src/version.js'
          }
        ]
      },
      options: {
        version: "<%= pkg.version %>"
      }
    },
    'generate-tests': {
      debug: {
        files: [
          {
            src: ['src/ui/**/test.js', 'src/ui/**/tests/**.js']
          }
        ],
      }
    },
    connect: {
      saucelabs: {
        options: {
          base: "",
          port: 9999
        }
      },
      develop: {
        options: {
          base: "",
          port: 8004
        }
      }
    },
    watch: {
      js: {
        files: ['package.json', 'Gruntfile.js', 'samples/index.js', 'src/**', '!**/test.js', '!src/ui/**/tests/**.js', '!src/version.js'],
        tasks: ['debug', 'notify:watch'],
        options: {
          interrupt: true
        }
      },
      themes: {
        files: ['themes/src/**'],
        tasks: ['theme'],
        options: {
          interrupt: true
        }
      },
      ignore: {
        files: ['npmignore-source', '.gitignore'],
        tasks: ['generate-npmignore']
      }
    },
    notify: {
      watch: {
        options: {
          title: 'Watch Build',  // optional
          message: 'Build Complete', //required
        }
      }
    },
    'saucelabs-jasmine': saucelabsTests.tasks.saucelabs,
  });

  /* Insure that browserify and babelify generated code does not get counted against our test coverage */
  var through = require('through');
  function fixBrowserifyForIstanbul(file) {
    var generatedLines = [
      "function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }",
    ];
      var data = '';
      return through(write, end);

      function write (buf) {
          data += buf;
      }
      function end () {
        var lines = data.split(/\n/);

        for (var i = 0; i < lines.length; i++) {
          if (generatedLines.indexOf(lines[i]) !== -1) {
            lines[i] = "/* istanbul ignore next */ " + lines[i];
          }
        }

        this.queue(lines.join('\n'));
        this.queue(null);
      }
    }

    grunt.registerMultiTask('jsduckfixes', 'Fixing Docs', function() {
      var options = this.options();

      this.files.forEach(function(fileGroup) {
        fileGroup.src.forEach(function(file, index) {
            var contents = grunt.file.read(file);
            var startIndex = contents.indexOf('{');
            var endIndex = contents.lastIndexOf('}') + 1;
            var parsedContents = JSON.parse(contents.substring(startIndex, endIndex));

            if (parsedContents.members) parsedContents.members.forEach(function(element) {
              element.id = element.id.replace(/:/g, '_');
            });
            parsedContents.html = parsedContents.html.replace(/id='([^']*):([^']*)'/g, "id='" + "$1" + "_" + "$2'");
            parsedContents.html = parsedContents.html.replace(/href='([^']*):([^']*)'/g, "href='" + "$1" + "_" + "$2'");
            contents = contents.substring(0, startIndex) + JSON.stringify(parsedContents) + contents.substring(endIndex);
            grunt.file.write(file, contents);
        });
      });
    });

    /* Adds template info to the jsduck class definition comments */
    grunt.registerMultiTask('jsducktemplates', 'Adding templates to Docs', function() {
      var options = this.options();

      this.files.forEach(function(fileGroup) {
        fileGroup.src.forEach(function(file, index) {
          var template = grunt.file.read(file);
          var srcFilePath = file.replace(/src/, 'lib').replace(/\.html/, '.js');
          var srcFile = grunt.file.read(srcFilePath);
          var startIndex = srcFile.indexOf("@class");

          if (startIndex !== -1) {
            var layerIds = (template.match(/layer-id=["'](.*?)["']/gm) || []).map(function(match) {
              return match.replace(/^.*["'](.*)["']/, "$1");
            });

            srcFile = srcFile.substring(0, startIndex) +
            `### Templates\n\n * You can see the template for the latest template version at [${file.replace(/^.*\//, '')}](https://github.com/layerhq/web-xdk/blob/master/src/${srcFilePath.replace(/^.*lib/,'').replace(/\.js$/, '.html')})  \n * \n * The following layer-id attributes are expected in templates for this component: \n * \n * * ${layerIds.join('\n * * ')} \n` + srcFile.substring(startIndex);
            grunt.file.write(srcFilePath, srcFile);
          }
        });
      });
  });

  grunt.registerMultiTask('version', 'Assign Versions', function() {
    var options = this.options();


    function replace(fileGroup, version) {
      fileGroup.src.forEach(function(file, index) {
        var contents = grunt.file.read(file);
        grunt.file.write(fileGroup.dest, 'module.exports = "' + version + '";');
      });
    }

    // Iterate over each file set and fire away on that set
    this.files.forEach(function(fileGroup) {
      replace(fileGroup, options.version);
    });
  });


  grunt.registerMultiTask('custom_copy', 'Copying files', function() {
    var options = this.options();

    function process(file, outputPath) {
      try {
        grunt.file.copy(file, outputPath);
      } catch(e) {
        grunt.log.writeln('Failed to process ' + file + '; ', e);
      }
    }

    // Iterate over each file set and generate the build file specified for that set
    this.files.forEach(function(fileGroup) {
      fileGroup.src.forEach(function(file, index) {
        // TODO: Generalize this to not only work with src
        process(file, file.replace(/^src/, fileGroup.dest));
      });
    });
  });

  // Don't recall all the reasons we don't just use a Grunt Babel task, but this does give us more direct
  // control over parameters, as well as progress reporting and error reporting
  grunt.registerMultiTask('custom_babel', 'Babelifying all files in src/core', function() {
    var options = this.options();

    function convert(file, outputPath) {
      try {
        var output = grunt.file.read(file);
        var outputFolder = path.dirname(outputPath);
        if (!grunt.file.exists(outputFolder)) {
          grunt.file.mkdir(outputFolder);
        }
        var babelResult = babel.transform(output, {
          presets: ["babel-preset-es2015"],
          auxiliaryCommentBefore: 'istanbul ignore next'
        });
        var result = babelResult.code;

        var indexOfClass = result.indexOf('@class');
        var indexOfClassCodeBlock = (indexOfClass !== -1) ? result.lastIndexOf('/**', indexOfClass) : -1;
        if (indexOfClassCodeBlock !== -1) {
          var endOfClassCodeBlock = result.indexOf('*/', indexOfClassCodeBlock);
          if (endOfClassCodeBlock !== -1) {
            endOfClassCodeBlock += 2;
            var prefix = result.substring(0, indexOfClassCodeBlock);
            var classComment = result.substring(indexOfClassCodeBlock, endOfClassCodeBlock);
            classComment = classComment.replace(/\n\s*\*/g, '\n *') + '\n';
            var postfix =  result.substring(endOfClassCodeBlock);
            result = classComment + prefix + postfix;
          }
        }

        grunt.file.write(outputPath, result);
      } catch(e) {
        grunt.log.writeln('Failed to process ' + file + '; ', e);
      }
    }

    var files = [];
    // Iterate over each file set and generate the build file specified for that set
    this.files.forEach(function(fileGroup) {
      fileGroup.src.forEach(function(file, index) {
        files.push(file);
        // TODO: Generalize this to not only work with lib-es6
        try {
          convert(file, file.replace(/^lib-es6/, fileGroup.dest));
        } catch(e) {
          console.error('Failed to convert ' + file + ' to babel');
          throw(e);
        }
      });
    });
  });


  grunt.registerMultiTask('webcomponents', 'Building Web Components', function() {
    var options = this.options();

    function createCombinedComponentFile(file, outputPathES5, outputPathES6) {
      try {
      // Extract the class name; TODO: class name should be same as file name.
      var jsFileName = file.replace(/^.*\//, '');
      var className = jsFileName.replace(/\.js$/, '');

      if (jsFileName === 'test.js') return;

      var output = grunt.file.read(file);

      var templateCount = 0;
      var outputFolderES6 = path.dirname(outputPathES6);
      var outputFolderES5 = path.dirname(outputPathES5);

      // Find the template file by checking for an html file of the same name as the js file in the same folder.
      var parentFolder = path.dirname(file);
      var pathToBase = parentFolder.replace(/[/|\bsrc/ui/][^/]*/g, "/..").substring(7) + "/base"

      var templates = grunt.file.expand(parentFolder + "/*.html")
      templates.forEach(function(templateFileName) {
      // Stick the entire template into a function comment for easy multi-line string,
      // and feed the resulting function.toString() into buildTemplate() to create and assign a template to the widget.
      // TODO: maybe we should minify the HTML and CSS so it fits on a single line and doesn't need a function comment.
      //       Note: this would require escaping of all strings, which can get messy.
        grunt.log.writeln("Writing template for " + className);
        var contents = grunt.file.read(templateFileName);
        contents = contents.replace(/\/\*[\s\S]*?\*\//mg, '');

        var templates = contents.match(/^\s*<template(\s+id=['"].*?['"]\s*)?>([\s\S]*?)<\/template>/mg);
        templates.forEach(function(templateString) {
          templateCount++;
          var templateMatches = templateString.match(/^\s*<template(\s+id=['"].*?['"]\s*)?>([\s\S]*?)<\/template>/m);
          var templateContents = templateMatches[2];
          var templateId = templateMatches[1] || '';
          if (templateId) templateId = templateId.replace(/^.*['"](.*)['"].*$/, "$1");
          if (!templateId) {
            var templateName = templateFileName.replace(/\.html/, '').replace(/^.*\//, '');
            if (templateName !== className) templateId = templateName;
          }

          // Extracting styles won't be needed once we have shadow dom.  For now, this prevents 500 <layer-message> css blocks
          // from getting added and all applying to all messages.
          var styleMatches = templateContents.match(/<style>([\s\S]*)<\/style>/);
          var style;
          if (styleMatches) {
            style = styleMatches[1].replace(/^\s*/gm, '');
            templateContents = templateContents.replace(/<style>([\s\S]*)<\/style>\s*/, '');
          }

          // Strip out white space between tags
          templateContents = templateContents.replace(/<!--[\s\S]*?-->/gm, '');

          // Strip out HTML Comment Nodes
          templateContents = templateContents.replace(/>\s+</g, '><');

          // Generate the <template /> and <style> objects
          output += '\n(function() {\n';
          output += 'var layerUI = require(\'' + pathToBase + '\');\n';
          output += 'layerUI.buildAndRegisterTemplate("' + className + '", ' + JSON.stringify(templateContents.replace(/\n/g,'').trim()) + ', "' + templateId + '");\n';
          output += 'layerUI.buildStyle("' + className + '", ' + JSON.stringify(style.trim()) + ', "' + templateId + '");\n';
          output += '})()';
        });
      });


      //var outputES5 = output.replace(/\/\*[\s\S]*?\*\//g, '');
      var outputES5 = output;
      //var outputES6 = output.replace(/import\s+Layer\s+from\s+'layer-websdk'\s*;/g, 'import Layer from \'layer-websdk/index-es6\'');
      var outputES6 = output.replace(/import\s+(Layer, {.*?}|Layer|{.*?})\s+from\s+'layer-websdk'\s*;/g, 'import $1 from \'layer-websdk/index-es6\'');

      if (!grunt.file.exists(outputFolderES6)) {
        grunt.file.mkdir(outputFolderES6);
      }
      grunt.file.write(outputPathES6, outputES6);

      if (!grunt.file.exists(outputFolderES5)) {
        grunt.file.mkdir(outputFolderES5);
      }

      var babelResult = babel.transform(outputES5, {
        presets: ['babel-preset-es2015']
      });
      outputES5 = babelResult.code;

      // Babel sometimes moves our jsduck comments defining the class to the end of the file, causing JSDuck to quack.
      // Move it back to the top so that JSDuck knows what class all the properties and methods belong to.
      var indexOfClass = outputES5.indexOf('@class');
      var indexOfClassCodeBlock = (indexOfClass !== -1) ? outputES5.lastIndexOf('/**', indexOfClass) : -1;
      if (indexOfClassCodeBlock !== -1) {
        var endOfClassCodeBlock = outputES5.indexOf('*/', indexOfClassCodeBlock);
        if (endOfClassCodeBlock !== -1) {
          endOfClassCodeBlock += 2;
          var prefix = outputES5.substring(0, indexOfClassCodeBlock);
          var classComment = outputES5.substring(indexOfClassCodeBlock, endOfClassCodeBlock);
          classComment = classComment.replace(/\n\s*\*/g, '\n *') + '\n';
          var postfix =  outputES5.substring(endOfClassCodeBlock);
          outputES5 = classComment + prefix + postfix;
        }
      }

      grunt.file.write(outputPathES5, outputES5);
      //grunt.log.writeln("Wrote " + outputPath + "; success: " + grunt.file.exists(outputPath));
      } catch(e) {
        grunt.log.writeln('Failed to process ' + file + '; ', e);
      }
    }

    var files = [];
    // Iterate over each file set and generate the build file specified for that set
    this.files.forEach(function(fileGroup) {
      fileGroup.src.forEach(function(file, index) {
        files.push(file);
        var outputPathES5 = file.replace(/^src/, 'lib');
        var outputPathES6 = file.replace(/^src/, 'lib-es6');
        createCombinedComponentFile(file, outputPathES5, outputPathES6);
      });
    });
  });


  grunt.registerMultiTask('generate-tests', 'Building SpecRunner.html', function() {
    var options = this.options();
    var specFiles = [
      {file: 'test/SpecRunnerTemplate.html', contents: grunt.file.read('test/SpecRunnerTemplate.html'), template: true, destName: 'ui_'},
      {file: 'test/SpecRunnerTemplate.html', contents: grunt.file.read('test/SpecRunnerTemplate.html'), template: false},
      {file: 'test/CoverageRunner.html', contents: grunt.file.read('test/CoverageRunner.html'), template: false}
    ];
    var startStr = "<!-- START GENERATED SPEC LIST -->";
    var endStr = "<!-- END GENERATED SPEC LIST -->";

    var startIndexes = specFiles.map(function(file) {
      return file.contents.indexOf(startStr) + startStr.length;
    });
    var endIndexes = specFiles.map(function(file) {
      return file.contents.indexOf(endStr);
    });

    var scripts = {all: []};

    // Iterate over each file set and generate the build file specified for that set
    this.files.forEach(function(fileGroup) {
      fileGroup.src.forEach(function(file, index) {
        var scriptTag = '<script src="../' + file + '" type="text/javascript"></script>';
        var folderName = file.replace(/src\/ui\/?(.*?)\/.*$/, "$1");
        var componentFolderName = file.replace(/src\/ui\/components\/?(.*?)\/.*$/, "$1");

        // Arbitrary subdivision of the components folder which has too many tests for IE11
        if (folderName === 'components') {
          folderName += "_" + (componentFolderName.indexOf('layer-') === 0 ? 'basic' : 'nested');
        }
        if (!scripts[folderName]) scripts[folderName] = [];
        scripts[folderName].push(scriptTag);
        scripts.all.push(scriptTag);
      });
    });

    for (var i = 0; i < specFiles.length; i++) {
      var filePath = specFiles[i].file;
      var contents = specFiles[i].contents;
      if (startIndexes[i] !== -1) {
        if (!specFiles[i].template) {
          contents = contents.substring(0, startIndexes[i]) + '\n' + scripts.all.join('\n') + '\n' + contents.substring(endIndexes[i]);
          grunt.file.write(filePath, contents);
        } else {

          Object.keys(scripts).forEach(function(testName, index, allScripts) {
            if (testName === 'all') return;
            var testFile = contents.substring(0, startIndexes[i]) + '\n' + scripts[testName].join('\n') + '\n' + contents.substring(endIndexes[i]);
            if (index < allScripts.length - 1) {
              testFile = testFile.replace(/next_file_name_here\.html/, specFiles[i].destName + allScripts[index + 1] + '.html');
            } else {
              testFile = testFile.replace(/next_file_name_here\.html/, 'tests_done.html');
            }
            console.log("WRITE " + specFiles[i].destName + testName + '.html');
            grunt.file.write(filePath.replace(/[^/]*$/, specFiles[i].destName + testName + '.html'), testFile);
          });
        }
      }
    }
  });

  grunt.registerTask('generate-npmignore', 'Building .npmignore', function() {
    var gitIgnore = grunt.file.read('./.gitignore') || '';
    gitIgnore = gitIgnore.replace(/#\s*\!npmignored[\s\S]*$/m, '');
    var npmIgnoreSource = grunt.file.read('./npmignore-source');
    grunt.file.write('.npmignore', (npmIgnoreSource ? '\n\n' + npmIgnoreSource : '') + (gitIgnore ? '\n\n' + gitIgnore : ''));
  });

  grunt.registerTask('wait', 'Waiting for files to appear', function() {
    console.log('Waiting...');
    var done = this.async();

    // There is an inexplicable delay between when grunt writes a file (and confirms it as written) and when it shows up in the file system.
    // This has no affect on subsequent grunt tasks but can severely impact npm publish
    // Note that we can't test if a file exists because grunt reports that it exists even if it hasn't yet been flushed to the file system.
    setTimeout(function() {
      console.log("Waiting...");
      setTimeout(function() {
        console.log("Waiting...");
        setTimeout(function() {
          done();
        }, 1500);
      }, 1500);
    }, 1500);
  });


  // Building
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-jsduck');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-saucelabs');
  grunt.loadNpmTasks('grunt-remove');
  grunt.loadNpmTasks('grunt-move');

  // Testing
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  //grunt.registerTask('phantomtest', ['debug', 'jasmine:debug']);
  grunt.registerTask('coverage', ['copy:fixIstanbul', 'custom_copy:src', 'remove:lib', 'remove:libes5', 'custom_babel', 'move:lib', 'browserify:coverage']);
  grunt.registerTask("test", ["generate-tests", "connect:saucelabs", "saucelabs-jasmine"]);


  grunt.registerTask('docs', ['debug', 'jsducktemplates', 'jsduck', 'jsduckfixes']);

  // Basic Code/theme building
  grunt.registerTask('debug', ['version', 'webcomponents', 'custom_copy:src', 'remove:libes5', 'custom_babel', 'remove:lib', 'move:lib', 'browserify:build', 'generate-tests']);
  grunt.registerTask('build', ['generate-npmignore', 'remove:build', 'debug', 'uglify', 'theme', 'cssmin']);
  grunt.registerTask('prepublish', ['build', 'wait']);
  grunt.registerTask('samples', ['debug', 'browserify:samples']);
  grunt.registerTask('theme', ['remove:theme', 'less', 'copy:themes']),
  grunt.registerTask('default', ['build']);

  // Open a port for running tests and rebuild whenever anything interesting changes
  grunt.registerTask("develop", ["connect:develop", "watch"]);
};
