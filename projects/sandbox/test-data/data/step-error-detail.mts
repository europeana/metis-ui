const stepErrorDetail = `Type: error
  Records: [
    /opt/tomcat/temp/37/227351442.xml,
  /opt/tomcat/temp/37/227351445.xml,
  /opt/tomcat/temp/37/227351447.xml,
  /opt/tomcat/temp/37/227351448.xml,
  /opt/tomcat/temp/37/Item_16256980.xml,
  /opt/tomcat/temp/37/Item_16256981.xml,
  /opt/tomcat/temp/37/Item_16256982.xml,
  /opt/tomcat/temp/37/Item_16256983.xml,
  /opt/tomcat/temp/37/Item_16256984.xml,
  /opt/tomcat/temp/37/Sound_1.xml,
  /opt/tomcat/temp/37/Sound_2.xml,
  /opt/tomcat/temp/37/clip47546_edm_result.xml,
  /opt/tomcat/temp/37/clip50126_edm_result.xml,
  /opt/tomcat/temp/37/clip50127_edm_result.xml,
  /opt/tomcat/temp/37/clip50128_edm_result.xml,
  /opt/tomcat/temp/37/clip50129_edm_result.xml,
  /opt/tomcat/temp/37/clip50130_edm_result.xml,
  /opt/tomcat/temp/37/clip50131_edm_result.xml,
  /opt/tomcat/temp/37/clip50132_edm_result.xml,
  /opt/tomcat/temp/37/clip50133_edm_result.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-record/Metis_Sandbox/227351445.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-record/Metis_Sandbox/227351446.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-record/Metis_Sandbox/Item_16256979.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-record/Metis_Sandbox/Item_16256980.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-record/Metis_Sandbox/Item_16256981.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-record/Metis_Sandbox/Item_16256982.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-record/Metis_Sandbox/Item_16256983.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-record/Metis_Sandbox/Sound_2.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-record/Metis_Sandbox/clip47546_edm_result.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-record/Metis_Sandbox/clip50126_edm_result.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-record/Metis_Sandbox/clip50129_edm_result.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-record/Metis_Sandbox/clip50130_edm_result.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-record/Metis_Sandbox/clip50131_edm_result.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-record/Metis_Sandbox/clip50132_edm_result.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-record/Metis_Sandbox/clip50133_edm_result.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-records/Metis_Sandbox/227351442.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-records/Metis_Sandbox/227351446.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-records/Metis_Sandbox/227351447.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-records/Metis_Sandbox/227351448.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-records/Metis_Sandbox/Item_16256979.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-records/Metis_Sandbox/Item_16256984.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-records/Metis_Sandbox/clip7_edm_result.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-records/Metis_Sandbox/clip8_edm_result.xml]
  could not execute statement; SQL [n/a]; constraint [record_europeana_id_dataset_id_key];
    nested exception is org.hibernate.exception.ConstraintViolationException: could not execute statement
  Type: error
  Records: [
    /opt/tomcat/temp/37/227351443.xml,
  /opt/tomcat/temp/37/227351444.xml,
  /opt/tomcat/temp/37/227351449.xml,
  /opt/tomcat/temp/37/227351450.xml,
  /opt/tomcat/temp/37/227351451.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-record/Metis_Sandbox/227351443.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-record/Metis_Sandbox/227351444.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-record/Metis_Sandbox/227351449.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-record/Metis_Sandbox/227351450.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-record/Metis_Sandbox/227351451.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-records/Metis_Sandbox/227351443.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-records/Metis_Sandbox/227351444.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-records/Metis_Sandbox/227351449.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-records/Metis_Sandbox/227351450.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-records/Metis_Sandbox/227351451.xml]
  Schematron error: Invalid Rights Statements
  Type: error
  Records: [
    /opt/tomcat/temp/37/Sound_3.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-record/Metis_Sandbox/Sound_3.xml,
  /opt/tomcat/temp/37/dataset-with-corrupt-records/Metis_Sandbox/Sound_3.xml]
  net.sf.saxon.trans.XPathException: org.xml.sax.SAXParseException; lineNumber: 2; columnNumber: 6;
   The processing instruction target matching "[xX][mM][lL]" is not allowed.
  Type: error
  Records: [
    /opt/tomcat/temp/37/dataset-with-corrupt-records/Metis_Sandbox/Sound_1.xml]
  net.sf.saxon.trans.XPathException: org.xml.sax.SAXParseException; lineNumber: 2; columnNumber: 1; Content is not allowed in prolog.`;

export const stepErrorDetails = [
  stepErrorDetail,
  stepErrorDetail.replace(/temp\/37/g, 'temp/14').replace(/227351/g, ''),
  stepErrorDetail.replace(/temp\/37/g, 'temp/19').replace(/227351/g, '3')
];
