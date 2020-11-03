import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { Subject } from 'rxjs';

import { ColumnMode, DatatableRowDetailDirective } from '@swimlane/ngx-datatable';
import { DataPollingComponent } from '../data-polling';

export interface FacetField {
  count: number;
  label: string;
}

export interface FmtTableData {
  columns: Array<string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tableRows: Array<any>;
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
  @ViewChild('dataTable') dataTable: any;

  optionData: Array<Facet>;
  apiData: Facet;
  pieData: Array<NameValue>;

  // options
  gradient = true;
  showLegend = false;
  showLabels = true;
  isDoughnut = false;
  legendPosition = 'below';

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tableRows: Array<any>;
  columns: Array<any>;

  pollRefresh: Subject<boolean>;
  filters: Array<string>;

  form: FormGroup;
  facetConf = ['contentTier', 'COUNTRY', 'LANGUAGE', 'TYPE', 'RIGHTS', 'DATA_PROVIDER', 'PROVIDER'];

  constructor(private readonly http: HttpClient, private fb: FormBuilder) {
    super();
    this.buildForm();
  }

  buildForm(): void {
    this.form = this.fb.group({
      filterParams: new FormArray([]),
      facetParameter: ['']
    });

    this.facetConf.forEach(() => {
      this.filterFormArray.push(new FormControl(false));
    });
  }

  /** ngOnInit
  /* - poll the data
  */
  ngAfterViewInit(): void {
    this.pollRefresh = this.createNewDataPoller(
      50000,
      () => {

        // TODO: getFacetParam should be all params (including content / metadata tiers) if none are selected
        //       - this will populate the selects
        const facetParam = this.getFacetParam();
        const filterParam = this.getSelectedFilters();

        const apiSrv = 'https://api.europeana.eu/record/v2/search.json';
        const tier = '?query=*';
        //const tier = '?query=contentTier:0';
        const auth = '&wskey=api2demo';
        const profile = '&profile=facets';
        const url = `${apiSrv}${tier}${profile}${facetParam}${filterParam}&rows=0${auth}`;

        console.log('go get:\n\t' + url);

        return this.http.get<RawFacet>(url);
      },
      (rawResult: RawFacet) => {
        const result = rawResult.facets[0];

        // set pie data
        this.pieData = this.pieDataFromFacetData(result.fields);

        // set table data
        const fmtTableData = this.tableDataFromFacetData(result.fields);
        this.columns = fmtTableData.columns;
        this.tableRows = fmtTableData.tableRows;

        // set debug data
        this.apiData = result;

        if (!this.optionData) {
          this.optionData = rawResult.facets;
        }
      }
    ).getPollingSubject();
  }

  selectData(name: string): Array<string> {
    let res: Array<string> = [];
    if (this.optionData) {
      let match = this.optionData.filter((f: Facet) => {
        return f.name === name;
      });
      if (match.length > 0) {
        res = match[0].fields.map((ff: FacetField) => {
          return ff.label;
        });
      }
    }
    return res;
  }

  get filterFormArray() {
    return this.form.controls.filterParams as FormArray;
  }

  getFacetParam(): string {
    const facetParam = encodeURIComponent(this.form.value.facetParameter);
    return `&facet=${facetParam}`;
  }

  getSelectedFilters(): string {
    return this.form.value.filterParams
      .map((val: string, i: number) => {
        return val ? `&qf=${this.facetConf[i]}:"${encodeURIComponent(val)}"` : null;
      })
      .filter((f: string) => !!f)
      .join('');
  }

  refresh(): void {
    this.pollRefresh.next(true);
  }

  toggleExpandRow(row: DatatableRowDetailDirective): false {
    this.dataTable.rowDetail.toggleExpandRow(row);
    return false;
  }

  pieDataFromFacetData(apiData: Array<FacetField>): Array<NameValue> {
    return apiData.map((f: FacetField) => {
      return {
        name: f.label,
        value: f.count
      };
    });
  }

  tableDataFromFacetData(apiData: Array<FacetField>): FmtTableData {
    const cols = ['name', 'count'];
    const rows = apiData.map((f: FacetField) => {
      return {
        name: f.label,
        count: `${f.count}`
      };
    });
    return {
      columns: cols,
      tableRows: rows
    };
  }
}
