import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoanApplication, LoanApplicationService } from './loan-application.service';

@Component({
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly service = inject(LoanApplicationService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly loanTypes = ['Personal', 'Home', 'Auto', 'Education', 'Business'];

  protected readonly applications = signal<LoanApplication[]>([]);
  protected readonly loading = signal(false);
  protected readonly listError = signal<string | null>(null);

  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly lastSubmitted = signal<LoanApplication | null>(null);

  protected readonly found = signal<LoanApplication | null>(null);
  protected readonly lookupError = signal<string | null>(null);

  protected readonly form = this.fb.group({
    applicantName: ['', [Validators.required, Validators.pattern(/\S/)]],
    loanType: ['', Validators.required],
    requestedAmount: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0.01),
    ]),
  });

  protected readonly lookupForm = this.fb.group({
    id: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
  });

  ngOnInit(): void {
    this.refresh();
  }

  protected refresh(): void {
    this.loading.set(true);
    this.listError.set(null);
    this.service.getAll().subscribe({
      next: (apps) => {
        this.applications.set(apps);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.listError.set(describeError(err));
        this.loading.set(false);
      },
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { applicantName, loanType, requestedAmount } = this.form.getRawValue();
    this.submitting.set(true);
    this.submitError.set(null);
    this.service
      .submit({ applicantName, loanType, requestedAmount: requestedAmount! })
      .subscribe({
        next: (created) => {
          this.lastSubmitted.set(created);
          this.submitting.set(false);
          this.form.reset();
          this.refresh();
        },
        error: (err: HttpErrorResponse) => {
          this.submitError.set(describeError(err));
          this.submitting.set(false);
        },
      });
  }

  protected lookup(): void {
    if (this.lookupForm.invalid) {
      this.lookupForm.markAllAsTouched();
      return;
    }
    this.found.set(null);
    this.lookupError.set(null);
    const id = this.lookupForm.getRawValue().id!;
    this.service.getById(id).subscribe({
      next: (app) => this.found.set(app),
      error: (err: HttpErrorResponse) =>
        this.lookupError.set(
          err.status === 404 ? `No application found with ID ${id}.` : describeError(err),
        ),
    });
  }
}

function describeError(err: HttpErrorResponse): string {
  if (err.status === 0) {
    return 'Cannot reach the loan service. Check that the backend is running.';
  }
  if (err.status === 400) {
    return 'The service rejected the request. Check the fields and try again.';
  }
  return `Request failed (${err.status} ${err.statusText}).`;
}
