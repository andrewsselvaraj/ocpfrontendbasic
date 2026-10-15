// Production build (OpenShift): the browser calls the backend route directly.
// The backend must allow CORS from the frontend route's origin.
export const environment = {
  apiBaseUrl: 'https://loan-management-system-andrew-india-dev.apps.rm1.0a51.p1.openshiftapps.com',
};
