import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createMockPipe } from 'shared';
import { apiSettings } from '../../../environments/apisettings';
import { mockDataset, mockHarvestData, MockTranslateService } from '../../_mocked';
import { DatasetDepublicationStatus, HarvestData } from '../../_models';
import { TranslatePipe, TranslateService } from '../../_translate';

import { GeneralinfoComponent } from '.';

describe('GeneralinfoComponent', () => {
  let component: GeneralinfoComponent;
  let fixture: ComponentFixture<GeneralinfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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

    fixture.componentRef.setInput('datasetData', mockDataset);
    fixture.detectChanges();
  });

  const getEmptyHarvestData = (): HarvestData => {
    return ({} as unknown) as HarvestData;
  };

  it('should create', () => {
    TestBed.flushEffects();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should compute the displayNumberOfItemsPublished', () => {
    expect(component.displayNumberOfItemsPublished()).toBeFalsy();
    expect(mockHarvestData.lastPublishedRecords).toEqual(842);

    fixture.componentRef.setInput('harvestPublicationData', mockHarvestData);
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(component.lastPublishedRecords()).toEqual(842);
    expect(component.displayNumberOfItemsPublished()).toEqual(842);

    let newData = { ...mockHarvestData, totalPublishedRecords: 10 };
    fixture.componentRef.setInput('harvestPublicationData', newData);
    TestBed.flushEffects();
    fixture.detectChanges();
    expect(component.displayNumberOfItemsPublished()).toEqual(10);

    newData = { ...mockHarvestData, totalPublishedRecords: -1 };
    fixture.componentRef.setInput('harvestPublicationData', newData);
    TestBed.flushEffects();
    fixture.detectChanges();
    expect(component.displayNumberOfItemsPublished()).toEqual(842);
  });

  it('should try to find publication data', () => {
    fixture.componentRef.setInput('harvestPublicationData', mockHarvestData);
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(component.harvestPublicationData()).toBe(mockHarvestData);
    expect(component.lastPublishedRecords()).toBe(842);
    expect(component.lastPublishedDate()).toBe('2018-03-30T13:53:04.762Z');
    expect(component.viewPreview()).toBe(apiSettings.viewPreview + '1_*');
    expect(component.buttonClassPreview()).toBe('');
    expect(component.viewCollections()).toBe(apiSettings.viewCollections + '1_*');
    expect(component.buttonClassCollections()).toBe('');
    expect(component.buttonClassPreview()).toBe('');
  });

  it('should set disabled classes according to data', () => {
    const data = getEmptyHarvestData();
    data.lastPreviewRecordsReadyForViewing = true;
    data.lastPublishedRecordsReadyForViewing = true;

    fixture.componentRef.setInput('harvestPublicationData', data);
    TestBed.flushEffects();
    fixture.detectChanges();
    expect(component.buttonClassPreview()).not.toBe('is-disabled');

    const disabledData = getEmptyHarvestData();
    disabledData.lastPreviewRecordsReadyForViewing = false;
    disabledData.lastPublishedRecordsReadyForViewing = false;

    fixture.componentRef.setInput('harvestPublicationData', disabledData);
    TestBed.flushEffects();
    fixture.detectChanges();
    expect(component.buttonClassPreview()).toBe('is-disabled');
  });

  it('should set the current depublication status message', () => {
    fixture.componentRef.setInput('harvestPublicationData', undefined);
    TestBed.flushEffects();
    fixture.detectChanges();
    expect(component.currentDepublicationStatusMessage()).toBeFalsy();

    const data = getEmptyHarvestData();
    data.publicationStatus = DatasetDepublicationStatus.DEPUBLISHED;
    fixture.componentRef.setInput('harvestPublicationData', data);
    TestBed.flushEffects();
    fixture.detectChanges();
    expect(component.currentDepublicationStatusMessage()).toEqual('depublished');

    const dataPublished = getEmptyHarvestData();
    dataPublished.publicationStatus = DatasetDepublicationStatus.PUBLISHED;
    fixture.componentRef.setInput('harvestPublicationData', dataPublished);
    TestBed.flushEffects();
    fixture.detectChanges();
    expect(component.currentDepublicationStatusMessage()).toEqual('published');
  });
});
