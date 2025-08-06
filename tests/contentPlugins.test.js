import { describe, it, expect } from 'vitest';
import { contentPlugins } from '../contentPlugins.js';

describe('contentPlugins', () => {
  it('detects video by extension', () => {
    expect(contentPlugins.detectType('file.mp4')).toBe('video');
  });

  it('detects supersplat by extension', () => {
    expect(contentPlugins.detectType('scene.ply')).toBe('supersplat');
  });
});
