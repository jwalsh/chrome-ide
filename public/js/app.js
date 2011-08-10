// Create holders for all content areas that will need to be updated by the application
// TODO: Consolidate nomenclature of DOM selectors 
var mainEditor = document.querySelector('#main_editor');
var selectFile = document.querySelector('#selectFile');
var filenameEl = document.querySelector('#filename');
var filetypeEl = document.querySelector('#filetype');
// TODO: Check load ordering that makes staus unavailable on load
var status = document.querySelector('#status');
var titleEl = document.querySelector('title');
var filesEl = document.getElementById('files');

// BEGIN: file template populator
// This is the main selection for the default files content 
var selectFileHtml = ''; // concat rather than push

var templates = [
    {
      name: 'manifest.json',
      syntax: 'javascript',
      data: '{\n  "name": "My Extension",\n  "version": "versionString",\n\n  "description": "A plain text description",\n  "icons":\n    {\n      "128": "http://wal.sh/poc/superchromeide/public/img/icon128.png",\n      "16": "http://wal.sh/poc/superchromeide/public/img/icon16.png"\n    }\n  }'
    },
    {
      name: 'index.html',
      syntax: 'text/html',
      data: '<html>\n  <body>\n    <h1>Welcome to My Extension</h1>\n    <nav>\n      <ul>\n        <li>add</li>\n        <li>update</li>\n        <li>delete</li>\n        <li><a href="about.html">about</a></li>\n      </ul>\n    </nav>\n    <script src="app.js"></script>\n  </body>\n</html>'
    },
    {
      name: 'about.html',
      syntax: 'text/html',
      data: '<html>\n  <body>\n    <h1>About My Extension</h1>\n    <nav>\n      <ul>\n        <li>home</li>\n      </ul>\n    </nav>\n    <p>A plain text description.</p>\n  </body>\n</html>'
    },
    {
      name: 'app.js',
      syntax: 'javascript',
      data: 'console.log(\'Loaded My Extension...\')'
    }
];

// Render template model into an option view 
templates.forEach(function(item) {
  selectFileHtml += '<option value="' + item.name + '" data-syntax="' + item.syntax + '">' + item.name + '</option>';
});

selectFile.innerHTML = selectFileHtml; 

function updateSelectedFileUI(filename, filetype) {
  filenameEl.innerHTML = filename;
  filetypeEl.innerHTML = filetype;
  titleEl.innerHTML = 'file: ' + filename;
  window.location.hash = '#file:' + filename;
}

// When selecting any filename update the main editor window (and title)
selectFile.addEventListener(
    'change',
    function() {
      var i = selectFile.selectedIndex;
      editor.setValue(templates[i].data);
      updateSelectedFileUI(selectFile.options[i].value, selectFile.options[i].dataset.syntax);
      editor.setOption('mode', selectFile.options[i].dataset.syntax);
    }

);
// END: file template populator

Downloadify.create('downloadify', {
  data: function() {
    return zip.go();
  },
  filename: 'chrome-extension.zip',
  swf: 'media/downloadify.swf',
  dataType: 'base64',
  onComplete: function() { alert('Your File Has Been Saved!'); },
  onCancel: function() { alert('You have cancelled the saving of this file.'); },
  onError: function() { alert('You must put something in the File Contents or there will be nothing to save.'); },
  downloadImage: 'img/download.png',
  transparent: false,
  width: 100,
  height: 30,
  append: false
});

zip = {
  go: function() {
    var zip = new JSZip();
    zip.add('manifest.json');
    return zip.generate();
  }
};


function errorHandler(e) {
  var msg = '';
  switch (e.code) {
  case FileError.QUOTA_EXCEEDED_ERR:
    msg = 'QUOTA_EXCEEDED_ERR';
    break;
  case FileError.NOT_FOUND_ERR:
    msg = 'NOT_FOUND_ERR';
    break;
  case FileError.SECURITY_ERR:
    msg = 'SECURITY_ERR';
    break;
  case FileError.INVALID_MODIFICATION_ERR:
    msg = 'INVALID_MODIFICATION_ERR';
    break;
  case FileError.INVALID_STATE_ERR:
    msg = 'INVALID_STATE_ERR';
    break;
  default:
    msg = 'Unknown Error';
    break;
  }
  console.log('Error: ' + msg);
}
var FS;

var readDir = function(dirs) {
  var entries = dirs;
  var dirReader = FS.root.createReader();
  var readEntries = function readEntries() {
    dirReader.readEntries(function(results) {
      if (!results.length) {
        zip.additionaltargets.append(entries.sort());
        listResults(entries.sort());
      } else {
        entries = entries.concat(toArray(results));
        readEntries();
      }
    }, errorHandler);
  };
  readEntries();
};

function handleFileSelect(evt) {
  var files = evt.target.files; // FileList object
  var output = [];
  readDir(files);
}


var addDir = function(dir) {
  FS.root.getDirectory(dir.name, {create: false}, function(fileEntry) {
    console.log(fileEntry);
  }, errorHandler);
};

var addFile = function(directory, name, content) {
  FS.root.getFile(name, {create: true}, function(fileEntry) {
    fileEntry.createWriter(function(fileWriter) {
      fileWriter.onwriteend = function(e) {
        console.log('Write completed.');
      };

      fileWriter.onerror = function(e) {
        console.log('Write failed: ' + e.toString());
      };

      // Create a new Blob and write it to log.txt.
      var bb = new window.WebKitBlobBuilder(); // Note: window.WebKitBlobBuilder in Chrome 12.
      bb.append(content);
      fileWriter.write(bb.getBlob('text/plain'));
    }, errorHandler);
  }, errorHandler);
};


var file = (function() {
  return {
    add: function(e) {
      //clear text area
    },
    save: function(e) {
      //pull title from element
      //grab text from main windown
      //add them both to FS
      var title = titleEl.value;
      var content = mainEditor.value;
      addFile(FS.root, title, content);
    },
    zip: function() { }
  };
}());


var initFilesystem = function(fs) {
  FS = fs;
  file.save({});
};

window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
window.requestFileSystem(window.PERSISTENT, 1024 * 1024, initFilesystem, errorHandler);
filesEl.addEventListener('change', handleFileSelect, false);

// BEGIN: Save the active editor state
// Provide support for saving all changes locally before uploading
var storage = localStorage.getItem('editorfile');

/* init syntax highlighting - codemirror */
window.editor = CodeMirror.fromTextArea(
    document.querySelector('#main_editor'), {
      mode: 'text/html',
      lineNumbers: true,
      onChange: function() {
        // TODO: Requerying the DOM should be unnecessary 
        var status = document.querySelector('#status');
        status.innerHTML = 'Saving...';
        setInterval(
            function() {
              status.innerHTML = 'Ready';
            }, 1200);
        localStorage.setItem('editorfile', editor.getValue());
      }
    });

// END: Save the active editor state

// START: Final UI cleanup  
window.onload = function() { 
  var status = document.querySelector('#status');
  status.innerHTML = 'Loaded';
};


// END: Final UI cleanup  



