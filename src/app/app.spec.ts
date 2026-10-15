import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { App } from './app';
import { LoanApplication } from './loan-application.service';

// The component's members are protected; tests reach them through this shape.
interface TestableApp {
  form: FormGroup;
  lookupForm: FormGroup;
  submit(): void;
  lookup(): void;
}

const sample: LoanApplication = {
  id: 1,
  applicantName: 'Jane Doe',
  loanType: 'Home',
  requestedAmount: 250000,
  status: 'PENDING',
  submittedAt: '2026-10-15T10:00:00Z',
};

describe('App', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads and lists applications on start', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    http.expectOne('/api/loan-applications').flush([sample]);
    await fixture.whenStable();

    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Jane Doe');
  });

  it('submits a valid application and refreshes the list', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    http.expectOne('/api/loan-applications').flush([]);

    const component = fixture.componentInstance as unknown as TestableApp;
    component.form.setValue({ applicantName: 'Jane Doe', loanType: 'Home', requestedAmount: 250000 });
    component.submit();

    const post = http.expectOne({ method: 'POST', url: '/api/loan-applications' });
    expect(post.request.body).toEqual({
      applicantName: 'Jane Doe',
      loanType: 'Home',
      requestedAmount: 250000,
    });
    post.flush(sample);
    http.expectOne({ method: 'GET', url: '/api/loan-applications' }).flush([sample]);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Application #1 submitted');
  });

  it('does not submit an invalid application', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    http.expectOne('/api/loan-applications').flush([]);

    (fixture.componentInstance as unknown as TestableApp).submit();
    http.expectNone({ method: 'POST' });
  });

  it('shows a not-found message for an unknown ID', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    http.expectOne('/api/loan-applications').flush([]);

    const component = fixture.componentInstance as unknown as TestableApp;
    component.lookupForm.setValue({ id: 99 });
    component.lookup();
    http
      .expectOne('/api/loan-applications/99')
      .flush(null, { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No application found with ID 99.',
    );
  });
});
