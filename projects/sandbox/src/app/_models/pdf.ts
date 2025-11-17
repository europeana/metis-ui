export interface JSPDFType {
  html: (
    _: HTMLElement,
    __: {
      callback: (_: JSPDFType) => void;
      margin: Array<number>;
      autoPaging: string;
      x: number;
      y: number;
      width: number;
      windowWidth: number;
    }
  ) => void;
  addFont: (_: string, __: string, ___: string) => void;
  save: (_: string) => void;
  setFont: (_: string, __: string) => void;
  setFontSize: (_: number) => void;
  setPage: (_: number) => void;
  text: (_: string, __: number, ___: number) => void;
  internal: {
    pages: {
      length: number;
    };
    pageSize: {
      height: number;
      width: number;
    };
  };
}
