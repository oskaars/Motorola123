import React from 'react';
import { render, screen } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';

describe('ThemeContext', () => {
  // Helper to create wrapper to provide context
  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      React.createElement(ThemeProvider, null, children)
    );
  };

  it('provides default values', () => {
    const { result } = renderHook(() => useTheme(), { 
      wrapper: createWrapper() 
    });
    
    expect(result.current.lightColor).toBe('#f0d9b5');
    expect(result.current.darkColor).toBe('#b58863');
    expect(result.current.highlightColor).toBe('#f3d459');
    expect(result.current.PossibleMoveColor).toBe('#B59EE0');
  });

  it('updates light color correctly', () => {
    const { result } = renderHook(() => useTheme(), { 
      wrapper: createWrapper() 
    });
    
    act(() => {
      result.current.setLightColor('#ffffff');
    });
    
    expect(result.current.lightColor).toBe('#ffffff');
  });

  it('updates dark color correctly', () => {
    const { result } = renderHook(() => useTheme(), { 
      wrapper: createWrapper() 
    });
    
    act(() => {
      result.current.setDarkColor('#000000');
    });
    
    expect(result.current.darkColor).toBe('#000000');
  });

  it('updates highlight color correctly', () => {
    const { result } = renderHook(() => useTheme(), { 
      wrapper: createWrapper() 
    });
    
    act(() => {
      result.current.setHighlightColor('#ff0000');
    });
    
    expect(result.current.highlightColor).toBe('#ff0000');
  });
  
  it('updates possible move color correctly', () => {
    const { result } = renderHook(() => useTheme(), { 
      wrapper: createWrapper() 
    });
    
    act(() => {
      result.current.setPossibleMoveColor('#00ff00');
    });
    
    expect(result.current.PossibleMoveColor).toBe('#00ff00');
  });

  it('resets colors to default values', () => {
    const { result } = renderHook(() => useTheme(), { 
      wrapper: createWrapper() 
    });
    
    // Change all colors
    act(() => {
      result.current.setLightColor('#ffffff');
      result.current.setDarkColor('#000000');
      result.current.setHighlightColor('#ff0000');
      result.current.setPossibleMoveColor('#00ff00');
    });
    
    // Verify colors were changed
    expect(result.current.lightColor).toBe('#ffffff');
    expect(result.current.darkColor).toBe('#000000');
    
    // Reset all colors
    act(() => {
      result.current.resetColors();
    });
    
    // Check they're back to defaults
    expect(result.current.lightColor).toBe('#f0d9b5');
    expect(result.current.darkColor).toBe('#b58863');
    expect(result.current.highlightColor).toBe('#f3d459'); 
    expect(result.current.PossibleMoveColor).toBe('#B59EE0');
  });
});