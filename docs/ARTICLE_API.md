# Article API coverage

Use `useLocalHostAPI().public.articles`, `.articles`, and `.administration.articles`. Paths below are relative to the configured `/api/v1` base.

| Adapter                                 | Method/path                                        | Payload or query               | Idempotency |
| --------------------------------------- | -------------------------------------------------- | ------------------------------ | ----------- |
| `public.articles.list`                  | `GET public/articles`                              | `PublicArticleQuery`           | No          |
| `public.articles.find`                  | `GET public/articles/:id`                          | ID                             | No          |
| `articles.list`                         | `GET articles`                                     | `AuthoringArticleQuery`        | No          |
| `articles.find`                         | `GET articles/:id`                                 | ID                             | No          |
| `articles.create`                       | `POST articles`                                    | `CreateArticle`, hero file     | Yes         |
| `articles.update`                       | `PATCH articles/:id`                               | `UpdateArticle`                | No          |
| `articles.updateHero`                   | `PUT articles/:id/hero`                            | `UpdateArticleHero`, hero file | Yes         |
| `articles.submit`                       | `POST articles/:id/submit`                         | `ArticleVersion`               | No          |
| `articles.withdraw`                     | `POST articles/:id/withdraw`                       | `ArticleVersion`               | No          |
| `administration.articles.list`          | `GET administration/articles`                      | `AdministrationArticleQuery`   | No          |
| `administration.articles.find`          | `GET administration/articles/:id`                  | ID                             | No          |
| `administration.articles.publish`       | `POST administration/articles/:id/publish`         | `ArticleVersion`               | Yes         |
| `administration.articles.returnToDraft` | `POST administration/articles/:id/return-to-draft` | `ArticleAdministrationAction`  | No          |
| `administration.articles.archive`       | `POST administration/articles/:id/archive`         | `ArticleAdministrationAction`  | Yes         |
| `administration.articles.restore`       | `POST administration/articles/:id/restore`         | `ArticleAdministrationAction`  | Yes         |

Public reads need no authentication. Creator/admin reads take the access token. All mutations take both access and CSRF tokens and send cookies. Supported keyed mutations accept the optional final `IdempotencyOptions` argument described in [API_ADAPTERS.md](API_ADAPTERS.md).

Public list/detail responses hydrate `ArticlePageDto`/`ArticleDto`; creator/admin responses hydrate `ArticleManagementPageDto`/`ArticleManagementDto`. Lists contain compact items, while detail and mutation responses contain body/publisher information. Management items carry `version`; use that value for every existing-article mutation's `expected_version`. Return-to-draft, archive, and restore also require a controlled `reason_code`.

Queries support `search`, `order`, `page`, and `take`, defaulting to empty search, DESC, 1, and 25. The backend accepts take values from 1 through 100. Creator/admin queries add `statusKey`; admin queries also add `authorId`. There is no article `sort` parameter. Validation and lifecycle authorization remain on the backend; adapters preserve rejected responses rather than silently correcting input or replaying conflicts.

Creation and hero replacement build multipart data with a `hero` file. Every upload requires informative `hero_alt_text` or an explicit `hero_decorative: true`; null/undefined text is omitted instead of serialized as `"null"`. Boolean and version fields become multipart strings. Upload requests permit 90 seconds, matching QuickAPI's upload request policy. Image size/dimension/format checks remain authoritative on the backend.

```ts
const api = useLocalHostAPI()
const options = { idempotencyKey: crypto.randomUUID() }
const draft = await api.articles.create(
  accessToken,
  csrfToken,
  {
    title: 'Example',
    summary: 'A short summary',
    body: 'Article body',
    hero_alt_text: 'A descriptive caption',
  },
  heroFile,
  options,
)
await api.articles.submit(accessToken, csrfToken, draft.id, {
  expected_version: draft.version,
})
```

Diagnostics are inventoried separately in [DIAGNOSTICS_INVENTORY.md](DIAGNOSTICS_INVENTORY.md).
