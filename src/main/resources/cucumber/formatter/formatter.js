var CucumberHTML = {};

CucumberHTML.DOMFormatter = function(rootNode) {
  var currentUri;
  var currentFeature;
  var currentElement;
  var currentSteps;

  var currentStepIndex;
  var currentStep;
  var $templates;

  if ($('#older-ie-browser').length > 0) {
    $templates = $(CucumberHTML.templatesHtml4);
  } else {
    $templates = $(CucumberHTML.templates);
  }

  this.uri = function(uri) {
    currentUri = uri;
  };

  this.feature = function(feature) {
    currentFeature = blockElement(null, feature, 'feature');
	currentFeature.appendTo(rootNode);
  };

  this.background = function(background) {
    currentElement = featureElement(background, 'background');
    currentStepIndex = 1;
  };

  this.scenario = function(scenario) {
    currentElement = featureElement(scenario, 'scenario');
    currentStepIndex = 1;
  };

  this.scenarioOutline = function(scenarioOutline) {
    currentElement = featureElement(scenarioOutline, 'scenario_outline');
    currentStepIndex = 1;
  };

  this.step = function(step) {
    var stepElement = $('.step', $templates).clone();
    populate(stepElement, step, 'step');

    if (step.doc_string) {
      docString = $('.doc_string', $templates).clone();
      // TODO: use a syntax highlighter based on the content_type
      docString.text(step.doc_string.value);
      docString.appendTo(stepElement);
    }
    if (step.rows) {
      dataTable = $('.data_table', $templates).clone();
      var tBody = dataTable.find('tbody');
	  var cont = ""
      $.each(step.rows, function(index, row) {
		var tds = "";
        $.each(row.cells, function(index, cell) {
		  tds += '<td>'+cell+'</td>';
        });
		cont += '<tr>'+tds+'</tr>';
      });
	  $(cont).appendTo(tBody);
      dataTable.appendTo(stepElement);
    }
    stepElement.appendTo(currentSteps);
  };

  this.examples = function(examples) {
    var examplesTable = $('.examples_table', $templates).clone();
	var thead = examplesTable.find('thead');
	var tbody = examplesTable.find('tbody');
    $.each(examples.rows, function(index, row) {
	  var tds = "";
      $.each(row.cells, function(index, cell) {
		tds += '<td>' + cell + '</td>';
      });
      var parent = index == 0 ? thead : tbody;
	  $('<tr>'+tds+'</tr>').appendTo(parent);
    });
    var examplesElement = blockElement(currentElement.children('.details'), examples, 'examples');
    examplesTable.appendTo(examplesElement.children('.details'));
  };

  this.match = function(match) {
    currentStep = currentSteps.find('li:nth-child(' + currentStepIndex + ')');
    currentStepIndex++;
  };

  this.result = function(result) {
    currentStep.addClass(result.status);
    if (result.status == 'failed') {
      populateStepError(currentStep, result.error_message);
    }
    currentElement.addClass(result.status);
    var isLastStep = currentSteps.find('li:nth-child(' + currentStepIndex + ')').length == 0;
    if (isLastStep) {
      if (currentSteps.find('.failed').length == 0) {
        // No failed steps. Collapse it.
        currentElement.find('.details').removeAttr('open');
      } else {
        currentElement.find('.details').attr('open', 'open');
      }
    }
  };

  this.embedding = function(mimeType, data) {
    if (mimeType.match(/^image\//)) 
    {
      currentStep.append('<img src="' + data + '">');
    }
    else if (mimeType.match(/^video\//)) 
    {
      currentStep.append('<video src="' + data + '" type="' + mimeType + '" autobuffer controls>Your browser doesn\'t support video.</video>');
    }
    else if (mimeType.match(/^text\//)) 
    {
      this.write(data);
    }
  };

  this.write = function(text) {
    currentStep.append('<pre class="embedded-text">' + text + '</pre>');
  }

  function featureElement(statement, itemtype) {
    var e = blockElement(currentFeature.children('.details'), statement, itemtype);

    currentSteps = $('.steps', $templates).clone();
    currentSteps.appendTo(e.children('.details'));

    return e;
  }

  function blockElement(parent, statement, itemtype) {
    var e = $('.blockelement', $templates).clone();
	populate(e, statement, itemtype);
	if (parent != null) {
	  e.appendTo(parent);
	}
    return e;
  }

  function populate(e, statement, itemtype) {
    populateTags(e, statement.tags);
    populateComments(e, statement.comments);
    e.find('.keyword').text(statement.keyword);
    e.find('.name').text(statement.name);
    e.find('.description').text(statement.description);
    e.attr('itemtype', 'http://cukes.info/microformat/' + itemtype);
    e.addClass(itemtype);
    return e;
  }

  function populateComments(e, comments) {
    if (comments !== undefined) {
      var commentsNode = $('.comments', $templates).clone();
	  var commentNode = $('.comment', $templates);
      $.each(comments, function(index, comment) {
        if (comment != undefined && comment.value != undefined) {
		  var cN = commentNode.clone().text(comment.value);
          cN.appendTo(commentsNode);
        }
      });
	  commentsNode.prependTo(e.find('.header'));
    }
  }

  function populateTags(e, tags) {
    if (tags !== undefined) {
      var tagsNode = $('.tags', $templates).clone();
	  var tagNode = $('.tag', $templates);
      $.each(tags, function(index, tag) {
		var tN = tagNode.clone().text(tag.name);
		tN.appendTo(tagsNode);
      });
	  tagsNode.prependTo(e.find('.header'));
    }
  }

  function populateStepError(e, error) {
    if (error !== undefined) {
      errorNode = $('.error', $templates).clone().appendTo(e);
      errorNode.text(error);
    }
  }
};

CucumberHTML.templates = '<div>\
  <section class="blockelement section" itemscope>\
    <details class="details" open>\
      <summary class="header summary">\
        <span class="keyword" itemprop="keyword">Keyword</span>: <span itemprop="name" class="name">This is the block name</span>\
      </summary>\
      <div itemprop="description" class="description">The description goes here</div>\
    </details>\
  </section>\
\
  <ol class="steps"></ol>\
\
  <ol>\
    <li class="step"><span class="keyword" itemprop="keyword">Keyword</span><span class="name" itemprop="name">Name</span></li>\
  </ol>\
\
  <pre class="doc_string"></pre>\
\
  <pre class="error"></pre>\
\
  <table class="data_table">\
    <tbody>\
    </tbody>\
  </table>\
\
  <table class="examples_table">\
    <thead></thead>\
    <tbody></tbody>\
  </table>\
\
  <section class="embed section">\
    <img itemprop="screenshot" class="screenshot" />\
  </section>\
  <div class="tags"></div>\
  <span class="tag"></span>\
  <div class="comments"></div>\
  <div class="comment"></div>\
<div>';

CucumberHTML.templatesHtml4 = '<div>\
  <div class="blockelement" itemscope>\
    <div class="details" open>\
      <div class="header">\
        <span class="keyword" itemprop="keyword">Keyword</span>: <span itemprop="name" class="name">This is the block name</span>\
      </div>\
      <div itemprop="description" class="description">The description goes here</div>\
    </div>\
  </div>\
\
  <ol class="steps"></ol>\
\
  <ol>\
    <li class="step"><span class="keyword" itemprop="keyword">Keyword</span><span class="name" itemprop="name">Name</span></li>\
  </ol>\
\
  <pre class="doc_string"></pre>\
\
  <table class="data_table">\
    <tbody>\
    </tbody>\
  </table>\
\
  <table class="examples_table">\
    <thead></thead>\
    <tbody></tbody>\
  </table>\
\
  <div class="embed section">\
    <img itemprop="screenshot" class="screenshot" />\
  </div>\
  <div class="tags"></div>\
  <span class="tag"></span>\
  <div class="comments"></div>\
  <div class="comment"></div>\
<div>';

if (typeof module !== 'undefined') {
  module.exports = CucumberHTML;
} else if (typeof define !== 'undefined') {
  define([], function() { return CucumberHTML; });
}
