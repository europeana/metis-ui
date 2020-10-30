import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ClioComponent } from '.';
import { MockClioService } from '../../_mocked';
import { ClioService } from '../../_services';

describe('ClioComponent', () => {
  const datasetId = '0';
  let clios: ClioService;
  let component: ClioComponent;
  let fixture: ComponentFixture<ClioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClioComponent],
      imports: [HttpClientTestingModule],
      providers: [{ provide: ClioService, useClass: MockClioService }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    clios = TestBed.inject(ClioService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClioComponent);
    component = fixture.componentInstance;
    component.datasetId = datasetId;
  });

  describe('Normal operation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should close', () => {
      component.isOpen = true;
      component.close();
      expect(component.isOpen).toBeFalsy();
    });

    it('should toggle', () => {
      component.isOpen = true;
      component.toggleVisible();
      expect(component.isOpen).toBeFalsy();
      component.toggleVisible();
      expect(component.isOpen).toBeTruthy();
    });

    it('should set the opener icon class', () => {
      expect(component.openerIconClass).toBeFalsy();

      const clioData1 = { score: 1, date: '' };
      const clioData3 = { score: 3, date: '' };

      let allClioData = [clioData1];
      component.setOpenerIconClass(allClioData);

      expect(component.openerIconClass).toBeTruthy();
      expect(component.openerIconClass).toEqual('clio-state-1');

      allClioData = [clioData1, clioData3];
      component.setOpenerIconClass(allClioData);

      expect(component.openerIconClass).toEqual('clio-state-2');
    });

    it('should load data on init', fakeAsync(() => {
      spyOn(component, 'loadData').and.callThrough();
      spyOn(clios, 'loadClioData').and.callThrough();
      component.ngOnInit();
      tick(1);
      fixture.detectChanges();
      expect(component.loadData).toHaveBeenCalled();
      expect(clios.loadClioData).toHaveBeenCalled();
      component.ngOnDestroy();
      tick(1);
    }));
  });
});
