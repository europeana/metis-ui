import { ComponentFixture, TestBed } from '@angular/core/testing';
import { apiSettings } from '../../../environments/apisettings';
import { createMockPipe, mockDataset, mockHarvestData, MockTranslateService } from '../../_mocked';
import { DatasetDepublicationStatus, HarvestData } from '../../_models';
import { TranslatePipe, TranslateService } from '../../_translate';

import { GeneralinfoComponent } from '.';

describe('GeneralinfoComponent', () => {
  let component: GeneralinfoComponent;
  let fixture: ComponentFixture<GeneralinfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GeneralinfoComponent],
      providers: [
        {
          provide: TranslatePipe,
          useValue: createMockPipe('translate')
        },
        {
          provide: TranslateService,
          useClass: MockTranslateService
        }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(GeneralinfoComponent);
    component = fixture.componentInstance;
    component.datasetData = mockDataset;
    fixture.detectChanges();
  });

  const getEmptyHarvestData = (): HarvestData => {
    return ({} as unknown) as HarvestData;
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute the displayNumberOfItemsPublished', () => {
    expect(component.displayNumberOfItemsPublished).toBeFalsy();
    expect(mockHarvestData.lastPublishedRecords).toEqual(842);

    component.harvestPublicationData = mockHarvestData;

    expect(component.lastPublishedRecords).toEqual(842);
    expect(component.displayNumberOfItemsPublished).toEqual(842);

    let newData = { ...mockHarvestData, totalPublishedRecords: 10 };
    component.harvestPublicationData = newData;
    expect(component.displayNumberOfItemsPublished).toEqual(10);

    newData = { ...mockHarvestData, totalPublishedRecords: -1 };
    component.harvestPublicationData = newData;
    expect(component.displayNumberOfItemsPublished).toEqual(842);
  });

  it('should try to find publication data', () => {
    component.harvestPublicationData = mockHarvestData;
    fixture.detectChanges();
    expect(component.harvestPublicationData).toBe(mockHarvestData);
    expect(component.lastPublishedRecords).toBe(842);
    expect(component.lastPublishedDate).toBe('2018-03-30T13:53:04.762Z');
    expect(component.viewPreview).toBe(apiSettings.viewPreview + '1_*');
    expect(component.buttonClassPreview).toBe('');
    expect(component.viewCollections).toBe(apiSettings.viewCollections + '1_*');
    expect(component.buttonClassCollections).toBe('');
    expect(component.buttonClassPreview).toBe('');
  });

  it('should set disabled classes according to data', () => {
    const data = getEmptyHarvestData();
    (data.lastPreviewRecordsReadyForViewing = true),
      (data.lastPublishedRecordsReadyForViewing = true);
    component.harvestPublicationData = data;
    fixture.detectChanges();
    expect(component.buttonClassPreview).not.toBe(component.disabledBtnClass);

    (data.lastPreviewRecordsReadyForViewing = false),
      (data.lastPublishedRecordsReadyForViewing = false);
    component.harvestPublicationData = data;
    fixture.detectChanges();
    expect(component.buttonClassPreview).toBe(component.disabledBtnClass);
  });

  it('should set the current depublication status message', () => {
    component.harvestPublicationData = (undefined as unknown) as HarvestData;
    fixture.detectChanges();
    expect(component.currentDepublicationStatusMessage).toBeFalsy();

    const data = getEmptyHarvestData();
    data.publicationStatus = DatasetDepublicationStatus.DEPUBLISHED;
    component.harvestPublicationData = data;
    fixture.detectChanges();
    expect(component.currentDepublicationStatusMessage).toEqual('depublished');

    data.publicationStatus = DatasetDepublicationStatus.PUBLISHED;
    component.harvestPublicationData = data;
    fixture.detectChanges();
    expect(component.currentDepublicationStatusMessage).toEqual('published');
  });
});
