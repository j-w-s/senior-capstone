import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreCreatePostComponent } from './explore-create-post.component';

describe('ExploreCreatePostComponent', () => {
  let component: ExploreCreatePostComponent;
  let fixture: ComponentFixture<ExploreCreatePostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExploreCreatePostComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExploreCreatePostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
