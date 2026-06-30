import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileUploadComponent } from './file-upload.component';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileUploadComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize with default states', () => {
    expect(component).toBeTruthy();
    expect(component.selectedFileName()).toBe('');
    expect(component.disabled()).toBe(false);
  });

  it('should synchronize name on writeValue', () => {
    const mockFile = new File([''], 'dataset.zip');

    component.writeValue(mockFile);

    expect(component.selectedFileName()).toBe('dataset.zip');
  });

  it('should reset clean via clearFileValue', () => {
    const mockOnChange = vi.fn();
    component.registerOnChange(mockOnChange);
    component.selectedFileName.set('old-file.zip');

    component.clearFileValue();

    expect(component.selectedFileName()).toBe('');
    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  it('should push standard event payload downstream on file input selections', () => {
    const mockOnChange = vi.fn();
    const mockOnTouched = vi.fn();
    component.registerOnChange(mockOnChange);
    component.registerOnTouched(mockOnTouched);

    const mockFile = new File([''], 'upload-me.zip');
    const mockEvent = ({
      target: {
        files: {
          item: () => mockFile,
          length: 1
        }
      }
    } as unknown) as Event;

    component.emitFiles(mockEvent);

    expect(component.selectedFileName()).toBe('upload-me.zip');
    expect(mockOnChange).toHaveBeenCalledWith(mockFile);
    expect(mockOnTouched).toHaveBeenCalled();
  });
});
