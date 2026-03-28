import { describe, expect, it } from 'vitest';
import {
  extractTranscriptTitleFromFilename,
  inferTranscriptFileKind,
  parseTranscriptUploadContent
} from '../utils/transcriptFile';

describe('transcriptFile helpers', () => {
  it('infers transcript file kind from extension', () => {
    expect(inferTranscriptFileKind('lecture.srt')).toBe('srt');
    expect(inferTranscriptFileKind('meeting.vtt')).toBe('vtt');
    expect(inferTranscriptFileKind('notes.txt')).toBe('txt');
  });

  it('extracts a clean title from filename', () => {
    expect(extractTranscriptTitleFromFilename('week-1_marketing-lecture.srt')).toBe('week 1 marketing lecture');
  });

  it('parses srt content and strips indexes and timestamps', () => {
    const parsed = parseTranscriptUploadContent(
      `1
00:00:01,000 --> 00:00:03,000
Hello everyone

2
00:00:04,000 --> 00:00:07,000
Welcome to the lesson`,
      { fileName: 'lesson.srt' }
    );

    expect(parsed.kind).toBe('srt');
    expect(parsed.title).toBe('lesson');
    expect(parsed.transcript).toBe('Hello everyone\n\nWelcome to the lesson');
  });

  it('parses vtt content and strips headers and markup', () => {
    const parsed = parseTranscriptUploadContent(
      `WEBVTT

Kind: captions
Language: en

00:00:01.000 --> 00:00:03.000 align:start position:0%
<c.colorE5E5E5>Hello</c> there

NOTE this is ignored
metadata line

00:00:04.000 --> 00:00:05.500
General Kenobi`,
      { fileName: 'clip.vtt' }
    );

    expect(parsed.kind).toBe('vtt');
    expect(parsed.transcript).toBe('Hello there\n\nGeneral Kenobi');
  });

  it('keeps plain text content with normalized spacing', () => {
    const parsed = parseTranscriptUploadContent('First line\r\n\r\n\r\nSecond line', { fileName: 'draft.txt' });
    expect(parsed.kind).toBe('txt');
    expect(parsed.transcript).toBe('First line\n\nSecond line');
  });
});

