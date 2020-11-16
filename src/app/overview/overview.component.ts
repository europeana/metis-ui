import { AfterViewInit, Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { ExportAsService } from 'ngx-export-as';
import { Subject } from 'rxjs';

import {
  ColumnMode,
  DatatableRowDetailDirective,
  DatatableComponent
} from '@swimlane/ngx-datatable';
import { DataPollingComponent } from '../data-polling';

export type HeaderNameType = 'name' | 'count' | 'percent';

export interface FacetField {
  count: number;
  label: HeaderNameType;
}

export interface TableRow {
  name: HeaderNameType;
  count: string;
  percent: string;
}

export interface FmtTableData {
  columns: Array<string>;
  tableRows: Array<TableRow>;
}

export interface Facet {
  name: string;
  fields: Array<FacetField>;
}

export interface NameValue {
  name: string;
  value: number;
}

export interface RawFacet {
  facets: Array<Facet>;
}

export type ExportType = 'csv' | 'pdf' | 'png';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OverviewComponent extends DataPollingComponent implements AfterViewInit {
  @ViewChild('dataTable') dataTable: DatatableComponent;
  @ViewChild('downloadAnchor') downloadAnchor: ElementRef;

  chartTypes = ['Pie', 'Bar', 'Gauge'];
  columnNames = ['name', 'count', 'percent'].map((x) => x as HeaderNameType);
  exportTypes = ['csv', 'pdf', 'png'];

  facetConf = [
    'metadataTier',
    'COUNTRY',
    'TYPE',
    'RIGHTS',
    'DATA_PROVIDER',
    'PROVIDER'
  ];

  menuStates: { [key: string]: { visible: boolean; disabled: boolean } } = {};
  contentTiersConf = ['0', '1 OR 2 OR 3 OR 4'];
  contentTiersOptions = ['0', '1', '2', '3', '4'];

  colorScheme = {
    domain: [
      '#1676AA',
      '#37B98B',
      '#E11D53',
      '#7F3978',
      '#D43900',
      '#FFAE00',
      '#F22F24',
      '#D43900',
      '#E11D53',
      '#37B98B',
      '#4BC0F0',
      '#1676AA',
      '#7F3978'
    ]
  };

  ColumnMode = ColumnMode;

  pollRefresh: Subject<boolean>;

  form: FormGroup;

  chartOptionsOpen = false;
  downloadOptionsOpen = false;

  showPie = true;
  showBar = false;
  showGauge = false;
  showTab = true;
  isLoading = true;

  selFacetIndex = 0;
  disableZeros = false;

  allFacetData: Array<Facet>;
  chartData: Array<NameValue>;
  tableData: FmtTableData;

  constructor(
    private readonly http: HttpClient,
    private fb: FormBuilder,
    private exportAsService: ExportAsService
  ) {
    super();
    this.buildForm();
  }

  async download(data: string): Promise<void> {
    const url = window.URL.createObjectURL(new Blob([data], { type: 'text/csv;charset=utf-8' }));
    const link = this.downloadAnchor.nativeElement;

    link.href = url;
    link.download = 'data.csv';
    link.click();

    const fn = () => {
      window.URL.revokeObjectURL(url);
    };
    fn();
  }

  export(type: ExportType): false {
    this.downloadOptionsOpen = false;
    if (type === 'csv') {
      const items = this.tableData.tableRows;
      const replacer = (_: string, value: string) => (value === null ? '' : value);
      const header = this.columnNames;

      let csv = items.map((row: TableRow) => {
        let vals: Array<string> = header.map((fieldName: HeaderNameType) => {
          return JSON.stringify(row[fieldName], replacer);
        });
        return vals.join(',');
      });
      csv.unshift(header.join(','));
      this.download(csv.join('\r\n'));
    } else {
      this.exportAsService
        .save(
          {
            type: type,
            elementIdOrContent: 'dataTable'
          },
          'Europeana_Data_Export'
        )
        .subscribe(() => {});
    }
    return false;
  }

  /** ngOnInit
  /* - set up data polling
  */
  ngAfterViewInit(): void {
    this.pollRefresh = this.createNewDataPoller(
      60 * 100000,
      () => {
        this.isLoading = true;
        const apiSrv = 'https://api.europeana.eu/record/v2/search.json';
        const qry = this.getFormattedContentTierParam();
        const auth = '&wskey=api2demo';
        const profile = '&profile=facets';//&f.DEFAULT.facet.limit=500';
        const facetParam = this.getFormattedFacetParam();

        let theVal = this.form.value['filterContentTierCB'];
        const filterContentTierCBParam = Object.keys(theVal)
          .filter((key) => {
            return theVal[key];
          })
          .map((s: string) => {
            return `&qf=contentTier:(${encodeURIComponent(s)})`;
          })
          .join('');

        const filterParam = this.getFormattedFilterParam();
        const url = `${apiSrv}${qry}${auth}${profile}${facetParam}${filterParam}${filterContentTierCBParam}&rows=0`;
        return this.http.get<RawFacet>(url);
      },
      (rawResult: RawFacet) => {
        this.isLoading = false;
        this.selFacetIndex = this.findFacetIndex(this.form.value.facetParameter, rawResult.facets);


        this.facetConf.forEach((name: string) => {
          this.addCheckboxes(name, this.getSelectOptions(name, rawResult.facets));
        });

        this.allFacetData = rawResult.facets;

        // set pie and table data
        this.extractChartData();
        this.extractTableData();
      }
    ).getPollingSubject();
  }

  addCheckboxes(name: string, options: Array<string>): void {
    const checkboxes = <FormGroup>this.form.get(name);
    if(!this.menuStates[name]){
      this.menuStates[name] = { visible: false, disabled: this.form.value.facetParameter === name };
    }
    options.forEach((option: string) => {
      const fName = this.fixName(option);
      if(!this.form.get(name + '.' + fName)){
        checkboxes.addControl(fName, new FormControl(false));
      }
    });
  }

  /** buildForm
  /* - set upt data polling
  */
  buildForm(): void {
    this.form = this.fb.group({

      facetParameter: [this.facetConf[0]],
      contentTiers: [this.contentTiersConf[1]],

      filterContentTier: [''],

      filterContentTierCB: this.fb.group({}),

      metadataTier: this.fb.group({}),
      COUNTRY: this.fb.group({}),
      TYPE: this.fb.group({}),
      RIGHTS: this.fb.group({}),
      DATA_PROVIDER: this.fb.group({}),
      PROVIDER: this.fb.group({}),

      /*
      ...['filterCountry', 'filterType'].map((s: string) => {
        return {
          s: this.fb.group({})
        }
      }),
      */

      showPercent: [false],
      chartType: [this.chartTypes[0]]
    });

    this.menuStates['filterContentTierCB'] = { visible: false, disabled: this.form.value.facetParameter === 'filterContentTierCB' };
    this.addCheckboxes('filterContentTierCB', this.contentTiersOptions);
  }

  /** fixName
  /* - removes the dot character from a string
  */
  fixName(s: string):string {
    const res = s.replace(/\./g, '');
    return res;
  }

  findFacetIndex(facetName: string, facetData: Array<Facet>): number {
    return facetData.findIndex((f: Facet) => {
      return f.name === facetName;
    });
  }

  /** getSelectOptions
  /* returns array of values for a facet
  /* @param {string} facetName - the name of the facet
  */
  getSelectOptions(facetName: string, facetData: Array<Facet>): Array<string> {
    //if (this.allFacetData) {
    const matchIndex = this.findFacetIndex(facetName, facetData);
    return facetData[matchIndex].fields.map((ff: FacetField) => {
      return ff.label;
    });
  }

  /** getFormattedContentTierParam
  /* returns contentTier formatted as url parameters
  */
  getFormattedContentTierParam(): string {
    return `?query=contentTier:(${encodeURIComponent(this.form.value['contentTiers'])})`;
  }

  /** getFormattedFacetParam
  /* returns facets names formatted as url parameters
  */
  getFormattedFacetParam(): string {
    return this.facetConf
      .map((f) => {
        return `&facet=${encodeURIComponent(f)}`;
      })
      .join('');
  }

  /** getFormattedFilterParam
  /* returns facets filter names and values formatted as url parameters
  /* @param {string} def - the default return value
  */
  /*
  getFormattedFilterParam(def: string = ''): string {
    const offset = this.filterFormArray.controls.findIndex((control: AbstractControl) => {
      return control.disabled;
    });
    return (
      this.form.value.filterParams
        .map((val: string, i: number) => {
          if (val) {
            const facetIndex = i >= offset && offset > -1 ? i + 1 : i;
            const facetName = this.facetConf[facetIndex];
            return `${val}`
              .split(',')
              .map((value: string) => {
                return `&qf=${facetName}:"${encodeURIComponent(value)}"`;
              })
              .join('');
          } else {
            return null;
          }
        })
        .filter((s: string) => !!s)
        .join('') || def
    );
  }
  */

  /** getFormattedFilterParam
  /* returns concatentated filter names-value pairs formatted as url parameters
  /* @param {string} def - the default return value
  */
  getFormattedFilterParam(def: string = ''): string {
    return this.facetConf
    .filter((filterName: string) => {
      const state = this.menuStates[filterName];
      return state && !state.disabled;
    })
    .map((filterName: string) => {
      let checks = this.form.value[filterName];


      /*
      this.form.value.filterParams
        .map((val: string, i: number) => {
          if (val) {
            const facetIndex = i >= offset && offset > -1 ? i + 1 : i;
            const facetName = this.facetConf[facetIndex];
            return `${val}`
              .split(',')
              .map((value: string) => {
                return `&qf=${facetName}:"${encodeURIComponent(value)}"`;
              })

      */
      return Object.keys(checks)
        .filter((key) => {
          return checks[key];
        })
        .map((value: string) => {
          return `&qf=${filterName}:"${encodeURIComponent(value)}"`;
        })
        .join('');
    }).join('');
  }


  enableFilters(): void {
    //this.filterFormArray.controls.forEach((control) => {
    //  control.enable();
    //});
  }

  //disableFilter(i: number): void {
  //  this.enableFilters();
  //  this.form.get(`filterParams.${i}`)!.disable();
  //}

  switchFacet(disableName: string): void {
    //this.disableFilter(disableIndex);
    console.log('switchFacet(' + disableName + ')')
    this.menuStates[disableName]!.disabled = true;
    this.refresh();
  }

  refresh(disableIndex?: number): void {
    this.pollRefresh.next(true);
  }

  refreshCT(): void {
    const val = this.form.value['contentTiers'];
    console.log('refreshCT ' + val);
    if (val === this.contentTiersConf[0]) {
      this.disableZeros = true;
    } else {
      this.disableZeros = false;
    }
    this.refresh();
  }

  selectOptionEnabled(val: string): boolean {
    return !(this.disableZeros && val === '0');
  }

  toggleExpandRow(row: DatatableRowDetailDirective): false {
    this.dataTable.rowDetail.toggleExpandRow(row);
    return false;
  }

  getCountTotal(facetData: Array<FacetField>): number {
    let total = 0;
    facetData.forEach((f: FacetField) => {
      total += f.count;
    });
    return total;
  }

  extractChartData(): void {
    const facetFields = this.allFacetData[this.selFacetIndex].fields;
    const total = this.getCountTotal(facetFields);

    this.chartData = facetFields.map((f: FacetField) => {
      const val = this.form.value.showPercent
        ? parseFloat(((f.count / total) * 100).toFixed(2))
        : f.count;
      return {
        name: f.label,
        value: val
      };
    });
  }

  toggleFilterMenu(filterName: string): void {
    //this.menuVisibilities[filterName] = !this.menuVisibilities[filterName];
    this.menuStates[filterName].visible = !this.menuStates[filterName].visible;
  }

  toggleChartOptions(): void {
    this.onClickedOutside();
    this.chartOptionsOpen = !this.chartOptionsOpen;
  }

  toggleDownloadOptions(): void {
    this.onClickedOutside();
    this.downloadOptionsOpen = !this.downloadOptionsOpen;
  }

  onClickedOutside(): void {
    this.chartOptionsOpen = false;
    this.downloadOptionsOpen = false;
  }

  switchChartType(): void {
    if (this.form.value.chartType === 'Bar') {
      this.showPie = false;
      this.showBar = true;
      this.showGauge = false;
    } else if (this.form.value.chartType === 'Gauge') {
      this.showPie = false;
      this.showBar = false;
      this.showGauge = true;
    } else if (this.form.value.chartType === 'Pie') {
      this.showPie = true;
      this.showBar = false;
      this.showGauge = false;
    }
  }

  /* extractTableData
  /*
  /* - maps array of FacetField objects to TableRow data
  /* - calculates percentage
  /* returns converted data wrapped in a FmtTableData object
  /*
  /* @param
  */
  extractTableData(): void {
    const facetData = this.allFacetData[this.selFacetIndex].fields;
    const total = this.getCountTotal(facetData);

    this.tableData = {
      columns: this.columnNames,
      tableRows: facetData.map((f: FacetField) => {
        return {
          name: f.label,
          count: `${f.count}`,
          percent: `${((f.count / total) * 100).toFixed(2)}%`
        } as TableRow;
      })
    };
  }
}
