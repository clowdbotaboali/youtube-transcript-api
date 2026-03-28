# Transcript Source Plan

## Goal

Make transcript extraction feel simple for end users while expanding the product to support two input sources:

1. YouTube URL
2. Direct transcript text

The user should not see provider names, fallback chains, or local-backend concepts in the normal flow. The interface should stay focused on one outcome: get usable text, then generate summaries, notes, steps, and chat responses.

## Product Rules

- Keep the main workspace simple.
- Do not expose `TranscriptAPI`, provider failures, or `Local Server` in the normal extraction path.
- Use operational status language only, such as:
  - `جارٍ استخراج النص...`
  - `نحاول طريقة بديلة...`
  - `جارٍ تجهيز النص للمعالجة...`
- Treat manual transcript text as a first-class source, not as a fallback hack.
- Any source that produces normalized transcript text should unlock the same downstream AI workflow.

## Source Model

### Source types

1. `youtube`
2. `manual-text`

### Shared normalized payload

All transcript sources should converge into one shared object shape before entering the AI workflow:

- `sourceType`
- `videoId` or `sourceId`
- `videoTitle`
- `transcript`
- `wordCount`
- `method`
- `thumbnailUrl`
- `descriptionLinks`
- `descriptionInstructions`

The UI may keep using `videoId` short term for compatibility, but the semantic meaning becomes `content source id`.

## UX Plan

### Phase 1

- Add two workspace input modes:
  1. YouTube link
  2. Written transcript
- Keep one visible processing language selector.
- In manual mode:
  - allow optional title
  - allow transcript textarea
  - send the user directly into the same workspace used by extracted YouTube transcripts
- Hide technical internals from the user.

### Phase 2

- Add file upload for:
  - `txt`
  - `srt`
  - `vtt`
  - later `pdf` and `docx`
- Improve status copy so the user sees progress without provider terminology.

### Phase 3

- Move YouTube extraction to a full silent fallback chain in production:
  1. TranscriptAPI
  2. server-side fallback providers
  3. future audio-to-text path where appropriate
- Only surface a simple final failure message if all attempts fail.

## Backend Plan

### Phase 1 backend work

- Expand source parsing so `manual-text` IDs are accepted by:
  - `/api/ai/process`
  - `/api/chat/chat`
  - `/api/history/save`
- Keep YouTube extraction endpoints strict to YouTube input only.
- Skip YouTube-specific SEO and saved-link behavior for manual sources.
- Preserve history saving for manual sources so summaries and chat remain reusable.

### Phase 2 backend work

- Add upload parsing pipeline.
- Normalize uploaded text into the same transcript payload.

### Phase 3 backend work

- Centralize extraction orchestration behind one internal service.
- Record extraction attempt path for observability without exposing it to the user.

## Frontend Plan

### Phase 1 frontend work

- Update `VideoInput` to support two source modes.
- Add local transcript creation flow for manual text.
- Update preview/workspace card behavior so manual sources do not require a YouTube embed.
- Keep transcript display, chat, AI processing, and save actions working on both source types.

## Data and History Rules

- Saved links should remain YouTube-only.
- Saved history should support both YouTube and manual transcript sources.
- Manual sources should use neutral titles/thumbnails and must not generate fake YouTube URLs.

## Success Criteria

Phase 1 is successful when:

- a user can paste transcript text into the workspace
- the transcript appears in the same viewer used for YouTube extracts
- chat works with the pasted transcript
- AI processing works with the pasted transcript
- saving the result works without requiring a YouTube video ID
- the default user interface still looks simple and non-technical

## Implementation Order

1. Add plan file
2. Expand backend source-ID acceptance
3. Add manual transcript mode in the workspace input
4. Add manual preview state in the workspace
5. Validate build and smoke-test both source types

