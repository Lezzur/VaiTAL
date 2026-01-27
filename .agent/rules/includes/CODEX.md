# 🧠 CODEX: Learned Patterns & Fixes

## 🛠 Fixes & Deprecations

### Next.js 16+: Middleware -> Proxy
> [!WARNING]
> The `middleware` file convention is deprecated in favor of `proxy`.

*   **Pattern**: Rename `middleware.ts` to `proxy.ts`.
*   **Action**: Rename the exported function from `middleware` to `proxy`.
*   **Reason**: Distinct separation of concerns (Network Proxy vs App Logic).
*   **Reference**: https://nextjs.org/docs/messages/middleware-to-proxy
