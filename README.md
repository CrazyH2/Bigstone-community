# Bigstone Community Monorepo

Bigstone is a custom redstone-like system with components at a 16x16x16 block scale. each simulates redstone, with unique features and new types (heavy repeaters, chain lamps, dust bridges, etc). All components follow consistent design rules for compatibility.

## Packages

- `api` – backend api
- `web` – next.js website
- `docs` – documentation

## Getting Started

Install all dependencies:
```
pnpm i
```

Install web-only dependencies:
```
pnpm i --filter=web
```

Run the website:
```
pnpm dev --filter=web
```