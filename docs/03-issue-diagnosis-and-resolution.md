# 3. Issue Diagnosis, Research, Resolution, and Sharing

[Back to documentation index](README.md)

This journal records major problems encountered during implementation and deployment. Each entry distinguishes the expected result, observed result, environment, diagnosis, research, resolution, and verification.

## Research and sharing rules

- Prefer primary documentation from React, Vite, Python, Git, GitHub, Microsoft, and Azure.
- Use search, forums, videos, or AI tools to form a hypothesis—not as proof that a change worked.
- Verify every proposed fix with an automated test, production build, repeatable command, or live smoke test.
- Remove tokens, passwords, connection strings, tenant details, and personal data before sharing logs.
- Record the first meaningful error and its timestamp. Avoid screenshots that expose secrets or account identifiers.
- ChatGPT/Codex was used to interpret logs, compare configurations, prepare patches, and structure runbooks. Final acceptance came from builds, tests, Git history, GitHub Actions, Azure revision health, and live browser/API checks.

## Issue 1 — React workspace rendered blank

**Description:** The enhanced workspace loaded a blank page. The browser reported exceptions such as `Cannot read properties of null (reading 'length')`, `filter`, and `totalCustomers`.

- **Expected:** Every tab renders while API data is loading or when a collection is empty.
- **Actual:** `PlatformView` crashed before rendering.
- **Environment:** React development build through Vite; Flask API returning some nullable fields.
- **Reproduction:** Start both services, open the workspace, select a platform tab, and inspect the console.
- **Diagnosis:** Rendering code treated all API collections as arrays and the dashboard as a populated object. A `null` response crossed the API boundary and caused an uncaught dereference.
- **Research:** [React error boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) and JavaScript defensive data normalization patterns.
- **Resolution:** Normalize every API response at load time (`Array.isArray(value) ? value : []`, `dashboard || {}`), give state a complete initial shape, and keep rendering guarded while loading.
- **Verification:** Console exceptions stopped; all navigation tabs rendered; React production build passed.

**Prevention:** Add a top-level error boundary and schema validation at the API client boundary. Add React tests for null, empty, loading, and error states.

## Issue 2 — PowerShell edited the wrong path

**Description:** A scripted edit attempted `frontend/frontend/src/App.jsx`; `$content` was null and `.Replace()` failed.

- **Expected:** Modify `frontend/src/App.jsx` once.
- **Actual:** `Get-Content` read a nonexistent path, followed by a null-value exception and `Set-Content` directory error.
- **Environment:** Windows PowerShell while the current directory was already `frontend`.
- **Reproduction:** From `frontend`, set `$path = '.\frontend\src\App.jsx'` and read it.
- **Diagnosis:** The command assumed repository root even though the shell had already changed directories.
- **Research:** [PowerShell Get-Content](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/get-content) and `Get-Location`/`Test-Path` behavior.
- **Resolution:** Use `$path = '.\src\App.jsx'`, confirm `Test-Path $path`, then read and modify. Prefer Git patches for repeatable changes.
- **Verification:** `Select-String` found the expected replacement in the correct file; build completed.

**Prevention:** Begin every command block with `Get-Location`, check `Test-Path`, and avoid carrying shell variables between unrelated attempts.

## Issue 3 — `npm.ps1` blocked by execution policy

**Description:** `npm install` failed because PowerShell script execution was disabled.

- **Expected:** npm installs frontend dependencies.
- **Actual:** PowerShell rejected `C:\Program Files\nodejs\npm.ps1`.
- **Environment:** Windows PowerShell with a restrictive execution policy.
- **Reproduction:** Run `npm install` in the frontend directory on the affected machine.
- **Diagnosis:** PowerShell selected the `.ps1` wrapper; policy prevented it from running. Node/npm itself was correctly installed.
- **Research:** [PowerShell execution policies](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies) and npm's Windows command wrappers.
- **Resolution:** Run `npm.cmd install` and `npm.cmd run build`. This avoided a system-wide security-policy change.
- **Verification:** Dependencies audited successfully and Vite built the production bundle.

## Issue 4 — Patch no longer applied

