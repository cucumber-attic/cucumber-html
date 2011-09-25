var CucumberHTML = {};

CucumberHTML.DOMFormatter = function(rootNode) {
    var currentUri;
    var currentFeature;
    var currentElement;
    var currentSteps;

    var currentStepIndex;
    var currentStep;

    this.uri = function(uri) {
        currentUri = uri;
    };

    this.feature = function(feature) {
        currentFeature = blockElement(rootNode, feature, 'feature');
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
        var stepElement = $('#cucumber-templates .step').clone();
        stepElement.appendTo(currentSteps);
        populate(stepElement, step, 'step');

        if (step.doc_string) {
            docString = $('#cucumber-templates .doc_string').clone();
            docString.appendTo(stepElement);
            // TODO: use a syntax highlighter based on the content_type
            docString.text(step.doc_string.value);
        }
        if (step.rows) {
            dataTable = $('#cucumber-templates .data_table').clone();
            dataTable.appendTo(stepElement);
            var tBody = dataTable.find('tbody');
            $.each(step.rows, function(index, row) {
                var tr = $('<tr></tr>').appendTo(tBody);
                $.each(row.cells, function(index, cell) {
                    var td = $('<td>' + cell + '</td>').appendTo(tBody);
                });
            });
        }
    };

    this.examples = function(examples) {
        var examplesElement = blockElement(currentElement.children('details'), examples, 'examples');
        var examplesTable = $('#cucumber-templates .examples_table').clone();
        examplesTable.appendTo(examplesElement.children('details'));

        $.each(examples.rows, function(index, row) {
            var parent = index == 0 ? examplesTable.find('thead') : examplesTable.find('tbody');
            var tr = $('<tr></tr>').appendTo(parent);
            $.each(row.cells, function(index, cell) {
                var td = $('<td>' + cell + '</td>').appendTo(tr);
            });
        });
    };

    this.match = function(match) {
        currentStep = currentSteps.find('li:nth-child(' + currentStepIndex + ')');
        currentStepIndex++;
    };

    this.result = function(result) {
        currentStep.addClass(result.status);
        currentElement.addClass(result.status);
        var isLastStep = currentSteps.find('li:nth-child(' + currentStepIndex + ')').length == 0;
        if(isLastStep) {
            if(currentSteps.find('.failed').length == 0) {
                // No failed steps. Collapse it.
                currentElement.find('details').removeAttr('open');
            }
        }
    };

    this.embedding = function(mimeType, data) {
        if(mimeType.match(/^image\//)) {
            currentStep.append("<div><img src='" + data + "'></div>");
        }
    }

    function featureElement(statement, itemtype) {
        var e = blockElement(currentFeature.children('details'), statement, itemtype);

        currentSteps = $('#cucumber-templates .steps').clone();
        currentSteps.appendTo(e.children('details'));

        return e;
    }

    function blockElement(parent, statement, itemtype) {
        var e = $('#cucumber-templates .blockelement').clone();
        e.appendTo(parent);
        return populate(e, statement, itemtype);
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
            var commentsNode = $('#cucumber-templates .comments').clone().prependTo(e.find('.header'));
            $.each(comments, function(index, comment) {
                var commentNode = $('#cucumber-templates .comment').clone().appendTo(commentsNode);
                commentNode.text(comment.value);
            });
        }
    }

    function populateTags(e, tags) {
        if (tags !== undefined) {
            var tagsNode = $('#cucumber-templates .tags').clone().prependTo(e.find('.header'));
            $.each(tags, function(index, tag) {
                var tagNode = $('#cucumber-templates .tag').clone().appendTo(tagsNode);
                tagNode.text(tag.name);
            });
        }
    }
};

if (typeof module !== 'undefined') {
    module.exports = CucumberHTML;
}