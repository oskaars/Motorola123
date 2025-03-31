import React from 'react';
import { render, screen } from '@testing-library/react';
import GradientDivider from '../src/app/components/LandingPage/GradientDivider';

describe('GradientDivider', () => {
  it('renders without crashing', () => {
    render(React.createElement(GradientDivider));
  });

  it('renders the base gradient layer', () => {
    const { container } = render(React.createElement(GradientDivider));
    const gradientLayer = container.querySelector('.bg-gradient-to-r');
    expect(gradientLayer).toBeInTheDocument();
  });

  it('renders the animated shine layer', () => {
    const { container } = render(React.createElement(GradientDivider));
    const shineLayer = container.querySelector('.animate-shine');
    expect(shineLayer).toBeInTheDocument();
  });

  it('renders the pulse effect layer', () => {
    const { container } = render(React.createElement(GradientDivider));
    const pulseLayer = container.querySelector('.animate-pulse-opacity');
    expect(pulseLayer).toBeInTheDocument();
  });

  it('has the correct styling applied', () => {
    const { container } = render(React.createElement(GradientDivider));
    const divider = container.firstChild as HTMLElement;
    expect(divider).toHaveClass('relative');
    expect(divider).toHaveClass('w-full');
    expect(divider).toHaveClass('h-[0.5vh]');
    expect(divider).toHaveClass('overflow-hidden');
  });
  
  it('has correct shine animation keyframes', () => {
    const { container } = render(React.createElement(GradientDivider));
    
    const styleEl = container.querySelector('style');
    expect(styleEl).toBeInTheDocument();
    
    const styleContent = styleEl?.textContent || '';
    
    expect(styleContent).toContain('@keyframes shine');
    expect(styleContent).toContain('transform: translateX(-100%)');
    expect(styleContent).toContain('transform: translateX(200%)');
    
    expect(styleContent).toContain('.animate-shine');
    expect(styleContent).toContain('animation: shine 2.5s');
  });

  it('has correct pulse-opacity animation keyframes', () => {
    const { container } = render(React.createElement(GradientDivider));
    
    const styleEl = container.querySelector('style');
    expect(styleEl).toBeInTheDocument();
    
    const styleContent = styleEl?.textContent || '';
    
    expect(styleContent).toContain('@keyframes pulse-opacity');
    expect(styleContent).toContain('opacity: 0.3');
    expect(styleContent).toContain('opacity: 0.6');

    expect(styleContent).toContain('.animate-pulse-opacity');
    expect(styleContent).toContain('animation: pulse-opacity 3s');
  });
});