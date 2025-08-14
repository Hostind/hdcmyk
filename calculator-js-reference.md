# Calculator.js Reference Document

## Overview
The calculator.js file is the main application logic for the LAB Color Matching Calculator. It contains approximately 5,039 lines of code and handles all user interactions, calculations, and UI updates.

## Key Components

### 1. Global State Management
- **appState**: Main application state containing target/sample colors, results, history
- **uiEnhancementState**: UI state for sticky status bar functionality
- **scrollState**: Manages scroll detection for sticky status bar
- **previewState**: Handles real-time color preview updates
- **errorState**: Tracks error conditions and retry logic
- **loadingState**: Manages loading states for various operations

### 2. Configuration Objects
- **DEBOUNCE_CONFIG**: Timing configuration for input delays and updates
- **VALIDATION_RULES**: Input validation rules for CMYK and LAB values
- **PRESET_COLORS**: Hardcoded preset color definitions for common printing colors

### 3. Core Classes
- **TooltipManager**: Enhanced tooltip system with positioning and accessibility
  - Handles tooltip show/hide events
  - Manages positioning and responsive behavior
  - Provides accessibility features

### 4. DOM Element Management
- **domElements**: Cached DOM elements for performance
- **cacheDOMElements()**: Caches all input elements, buttons, and display elements
- Includes preset selects, color inputs, swatches, and result displays

### 5. Preset Color System
- **initializePresetColors()**: Sets up preset color dropdowns
- **populatePresetDropdown()**: Populates dropdowns with Pantone or fallback colors
- **handlePresetSelection()**: Applies selected preset colors to inputs
- **getColorInputElements()**: Helper to get input elements by color type

### 6. Input Validation System
- **setupInputValidation()**: Sets up validation for all inputs
- **setupCMYKValidation()**: CMYK-specific validation (0-100%)
- **setupLABValidation()**: LAB-specific validation (L: 0-100, a/b: -128 to 127)
- Real-time validation with visual feedback

### 7. Color Swatch Management
- **updateAllColorSwatches()**: Updates both target and sample swatches
- **updateColorSwatch()**: Updates individual color swatches
- **waitForColorScienceAndInitialize()**: Waits for color science module to load

### 8. Calculation Engine Integration
- **performColorDifferenceCalculation()**: Main calculation function
- **performEnhancedColorDifferenceCalculation()**: Enhanced version with G7 integration
- Integrates with color-science.js module for actual calculations

### 9. Results Display
- **displayCalculationResults()**: Shows Delta E and component results
- **displaySuggestions()**: Shows CMYK adjustment suggestions
- **updateToleranceZone()**: Updates tolerance zone indicators

### 10. Enhanced UI Features
- **Sticky Status Bar**: Shows current status and quick actions
- **Keyboard Shortcuts**: Full keyboard navigation support
- **Enhanced Tooltips**: Comprehensive tooltip system
- **Accessibility Features**: ARIA labels, screen reader support

### 11. G7 Integration
- **initializeG7Integration()**: Sets up G7 gray balance analysis
- **performG7Analysis()**: Performs G7 calculations
- **updateG7Display()**: Updates G7 analysis display

### 12. Export and History
- Integration with export.js and storage.js modules
- History management and recall functionality
- CSV and PDF export capabilities

## Current Issues Identified

### 1. Preset Color Functionality Not Working
**Problem**: Preset colors are not populating input fields when selected
**Root Cause**: Multiple potential issues:
- DOM elements may not be properly cached
- Event listeners may not be attached correctly
- Color data parsing may be failing
- Input event dispatching may not be working

### 2. Calculation Not Working
**Problem**: Color difference calculations are not executing
**Root Cause**: Likely issues:
- Color science module may not be loading properly
- Input validation may be preventing calculations
- DOM elements may not be found
- Event listeners may not be attached

### 3. Color Swatches Not Updating
**Problem**: Color swatches not showing colors when values are entered
**Root Cause**: Potential issues:
- Color science module integration problems
- Swatch update functions not being called
- CSS color application failing

## Key Functions to Debug

### Critical Functions for Preset Colors:
1. `initializePresetColors()` - Line ~3519
2. `populatePresetDropdown()` - Line ~3545
3. `handlePresetSelection()` - Line ~3638
4. `getColorInputElements()` - Line ~3718

### Critical Functions for Calculations:
1. `setupCalculateButton()` - Line ~1600
2. `performColorDifferenceCalculation()` - Referenced but implementation needs verification
3. `waitForColorScienceAndInitialize()` - Line ~1406

### Critical Functions for Color Swatches:
1. `updateAllColorSwatches()` - Referenced but implementation needs verification
2. `updateColorSwatch()` - Referenced but implementation needs verification

## Dependencies
- **color-science.js**: Core color conversion and calculation functions
- **pantone-colors.js**: Pantone color database
- **storage.js**: History and data persistence
- **export.js**: Export functionality
- **test-final-integration.js**: Testing functions

## Initialization Flow
1. DOM content loaded event triggers `initializeApp()`
2. Accessibility features initialized
3. DOM elements cached
4. Sticky status bar initialized
5. Input validation set up
6. Calculate button event listener attached
7. Preset colors initialized
8. Color science module loading waited for
9. Final integration features initialized
10. G7 integration initialized
11. Tooltip manager initialized

## Next Steps for Debugging
1. Check if DOM elements are being found correctly
2. Verify color science module is loading
3. Test preset color event listeners
4. Verify calculation button functionality
5. Check color swatch update functions