import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExplorePageFrameComponent } from './explore-page-frame.component';

describe('ExplorePageFrameComponent', () => {
  let component: ExplorePageFrameComponent;
  let fixture: ComponentFixture<ExplorePageFrameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorePageFrameComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExplorePageFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
