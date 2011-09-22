Cucumber-HTML is a cross-platform HTML formatter for all the Cucumber implementations.

## Prerequisites

The formatter generates HTML that conforms to the HTML5 specification, so you need a modern browser to see the results.

## Generating PDF

This formatter replaces Cucumber's old PDF formatter. You can easily turn a HTML report into a PDF with the excellent [wkhtmltopdf](http://code.google.com/p/wkhtmltopdf/):

    wkhtmltopdf cucumber-report.html cucumber-report.pdf
