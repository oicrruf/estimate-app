import { TestBed } from '@angular/core/testing';
import { Home } from './app';

describe('App', () => {
  it('renders a safe empty workspace', async () => {
    await TestBed.configureTestingModule({ imports: [Home] }).compileComponents();
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('h1')?.textContent).toContain('De una idea');
    expect(page.querySelector('.empty-state')?.textContent).toContain('Tu espacio comienza aquí');
  });
});
