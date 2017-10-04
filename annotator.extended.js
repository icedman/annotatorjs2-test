/*
|--------------------------------------------------------------------------
| Storage
|--------------------------------------------------------------------------
*/

// suppress error message
annotator.storage.HttpStorage.prototype._onError = function() {}

/*
|--------------------------------------------------------------------------
| Editor
|--------------------------------------------------------------------------
*/

try {
    annotator.ui.editor.Editor.template = document.getElementById('editorTemplate').innerHTML;
} catch (e) {}


annotator.ui.editor.Editor.prototype._show = annotator.ui.editor.Editor.prototype.show;
annotator.ui.editor.Editor.prototype.show = function(position) {
    window.annotationEditor = this;

    try {
        if (window.annotationViewer.isShown())
            window.annotationViewer.hide();
    } catch (e) {}
    
    console.log(position);
    this._show(position);
}

/*
|--------------------------------------------------------------------------
| Viewer
|--------------------------------------------------------------------------
*/

try {
    annotator.ui.viewer.Viewer.template = document.getElementById('viewerTemplate').innerHTML;
} catch (e) {}

/*
annotator.ui.viewer.Viewer.prototype._onDeleteClick = function(event) {
    var item = $(event.target)
        .parents('.annotator-annotation')
        .data('annotation');

    this.hide();
    this.options.onDelete(item);
}
*/

annotator.ui.viewer.Viewer.prototype._show = annotator.ui.viewer.Viewer.prototype.show;
annotator.ui.viewer.Viewer.prototype.show = function(position) {
    window.annotationViewer = this;
    window.hideViewerCountdown = 0;

    /*
    if (!window.annotationViewer._render) {
        this._render = 1;
        this.setRenderer( function(annotation) {
            if (!annotation.text) {
                return "<i>Comments</i>";
            }
            return this._render(annotation);
        });

        this.load(this.annotations, position);
    }
    */

    try {
        if (window.annotationEditor.isShown())
            window.annotationEditor.hide();
    } catch (e) {}

    this._show(position);
}


/*
|--------------------------------------------------------------------------
| Hide widgets more quickly
|--------------------------------------------------------------------------
*/

window.hideViewerCountdown = 0;
window.annotationViewer = this;

if (false)
window.setInterval(function() {

    try {
        if (window.hideViewerCountdown++ > 3) {
            window.annotationViewer.hide();
            window.hideViewerCountdown = 0;
        }
    } catch (e) {

    }

}, 1000);

/*
|--------------------------------------------------------------------------
| Highlighter
|--------------------------------------------------------------------------
*/
var saveAnnotationSequence = function () {
    var seq = "0";

    document.querySelectorAll('span.annotator-hl').forEach(
        function(n) {
            var id = n.dataset["annotationId"];
            seq = seq + "," + id;
        }
    );

    window.saseq = 0;

    var annotation = {
        "quote":"sequence", 
        "sequence": seq
    };

    _addAnnotation(annotation, []);
};

var scheduleAnnotationSequence = function() {
    if (window.saseq > 0) {
        clearTimeout(window.saseq);
        window.saseq = 0;
    }
    window.saseq = setTimeout(saveAnnotationSequence, 2000);
};

annotator.ui.highlighter.Highlighter.prototype._draw = annotator.ui.highlighter.Highlighter.prototype.draw;
annotator.ui.highlighter.Highlighter.prototype.draw = function(annotation) {

    this.options.highlightClass = 'annotator-hl'; // annotator-hl-facts';

    var list = [ "facts", "issues", "ruling", "principles", "important" ];
    for(var li in list) {
        var tag = list[li];
        if (annotation.tags.indexOf(tag) != -1)
            this.options.highlightClass = 'annotator-hl annotator-hl-' + tag;
    }

    this._draw(annotation);
    scheduleAnnotationSequence();
};


/*
|--------------------------------------------------------------------------
| Adder
|--------------------------------------------------------------------------
*/

