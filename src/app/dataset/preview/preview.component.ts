import { Component, OnInit, Input } from '@angular/core';
import 'codemirror/mode/xml/xml';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/xml-fold';
import 'codemirror/addon/fold/indent-fold';
import 'codemirror/addon/fold/markdown-fold';
import 'codemirror/addon/fold/comment-fold';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: [
    './preview.component.scss'
   ]
})

export class PreviewComponent implements OnInit {

  constructor() { }

  @Input('datasetData') datasetData;
  editorPreviewCode;
  editorConfig;

  ngOnInit() {

    if (this.datasetData) {
    	this.editorPreviewCode = `<ore:Aggregation
      rdf:about="/aggregation/provider/08502/5F41E0B657BDD9923BA2C4655BB7A6880A2ED5C2">
      <edm:aggregatedCHO rdf:resource="/item/08502/5F41E0B657BDD9923BA2C4655BB7A6880A2ED5C2"/>
      <edm:dataProvider>Israel Museum, Jerusalem</edm:dataProvider>
      <edm:isShownAt
          rdf:resource="http://www.imj.org.il/imagine/collections/item.asp?itemNum=193112"/>
      <edm:isShownBy
          rdf:resource="http://www.imj.org.il/images/corridor/bezalel/modern/new modern scans/g-h-i/gauguin-still life~b66_1041.jpg"/>
      <edm:object
          rdf:resource="http://www.imj.org.il/images/corridor/bezalel/modern/new modern scans/g-h-i/gauguin-still life~b66_1041.jpg"/>
      <edm:provider>Athena</edm:provider>
      <dc:rights>aggregation - dc:rights</dc:rights>
      <edm:rights rdf:resource="http://rightsstatements.org/vocab/InC/1.0/"/>
      <edm:intermediateProvider> Name of the intermediate provider</edm:intermediateProvider>
      <edm:intermediateProvider rdf:resource="http://Aggregation-edm-intermediateProvider"/>
  </ore:Aggregation>`;
    }
    
  	this.editorConfig = { 
      mode: 'application/xml',
      lineNumbers: true,
      tabSize: 2,
      readOnly: true,
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
    };

  }
}
