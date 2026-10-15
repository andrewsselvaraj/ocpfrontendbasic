# Loan Management Frontend

An Angular 22 frontend for the [Loan Management System](https://github.com/andrewsselvaraj/ocphelloworld) Spring Boot service. Use it to submit loan applications, list them, and look one up by ID.

The app calls the backend only through relative `/api/...` URLs. Locally, the Angular dev server proxies those calls; on OpenShift, nginx does. The backend therefore needs no CORS configuration.

## Run locally

Requires Node.js 22+ and the backend running on `http://localhost:8080` (`mvn spring-boot:run` in `ocphelloworld`).

```text
npm install
npm start
```

Open `http://localhost:4200`. [proxy.conf.json](proxy.conf.json) forwards `/api` to port 8080. Change the `target` there if the backend runs elsewhere.

Other commands:

- `npm test`: run the unit tests (Vitest).
- `npm run build`: production build into `dist/loan-management-frontend/browser`.

## Backend API used

| UI action | Request |
| --- | --- |
| Submit application | `POST /api/loan-applications` with `applicantName`, `loanType`, `requestedAmount` (> 0) |
| Applications table | `GET /api/loan-applications` |
| Find by ID | `GET /api/loan-applications/{id}` (`404` shows "not found") |

The backend keeps applications in memory, so they disappear when it restarts.

## Deploy to OpenShift (Developer Sandbox)

Deploy the backend first (see the `ocphelloworld` README) into the **same project**. The frontend's nginx proxies `/api/` to the backend Service `loan-management-system:8080` (see [nginx/api-proxy.conf](nginx/api-proxy.conf)). nginx resolves that name at startup, so the pod will not start until the backend Service exists.

The image is built inside the cluster from this GitHub repo using the multi-stage [Dockerfile](Dockerfile) (UBI Node.js 24 for the build, UBI nginx for the runtime). Push your changes to `main` first.

```text
oc apply -f openshift/build.yaml
oc logs -f bc/loan-management-frontend
oc apply -f openshift/deployment.yaml -f openshift/service.yaml -f openshift/route.yaml
oc rollout status deploy/loan-management-frontend
oc get route loan-management-frontend -o jsonpath='https://{.spec.host}{"\n"}'
```

To rebuild after pushing new commits, run `oc start-build loan-management-frontend --follow`. To build from your local working copy instead, run `oc start-build loan-management-frontend --from-dir=. --follow`.
