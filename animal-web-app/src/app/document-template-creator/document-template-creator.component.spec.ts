import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentTemplateCreatorComponent } from './document-template-creator.component';

describe('DocumentTemplateCreatorComponent', () => {
  let component: DocumentTemplateCreatorComponent;
  let fixture: ComponentFixture<DocumentTemplateCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentTemplateCreatorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DocumentTemplateCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
