import { FormatDcFieldPipe } from '.';
import { DebiasSourceField } from '../_models';

describe('FormatDcFieldPipe', () => {
  it('should transform', () => {
    const pipe = new FormatDcFieldPipe();
    expect(pipe.transform('hello')).toEqual('hello');
    expect(pipe.transform(DebiasSourceField.DC_TITLE)).toEqual('dc:title');
    expect(pipe.transform(DebiasSourceField.DC_DESCRIPTION)).toEqual('dc:description');
    expect(pipe.transform(DebiasSourceField.DC_TYPE_LITERAL)).toEqual('dc:type literal');
    expect(pipe.transform(DebiasSourceField.DC_TYPE_REFERENCE)).toEqual('dc:type reference');
    expect(pipe.transform(DebiasSourceField.DC_SUBJECT_LITERAL)).toEqual('dc:subject literal');
    expect(pipe.transform(DebiasSourceField.DC_SUBJECT_REFERENCE)).toEqual('dc:subject reference');
    expect(pipe.transform(DebiasSourceField.DCTERMS_ALTERNATIVE)).toEqual('dc:terms alternative');
  });
});
