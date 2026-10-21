import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Footer } from '../components/common/Footer.js';

describe('Footer Component', () => {
  it('renders motivational message and corporate recognition watermark', () => {
    render(<Footer motivationalMessage="STAY HUNGRY STAY FOOLISH" activeSlide={0} totalSlides={5} />);

    expect(screen.getByText('STAY HUNGRY STAY FOOLISH')).toBeDefined();
    expect(screen.getByText('CORPORATE RECOGNITION DISPLAY')).toBeDefined();
  });

  it('renders Exit button in right below corner when onExit is provided', () => {
    let exitTriggered = false;
    render(
      <Footer
        motivationalMessage="EXCELLENCE DESERVES RECOGNITION"
        activeSlide={1}
        totalSlides={10}
        onExit={() => {
          exitTriggered = true;
        }}
      />
    );

    const exitButton = screen.getByText('Exit');
    expect(exitButton).toBeDefined();
    exitButton.click();
    expect(exitTriggered).toBe(true);
  });
});
