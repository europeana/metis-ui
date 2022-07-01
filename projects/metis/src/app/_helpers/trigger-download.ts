import { XmlSample } from '../_models';

export function triggerXmlDownload(xml?: XmlSample): void {
  if (xml) {
    const anchor = document.createElement('a');
    anchor.href = `data:text/xml,${encodeURIComponent(xml.xmlRecord)}`;
    anchor.target = '_blank';
    anchor.download = `record-${xml.ecloudId}.xml`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
}