**Description:** `git apply --check` failed at `frontend/src/App.jsx` after several manual edits.

- **Expected:** Apply the CRM/workspace patch cleanly.
- **Actual:** Patch context did not match the modified file.
- **Environment:** Git feature branch with uncommitted changes.
- **Reproduction:** Change the lines used as patch context, then run `git apply --check patch-name.patch`.
- **Diagnosis:** The patch was generated against an earlier file state.
- **Research:** [Git apply documentation](https://git-scm.com/docs/git-apply) and patch context behavior.
- **Resolution:** Inspect the failing hunk, restore the expected context or regenerate the patch against the current branch, run `git apply --check`, then apply once.
- **Verification:** Git reported the expected changed files; automated tests and production build passed.

**Prevention:** Commit small milestones, generate patches from the exact target base, and never apply the same mail patch twice.

## Issue 5 — Azure CLI login blocked or used the wrong account

**Description:** The CLI was initially unavailable in PowerShell, then Azure login hit Northwestern conditional-access/MFA restrictions or an account without the required subscription.

- **Expected:** Authenticate to the Azure for Students subscription containing Photos by Greg.
- **Actual:** `az` was not found, or login reported interaction required/no subscription.
- **Environment:** Windows terminal sessions with different PATH/account contexts and a managed university tenant.
- **Reproduction:** Run `az login` with the restricted or wrong account.
- **Diagnosis:** CLI installation/PATH and cloud identity were separate issues. A successful identity login does not guarantee access to the correct subscription.
- **Research:** [Azure CLI sign-in](https://learn.microsoft.com/en-us/cli/azure/authenticate-azure-cli-interactively) and university conditional-access guidance.
- **Resolution:** Open a new terminal after installing Azure CLI, authenticate with the account that owns the Azure for Students resources, complete MFA in the permitted browser/location, and explicitly select the subscription.
- **Verification:** Azure Portal displayed `photos-by-greg-rg`; the Container App, ACR, PostgreSQL server, environment, and Log Analytics resources were visible.

## Issue 6 — GitHub Actions Azure Login failed

**Description:** The first auto-deployment failed at **Azure Login** with `No subscriptions found`.

- **Expected:** GitHub's workflow identity authenticates and deploys the container.
- **Actual:** `azure/login` exited with code 1; image build/deploy did not run.
- **Environment:** GitHub-hosted runner, Azure OIDC, user-assigned managed identity.
- **Reproduction:** Run the workflow while the federated identity lacks the correct subscription/resource scope.
- **Diagnosis:** The identity existed, but its Azure RBAC scope did not permit the workflow to operate on the target resources.
- **Research:** [GitHub OIDC for Azure](https://docs.github.com/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-azure), [Azure Login with OIDC](https://learn.microsoft.com/en-us/azure/developer/github/connect-from-azure-openid-connect), and [Container Apps GitHub Actions](https://learn.microsoft.com/en-us/azure/container-apps/github-actions).
- **Resolution:** Assign the deployment managed identity the required role at `photos-by-greg-rg`, verify the repository/branch federated credential, and retain workflow `id-token: write` plus `contents: read` permissions.
- **Verification:** Re-running the failed job succeeded; subsequent merges built and deployed new Container App revisions.

**Prevention:** Replace broad Contributor rights with the smallest ACR and Container App roles that the workflow needs; periodically review the federated credential subject.

## Issue 7 — Booking page hid global navigation

**Description:** The enhanced booking planner appeared, but Booking, Portfolio, Yearbook, Stay Connected, Merchandise, and Admin CRM were missing.

- **Expected:** The planner remains inside the shared workspace shell.
- **Actual:** Booking-specific CSS removed the sidebar/mobile navigation.
- **Environment:** Deployed React application.
- **Reproduction:** Navigate to Booking at desktop width and inspect `.booking-mode` rules.
- **Diagnosis:** A mode class intentionally hid global navigation to match an isolated mockup; that choice broke multi-module access.
- **Research:** Browser computed styles and responsive layout inspection.
- **Resolution:** Keep the shared shell mounted and scope booking styles only to the planner content. The fix was reviewed and merged through pull request #2.
- **Verification:** Production screenshot showed all six navigation items while the planner remained intact; deployment workflow passed.

## Issue 8 — Production merchandise had no demo products/photos

**Description:** Merchandise displayed a valid shell but no authorized photo or selectable product.

- **Expected:** The capstone environment preloads approved graduation images and merchandise.
- **Actual:** Production database had no seeded records.
- **Environment:** Azure Container App with a persistent PostgreSQL database.
- **Reproduction:** Deploy without `SEED_DEMO_DATA=true`, then open Merchandise.
- **Diagnosis:** Local development enabled seeding; the Azure revision did not.
- **Research:** Azure Container App environment-variable configuration and application startup logs.
- **Resolution:** Add `SEED_DEMO_DATA=true` to the Container App demo revision and make seed functions idempotent.
- **Verification:** Production APIs returned 8 products and 3 published galleries; merchandise displayed consent-approved images.

## Issue 9 — Checkout appeared unresponsive

**Description:** Clicking **Checkout items** seemed to do nothing.

- **Expected:** Customer receives a strong confirmation and the order is visible in Admin CRM.
- **Actual:** The cart was empty; the disabled/low-emphasis state did not explain the required next action.
- **Environment:** React Merchandise view with demonstration checkout.
- **Reproduction:** Select a product/photo but click checkout before **Add to cart**.
- **Diagnosis:** Product selection and cart state were separate. The UI did not make that dependency clear enough.
- **Research:** Browser state inspection and manual workflow replay.
- **Resolution:** Add explicit cart items, expanded colors including Northwestern Purple, clearer disabled states, stronger confirmation, and more product options (shirt, mug, hat, photo cube, stickers, magnets).
- **Verification:** Add-to-cart changed item count/subtotal; checkout created an order; Admin CRM displayed it as Ordered.

## Issue 10 — Portfolio image cropping and unreadable caption

**Description:** The graduation card used a portrait image in a landscape `object-fit: cover` frame, cutting off subjects; overlay text had insufficient contrast.

- **Expected:** A balanced portfolio cover and readable caption while original merchandise photos remain unchanged.
- **Actual:** The cover cropped the graduation group and dark text disappeared over the image.
- **Environment:** Responsive Portfolio view.
- **Reproduction:** Open Portfolio and resize the browser.
- **Diagnosis:** One fixed crop rule could not satisfy every source aspect ratio.
- **Research:** CSS replaced-element sizing (`object-fit`, `object-position`) and visual comparison at multiple breakpoints.
- **Resolution:** Use a landscape generated image only as the portfolio cover, restore black caption copy/orange eyebrow styling, and preserve the consent-approved graduation originals for merchandise.
- **Verification:** Portfolio cards aligned and remained readable; Merchandise still used the original approved photographs.

## Issue 11 — Vite changed ports

**Description:** Vite started on `5174` instead of `5173`.

- **Expected:** Frontend available at configured CORS origin.
- **Actual:** Another process already held port 5173, so the app opened on a different origin.
- **Environment:** Local Windows development.
- **Reproduction:** Leave an earlier Vite process running and start another.
- **Diagnosis:** Vite automatically selected the next available port; Flask's origin allowlist still named 5173.
- **Research:** [Vite server options](https://vite.dev/config/server-options) and [environment variables](https://vite.dev/guide/env-and-mode).
- **Resolution:** Stop the stale process or use the printed port and add the exact origin to `FRONTEND_ORIGINS`; restart Flask after configuration changes.
- **Verification:** API calls returned normally and browser CORS errors stopped.

## Resolution evidence and knowledge sharing

Resolved changes were shared through feature branches, pull requests, commit history, PR descriptions, GitHub Actions results, and these `/docs` runbooks. Each important change used this evidence chain:

1. Capture the error and environment.
2. Reproduce safely.
3. Research primary documentation.
4. Apply the smallest scoped change.
5. Run the 15-test backend suite and React production build.
6. Review the Git diff and merge through a pull request.
7. Confirm GitHub Actions and the Azure revision.
8. Run read-only production smoke tests.

