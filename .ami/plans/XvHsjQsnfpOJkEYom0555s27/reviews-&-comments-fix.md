---
name: "Reviews & Comments Fix"
overview: "Fix 4 bugs in the existing reviews system, add validation/exports, then build a simple product Q&A (comments) system with DB migration, data layer, UI components, and integration into product detail and seller product pages."
todos:
  - id: "fix-seller-response-modal"
    content: "Fix SellerResponseModal useState -> useEffect bug"
    status: not_started
  - id: "fix-review-card-any"
    content: "Remove (review as any).is_anonymous cast in ReviewCard"
    status: not_started
  - id: "create-migration-014"
    content: "Create 014 migration with product_qa table, increment_helpful_count RPC, update_seller_response RPC, and RLS fix"
    status: not_started
  - id: "fix-mark-helpful"
    content: "Fix markReviewHelpful race condition to use RPC"
    status: not_started
  - id: "fix-seller-response-rpc"
    content: "Update addSellerResponse in reviews.ts to use RPC instead of direct update"
    status: not_started
  - id: "add-review-schema"
    content: "Add reviewSchema and questionSchema to validations/schemas.ts"
    status: not_started
  - id: "add-barrel-export"
    content: "Export reviews from lib/data/index.ts"
    status: not_started
  - id: "add-qa-types"
    content: "Add ProductQuestion types to lib/types/index.ts"
    status: not_started
  - id: "create-comments-data"
    content: "Create lib/data/comments.ts with Q&A data functions"
    status: not_started
  - id: "create-qa-components"
    content: "Create ProductQA, QuestionCard, QuestionForm components"
    status: not_started
  - id: "integrate-product-page"
    content: "Add ProductQA to product detail page"
    status: not_started
  - id: "integrate-seller-page"
    content: "Add Q&A tab to seller product edit page"
    status: not_started
  - id: "verify-build"
    content: "Run build and verify no errors"
    status: not_started
createdAt: "2026-02-23T06:26:36.679Z"
updatedAt: "2026-02-23T06:26:36.679Z"
---

# Reviews Bug Fixes & Product Q&A System

## Part 1: Reviews Bug Fixes & Polish

### Bug 1: SellerResponseModal useState misuse
**File:** `components/reviews/SellerResponseModal.tsx:37`
- Replace `useState(() => { ... })` with `useEffect` that watches `review` prop and updates `response` state when `review.seller_response` changes.

### Bug 2: ReviewCard any cast
**File:** `components/reviews/ReviewCard.tsx:53`
- Remove `(review as any).is_anonymous`. The `Review` type has no `is_anonymous` field.
- Default to showing buyer name from `review.buyer` or fallback to "Anonymous Buyer" if no buyer profile attached.

### Bug 3: markReviewHelpful race condition
**File:** `lib/data/reviews.ts:178-199`
- Replace the read-then-update pattern with Supabase RPC or a single `.rpc()` call.
- Create a new migration `014_create_comments_table.sql` that also includes a `increment_helpful_count` SQL function.
- If RPC is too heavyweight, use `.update()` with a raw SQL expression via Supabase's `.rpc()`.

### Bug 4: RLS security flaw
**File:** New migration (included in `014_create_comments_table.sql`)
- Drop the overly permissive seller UPDATE policy on reviews.
- Replace with a policy that only allows sellers to update `seller_response` (use a USING + WITH CHECK that restricts column changes, or use a dedicated RPC function for seller responses).
- Since Postgres RLS can't restrict by column, create an `update_seller_response` RPC function that the data layer calls instead of a direct `.update()`.

### Polish: Validation schema
**File:** `lib/validations/schemas.ts`
- Add `reviewSchema` with: rating (1-5 integer), comment (optional, max 1000 chars).

### Polish: Barrel export
**File:** `lib/data/index.ts`
- Add `export * from './reviews'`.

---

## Part 2: Simple Product Q&A System

### Database
**File:** `supabase/migrations/014_create_comments_table.sql`
- Create `product_qa` table:
  - `id` UUID PK
  - `product_id` UUID FK -> listings(id) ON DELETE CASCADE
  - `author_id` UUID FK -> profiles(id) ON DELETE CASCADE
  - `content` TEXT NOT NULL (max via app validation)
  - `is_seller_answer` BOOLEAN DEFAULT false
  - `parent_id` UUID FK -> product_qa(id) nullable (for seller reply linking)
  - `created_at`, `updated_at` timestamps
- RLS: anyone can SELECT, authenticated users can INSERT (author_id = auth.uid()), authors can UPDATE/DELETE own
- Indexes on product_id, parent_id, created_at
- Also include: `increment_helpful_count` function, `update_seller_response` RPC function, and the RLS fix from Bug 4

### Types
**File:** `lib/types/index.ts`
- Add `ProductQuestion` interface with fields matching the table
- Add `ProductQuestionWithAuthor` extending it with optional `author?: Profile`

### Data Layer
**File:** `lib/data/comments.ts` (new)
- `getQuestionsByProductId(productId)` - fetches questions with author profile, orders seller answers after their parent question
- `createQuestion(productId, authorId, content)` - inserts a question
- `createSellerAnswer(questionId, productId, authorId, content)` - inserts answer linked via parent_id
- `deleteQuestion(questionId, userId)` - deletes own question

### Validation
**File:** `lib/validations/schemas.ts`
- Add `questionSchema`: content (min 5, max 500 chars)

### UI Components
**File:** `components/comments/ProductQA.tsx` (new)
- Main section component. Fetches questions for a product.
- Shows "Questions & Answers" heading with count.
- Lists questions with seller answers inline below each.
- "Ask a Question" button (requires auth).

**File:** `components/comments/QuestionCard.tsx` (new)
- Displays single question with author avatar/name, date, content.
- If seller answer exists, shows it with a "Seller" badge.
- If current user is the product seller and no answer exists, shows "Answer" button.
- If current user is the question author, shows delete option.

**File:** `components/comments/QuestionForm.tsx` (new)
- Textarea + submit button for asking a question or answering one.
- Character count, loading state, validation via `questionSchema`.

### Integration
**File:** `app/products/[id]/page.tsx`
- Add `<ProductQA>` component below `<ProductReviews>`, passing `productId`, `currentUserId`, and `sellerId`.

**File:** `app/seller/products/[id]/edit/page.tsx`
- Add a third tab "Q&A" next to "Edit Details" and "Reviews".
- Show questions needing answers with inline reply form.

---

## Files Modified (summary)
- `components/reviews/SellerResponseModal.tsx` - fix useState bug
- `components/reviews/ReviewCard.tsx` - remove any cast
- `lib/data/reviews.ts` - fix race condition, use RPC for helpful + seller response
- `lib/validations/schemas.ts` - add reviewSchema + questionSchema
- `lib/data/index.ts` - add reviews export
- `lib/types/index.ts` - add ProductQuestion types
- `app/products/[id]/page.tsx` - add ProductQA section
- `app/seller/products/[id]/edit/page.tsx` - add Q&A tab

## Files Created (summary)
- `supabase/migrations/014_create_comments_table.sql`
- `lib/data/comments.ts`
- `components/comments/ProductQA.tsx`
- `components/comments/QuestionCard.tsx`
- `components/comments/QuestionForm.tsx`

## Verification
- Build passes (`pnpm build`)
- No TypeScript errors on modified files
- Review components render without console errors
- Q&A components render on product detail page
- Seller can see Q&A tab on product edit page
