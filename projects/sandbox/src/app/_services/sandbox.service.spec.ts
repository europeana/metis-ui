import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';
import { MockHttp } from '@shared';
import { apiSettings } from '../../environments/apisettings';
import { testDatasetInfo } from '../_mocked';
import { SandboxService } from '.';

describe('sandbox service', () => {
  let mockHttp: MockHttp;
  let service: SandboxService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [SandboxService],
      imports: [HttpClientTestingModule]
    }).compileComponents();
    mockHttp = new MockHttp(TestBed.inject(HttpTestingController), apiSettings.apiHost);
    service = TestBed.inject(SandboxService);
  }));

  afterEach(() => {
    mockHttp.verify();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should get the progress', () => {
    const sub = service.requestProgress('1').subscribe((datasetInfo) => {
      expect(datasetInfo).toEqual(testDatasetInfo[0]);
    });
    mockHttp.expect('GET', '/dataset/1').send(testDatasetInfo[0]);
    sub.unsubscribe();
  });

  /*
  it('should submit new datasets', fakeAsync(() => {
    const datasetName = 'Andy';
    const country = 'uk';
    const language = 'en';


    let blob = new Blob([""], { type: 'application/zip'});
//blob["lastModifiedDate"] = "";
//blob["name"] = "file.zip";

let fakeF = <File>blob;

    const sub = service.submitDataset(datasetName, country, language, 'x', fakeF ).subscribe(() => {
      //expect(datasetInfo).toEqual(testDatasetInfo[0]);
    });

    mockHttp.expect('POST', `/dataset/${datasetName}/process?country=${country}&language=${language}&clientFilename=undefined&mimeType=application/zip`).send({});
    tick(1);
    sub.unsubscribe();

  }));
  */
});