var _clearHighlight = function() {
    if (window.getSelection) {
      if (window.getSelection().empty) {  // Chrome
        window.getSelection().empty();
      } else if (window.getSelection().removeAllRanges) {  // Firefox
        window.getSelection().removeAllRanges();
      }
    } else if (document.selection) {  // IE?
      document.selection.empty();
    }
}

var _addAnnotation = function(annotation, tags) {
    if( typeof tags === 'string' ) {
        annotation['tags'] = [tags];
    } else {
        annotation['tags'] = tags;
    }
    app.annotations.create(annotation);
    window.annotationEditor.hide();
    window.annotationEditor.submit();
    _clearHighlight();
}

try {
    annotator.ui.adder.Adder.template = document.getElementById('adderTemplate').innerHTML;
} catch (e) {}

annotator.ui.adder.Adder.prototype._show = annotator.ui.adder.Adder.prototype.show;
annotator.ui.adder.Adder.prototype.show = function(position) {

    window.annotationAdder = this;
    if (this.annotation !== null && typeof this.onCreate === 'function') {
        if (window.disableAnnotateOnSelect != true) {
            _addAnnotation(this.annotation, window.annotatorClass);
            window.lastAnnotation = null;
        } else {
            window.lastAnnotation = this.annotation;
        }
    }
}

/*
|--------------------------------------------------------------------------
| Initialize
|--------------------------------------------------------------------------
*/

var app = new annotator.App();
app.include(annotator.ui.main,
{
    element: document.getElementsByTagName('article').item(0),
    editorExtensions: [annotator.ui.tags.editorExtension],
    viewerExtensions: [annotator.ui.tags.viewerExtension]
}
);

// app.include(annotator.storage.http, {
//     prefix: '/api',
//     urls: {
//         create:  '/annotations',
//         update:  '/annotations/{id}',
//         destroy: '/annotations/{id}',
//         search:  '/annotations/search'
//     }
// });

var onAnnotatorTapDown = function (e) {
    // $('#selectedText').val('down');
    // window.lastAnnotation = null;
    selectedRange = null;
    _clearHighlight();
};

var onAnnotatorTapUp = function (e) {
    // if (window.lastAnnotation) {
        // _addAnnotation(window.lastAnnotation);
    // }
    // window.lastAnnotation = null;
    // $('#selectedText').val('up');
};

app.start().
    then(function() {
});

// window.addEventListener('load', function() {
//     $('article').bind('tap', {
//         preventDefault: false,
//         onTapDown: onAnnotatorTapDown,
//         onTapUp: onAnnotatorTapUp
//     }, function(e) {
//         console.log(e);
//     });
//     console.log('here!');
// });

var sel = 0;
var selTime = 0;
document.addEventListener("selectionchange", function() {
    if (selTime) {
        clearTimeout(selTime);
    }
    selTime = setTimeout( function() {
        selTime = 0;
    }, 1500);
    
}, false);

function triggerMouseEvent (node, eventType) {
    var clickEvent = document.createEvent ('MouseEvents');
    clickEvent.initEvent (eventType, true, true);
    node.dispatchEvent (clickEvent);
}

var getSelectedRange = function() {
    try {
        if (window.getSelection) {
            selectedRange = window.getSelection().getRangeAt(0);
        } else {
            selectedRange = document.getSelection().getRangeAt(0);
        }

        if (selectedRange.toString() != "") {
            if (!$('#annotationBar').hasClass('showBar')) {
                $('#annotationBar').addClass('showBar');
            }
            return;
        }
    } catch (err) {

    }

    $('#annotationBar').removeClass('showBar');
};

window._annot = function() {
    triggerMouseEvent(document.body, 'mouseup');
    _addAnnotation(window.lastAnnotation);
    window.lastAnnotation = null;
}

window.disableAnnotateOnSelect = true;

setInterval(getSelectedRange, 150);