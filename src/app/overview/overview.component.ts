import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { Subject } from 'rxjs';

import {
  ColumnMode,
  DatatableRowDetailDirective,
  DatatableComponent
} from '@swimlane/ngx-datatable';
import { DataPollingComponent } from '../data-polling';

export interface FacetField {
  count: number;
  label: string;
}

export interface TableRow {
  name: string;
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

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OverviewComponent extends DataPollingComponent implements AfterViewInit {
  @ViewChild('dataTable') dataTable: DatatableComponent;

  facetConf = [
    'contentTier',
    'metadataTier',
    'COUNTRY',
    'LANGUAGE',
    'TYPE',
    'RIGHTS',
    'DATA_PROVIDER',
    'PROVIDER'
  ];

  chartTypes = ['Pie', 'Bar', 'Gauge'];

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
  showPie = true;
  showBar = false;
  showGauge = false;
  showTab = true;
  isLoading = true;

  selFacetIndex = 0;

  allFacetData: Array<Facet>;
  chartData: Array<NameValue>;
  tableData: FmtTableData;

  constructor(private readonly http: HttpClient, private fb: FormBuilder) {
    super();
    this.buildForm();
  }

  /** ngOnInit
  /* - set up data polling
  */
  ngAfterViewInit(): void {
    this.pollRefresh = this.createNewDataPoller(
      60 * 1000,
      () => {
        this.isLoading = true;
        const apiSrv = 'https://api.europeana.eu/record/v2/search.json';
        const qry = '?query=*&rows=0';
        const auth = '&wskey=api2demo';
        const profile = '&profile=facets';
        const facetParam = this.getFormattedFacetParam();
        const filterParam = this.getFormattedFilterParam();
        const url = `${apiSrv}${qry}${auth}${profile}${facetParam}${filterParam}`;
        return this.http.get<RawFacet>(url);
      },
      (rawResult: RawFacet) => {
        this.isLoading = false;
        this.allFacetData = rawResult.facets;
        this.selFacetIndex = this.findFacetIndex(this.form.value.facetParameter);

        // set pie and table data
        this.extractChartData();
        this.extractTableData();
      }
    ).getPollingSubject();
  }

  /** buildForm
  /* - set upt data polling
  */
  buildForm(): void {
    const defaultFacetIndex = 0;
    this.form = this.fb.group({
      filterParams: new FormArray([]),
      facetParameter: [this.facetConf[defaultFacetIndex]],
      showPercent: [false],
      chartType: [this.chartTypes[0]]
    });
    this.facetConf.forEach((_, i) => {
      this.filterFormArray.push(new FormControl({ value: '', disabled: i === defaultFacetIndex }));
    });
  }

  findFacetIndex(facetName: string): number {
    return this.allFacetData.findIndex((f: Facet) => {
      return f.name === facetName;
    });
  }

  /** getSelectOptions
  /* returns array of values for a facet
  /* @param {string} facetName - the name of the facet
  */
  getSelectOptions(facetName: string): Array<string> {
    if (this.allFacetData) {
      const matchIndex = this.findFacetIndex(facetName);
      return this.allFacetData[matchIndex].fields.map((ff: FacetField) => {
        return ff.label;
      });
    }
    return [];
  }

  /** filterFormArray
  /* getter - casts filterParams controls as a FormArray
  */
  get filterFormArray() {
    return this.form.controls.filterParams as FormArray;
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
            return `&qf=${facetName}:"${encodeURIComponent(val)}"`;
          } else {
            return null;
          }
        })
        .filter((s: string) => !!s)
        .join('') || def
    );
  }

  enableFilters(): void {
    this.filterFormArray.controls.forEach((control) => {
      control.enable();
    });
  }

  disableFilter(i: number): void {
    this.enableFilters();
    this.form.get(`filterParams.${i}`)!.disable();
  }

  refresh(disableIndex?: number): void {
    if (disableIndex !== undefined) {
      this.disableFilter(disableIndex);
    }
    this.pollRefresh.next(true);
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

  toggleChartOptions(): void {
    this.chartOptionsOpen = !this.chartOptionsOpen;
  }

  onClickedOutside(): void {
    this.chartOptionsOpen = false;
  }

  chrtPct(): void {
    this.extractChartData();
  }

  switchChartType(): void {
    if (this.form.value.chartType === 'Bar') {
      this.showPie = false;
      this.showBar = true;
      this.showGauge = false;
      console.log('match bar ');
    } else if (this.form.value.chartType === 'Gauge') {
      this.showPie = false;
      this.showBar = false;
      this.showGauge = true;

      console.log('match g');
    } else if (this.form.value.chartType === 'Pie') {
      this.showPie = true;
      this.showBar = false;
      this.showGauge = false;

      console.log('match pi ');
    }
    console.log(this.form.value.chartType);
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
      columns: ['name', 'count', 'percent'],
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
