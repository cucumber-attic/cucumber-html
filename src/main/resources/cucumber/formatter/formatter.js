var Cucumber = {};

Cucumber.DOMFormatter = function(rootNode) {
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
        var stepElement = $('#templates .step').clone();
        stepElement.appendTo(currentSteps);
        // TODO: comments
        stepElement.find('.keyword').text(step.keyword);
        stepElement.find('.name').text(step.name);

        if (step.doc_string) {
            docString = $('#templates .doc_string').clone();
            docString.appendTo(stepElement);
            // TODO: use a syntax highlighter based on the content_type
            docString.text(step.doc_string.value);
        }
        if (step.rows) {
            dataTable = $('#templates .data_table').clone();
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
        var examplesElement = blockElement(currentElement, examples, 'examples');
        examplesElement.addClass('childSection');

        var examplesTable = $('#templates .examples_table').clone();
        examplesTable.appendTo(examplesElement);

        $.each(examples.rows, function(index, row) {
            var parent = index == 0 ? examplesTable.find('thead') : examplesTable.find('tbody');
            var tr = $('<tr></tr>').appendTo(parent);
            $.each(row.cells, function(index, cell) {
                var td = $('<td>' + cell + '</td>').appendTo(tr);
            });
        });
    };

    this.match = function(match) {
        currentStep = currentSteps.find('li:nth-child(' + currentStepIndex++ + ')');
    };

    this.result = function(result) {
        currentStep.addClass(result.status);
    };

    function featureElement(statement, itemtype) {
        var e = blockElement(currentFeature, statement, itemtype);
        e.addClass('childSection');

        currentSteps = $('#templates .steps').clone();
        currentSteps.appendTo(e.find('.childrenElements'));

        return e;
    }

    function blockElement(parent, statement, itemtype) {
        var e = $('#templates .blockelement').clone();
        e.appendTo(parent);
        tags(e, statement.tags);
        // TODO: comments
        e.find('.keyword').text(statement.keyword);
        e.find('.name').text(statement.name);
        e.find('.description').text(statement.description);
        e.attr('itemtype', 'http://cukes.info/microformat/' + itemtype)
        e.addClass(itemtype);
        return e;
    }

    function tags(e, tags) {
        if (tags !== undefined) {
            var tagsNode = $('#templates .tags').clone().prependTo(e.find('.header'));
            $.each(tags, function(index, tag) {
                var tagNode = $('#templates .tag').clone().appendTo(tagsNode);
                tagNode.text(tag.name);
            });
        }
    }
};

if (typeof module !== 'undefined') {
    module.exports = Cucumber;
}