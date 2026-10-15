import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

/** Mirrors LoanApplicationController.LoanApplication in the ocphelloworld backend. */
export interface LoanApplication {
  id: number;
  applicantName: string;
  loanType: string;
  requestedAmount: number;
  status: string;
  submittedAt: string;
}

/** Mirrors LoanApplicationController.CreateLoanApplicationRequest. */
export interface CreateLoanApplicationRequest {
  applicantName: string;
  loanType: string;
  requestedAmount: number;
}

@Injectable({ providedIn: 'root' })
export class LoanApplicationService {
  private readonly http = inject(HttpClient);
  // Full backend URL in production builds; relative (proxied by proxy.conf.json) under ng serve.
  private readonly baseUrl = `${environment.apiBaseUrl}/api/loan-applications`;

  getAll(): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(this.baseUrl);
  }

  getById(id: number): Observable<LoanApplication> {
    return this.http.get<LoanApplication>(`${this.baseUrl}/${id}`);
  }

  submit(request: CreateLoanApplicationRequest): Observable<LoanApplication> {
    return this.http.post<LoanApplication>(this.baseUrl, request);
  }
}
