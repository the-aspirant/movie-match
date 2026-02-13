# 📱 Mobile Testing Checklist

## Pre-Launch Mobile QA

### Basic Functionality
- [ ] App loads on iOS Safari
- [ ] App loads on Android Chrome
- [ ] Room creation works
- [ ] Room joining works
- [ ] Swipe gestures responsive
- [ ] Button taps work (no 300ms delay)
- [ ] Match modal appears
- [ ] Matches list opens

### Viewport & Layout
- [ ] No horizontal scroll on any screen
- [ ] Full height screens use 100dvh correctly
- [ ] Safe areas respected (iPhone notch, home bar)
- [ ] Cards fit within viewport
- [ ] Text doesn't overflow
- [ ] No content hidden off-screen

### Touch Targets
- [ ] All buttons minimum 44px × 44px
- [ ] Swipe buttons easily tappable (64px & 80px)
- [ ] Service selection cards easy to tap (60px min)
- [ ] Header buttons accessible
- [ ] Close buttons in modals reachable

### Gestures & Interactions
- [ ] Cards swipe smoothly left/right
- [ ] Swipe threshold feels right (not too easy/hard)
- [ ] Cards snap back if drag is too short
- [ ] Visual feedback during drag (rotate, opacity)
- [ ] Swipe indicators appear (✓ LIKE / ✗ NOPE)
- [ ] No accidental swipes from scrolling
- [ ] No conflict between card drag and page scroll

### Typography
- [ ] All text readable on 375px width (iPhone SE)
- [ ] Font sizes appropriate for mobile
- [ ] Line heights comfortable
- [ ] No text truncation unless intended
- [ ] Room codes clearly visible

### Performance
- [ ] Animations smooth (60fps)
- [ ] No jank during swipe
- [ ] Images load quickly
- [ ] Transitions feel snappy
- [ ] No layout shifts
- [ ] Confetti doesn't lag

### PWA Features
- [ ] Can add to home screen
- [ ] Status bar styled correctly
- [ ] Splash screen (if configured)
- [ ] Runs without address bar

### Edge Cases
- [ ] Works in landscape orientation
- [ ] Works on small phones (iPhone SE, 375px)
- [ ] Works on large phones (iPhone Pro Max, 430px)
- [ ] Works on tablets (different aspect ratios)
- [ ] Works offline (shows appropriate message)
- [ ] Handles slow network gracefully

### Accessibility
- [ ] Text can be zoomed
- [ ] Colors have sufficient contrast
- [ ] Touch targets don't overlap
- [ ] Screen reader labels present
- [ ] Focus states visible

### Browser-Specific
- [ ] iOS Safari: No bounce scroll
- [ ] iOS Safari: Viewport units work
- [ ] Android Chrome: Gestures don't conflict
- [ ] Android Chrome: Bottom nav doesn't hide content
- [ ] Firefox Mobile: All features work

## Test Devices

### Minimum Test Matrix
1. **iPhone** (iOS Safari) - 390px × 844px
2. **Android Phone** (Chrome) - 360px × 740px
3. **Small Phone** (iPhone SE) - 375px × 667px

### Recommended
4. iPad (Safari) - 768px × 1024px
5. Android Tablet (Chrome) - 800px × 1280px

## Quick Test Commands

```bash
# Use Chrome DevTools device emulation
# 1. Open DevTools (F12)
# 2. Toggle device toolbar (Ctrl+Shift+M)
# 3. Select device or set custom dimensions
# 4. Test touch events (enable touch simulation)
```

## Known Mobile Browsers
- iOS: Safari (primary), Chrome, Firefox
- Android: Chrome (primary), Samsung Internet, Firefox
- Always test on real devices when possible!

## Performance Targets
- First Contentful Paint: < 1.8s
- Time to Interactive: < 3.5s
- Lighthouse Mobile Score: > 90

---

✅ **When all items checked, ready for mobile launch!**
