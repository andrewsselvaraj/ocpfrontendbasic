import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

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
  // Relative URL: proxied to the backend by proxy.conf.json (ng serve) or nginx (container).
  private readonly baseUrl = '/api/loan-applications';

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
