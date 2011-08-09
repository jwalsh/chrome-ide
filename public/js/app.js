var templates = [
		{
				name: 'manifest.json', 
				syntax: 'javascript',
				data: '{\n	"name": "My Extension",\n	"version": "versionString",\n\n	// Recommended\n	"description": "A plain text description",\n	"icons": { "128": "icon128.png" }\n  }'
		},
		{
				name: 'index.html', 
				syntax: 'text/html',
				data: '<html>\n<body>\n<h1>index.html</h1>\n</body>\n</html>'
		},
		{
				name: 'about.html', 
				syntax: 'text/html',
				data: '<html>\n<body>\nAbout</body>\n</html>'
		}

];

var mainEditor = document.querySelector('#main_editor');
var selectFile = document.querySelector('#selectFile');
var selectFileHtml = ''; // concat rather than push

// This is used for the default file selectors
templates.forEach(function(item) { 
		console.log(item);
		selectFileHtml += '<option value="' + item.name + '" data-syntax="' + item.syntax + '">' + item.name + '</option>'; 
});  

// This is the main selection for the default content 
selectFile.innerHTML = selectFileHtml;

selectFile.addEventListener(
		'change',
		function() {
				var i = selectFile.selectedIndex;
				//				mainEditor.innerHTML = templates[i].data; 
				editor.setValue(templates[i].data);
				console.log(templates[i].name);
				editor.setOption('mode', selectFile.options[i].dataset.syntax);
		}

);

	function debug(m) { // @message
		console.log(m);
	}

	Downloadify.create('downloadify', {
		data: function(){
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
			dirReader.readEntries (function(results) {
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


	var addDir = function(dir){
		FS.root.getDirectory(dir.name, {create: false}, function(fileEntry) {
			console.log(fileEntry);
		}, errorHandler);
	};

	var addFile = function(directory, name, content){
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
				var title = document.querySelector('title').value;
				var content = document.querySelector('#main_editor').value;
				addFile(FS.root, title, content);
			},
			zip: function() { }	
		}; 
	}());


	var initFilesystem = function(fs) {
		FS = fs;
		file.save({});
	};

	window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
	window.requestFileSystem(window.PERSISTENT, 1024*1024, initFilesystem, errorHandler);
	document.getElementById('files').addEventListener('change', handleFileSelect, false);

// Provide support for saving all changes locally before uploading 
var storage = localStorage.getItem("editorfile");



/* init syntax highlighting - codemirror */
window.editor = CodeMirror.fromTextArea(
	document.querySelector('#main_editor'), {
		mode: "text/html",
		lineNumbers: true, 
		onChange: function() { 
			var status = document.querySelector('#status'); 
			status.innerHTML = 'Updated';
			setInterval(
				function() { 
					status.innerHTML = '';
				}, 1200);
			localStorage.setItem("editorfile", editor.getValue());				
		} 
	});


	
