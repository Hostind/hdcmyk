# LAB Color Matching Calculator

A professional CMYK to LAB color difference calculator designed for the printing industry. This Progressive Web Application (PWA) provides accurate color matching calculations using industry-standard Delta E formulas.

## 🎯 Features

### Core Functionality
- **CMYK to LAB Conversion**: Industry-standard color space conversions
- **Delta E Calculations**: Precise color difference measurements using CIE Delta E*ab formula
- **Visual Color Swatches**: Real-time color preview with 150px minimum size for professional use
- **CMYK Adjustment Suggestions**: AI-powered recommendations for achieving target colors
- **Tolerance Zone Classification**: Good/Acceptable/Poor color matching indicators

### Professional Tools
- **Preset Color Library**: Common spot colors, brand colors, and printing standards
- **History Management**: Automatic saving and recall of previous calculations
- **Export Functionality**: CSV and PDF export for documentation and reporting
- **Keyboard Shortcuts**: Power-user shortcuts for efficient workflow

### Progressive Web App
- **Offline Functionality**: Works without internet connection
- **Cross-Platform**: Runs on desktop, tablet, and mobile devices
- **Installable**: Can be installed as a native app
- **Responsive Design**: Optimized for all screen sizes

## 🚀 Quick Start

### Online Access
Visit the live application: [LAB Color Calculator](https://your-domain.vercel.app)

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/lab-color-calculator.git
   cd lab-color-calculator
   ```

2. Open `index.html` in a modern web browser or serve with a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. Navigate to `http://localhost:8000`

## 📁 Project Structure

```
lab-color-calculator/
├── src/
│   ├── js/                     # JavaScript modules
│   │   ├── calculator.js       # Main application logic
│   │   ├── color-science.js    # Color conversion algorithms
│   │   ├── storage.js          # Local storage and history
│   │   └── export.js           # CSV/PDF export functionality
│   ├── css/
│   │   └── styles.css          # Application styles
│   └── assets/
│       └── icons/
│           └── icon.svg        # Application icon
├── tests/
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── e2e/                    # End-to-end tests
├── docs/                       # Documentation
├── index.html                  # Main application file
├── manifest.json               # PWA manifest
├── sw.js                       # Service worker
└── README.md                   # This file
```

## 🎮 Usage

### Basic Workflow
1. **Input Colors**: Enter CMYK or LAB values for target and sample colors
2. **Calculate**: Click "Calculate Color Difference" or press Enter
3. **Review Results**: Analyze Delta E values and tolerance zones
4. **Apply Suggestions**: Use CMYK adjustment recommendations
5. **Export**: Save results as CSV or PDF for documentation

### Keyboard Shortcuts
- `Enter` or `Space`: Calculate color difference
- `Ctrl+R`: Reset all inputs
- `Ctrl+E`: Export to CSV
- `Ctrl+Shift+E`: Export to PDF
- `Ctrl+H`: Show keyboard shortcuts help
- `Alt+1/Alt+2`: Focus target/sample color sections
- `Ctrl+Shift+C`: Copy calculation to clipboard

### Color Input Methods
- **CMYK Values**: 0-100% for Cyan, Magenta, Yellow, Black
- **LAB Values**: L* (0-100), a* (-128 to +127), b* (-128 to +127)
- **Preset Colors**: Select from common printing colors
- **History**: Reload previous calculations

## 🧪 Testing

### Run Integration Tests
Click "Run Integration Tests" in the application or use the browser console:
```javascript
runCompleteWorkflowTests()
```

### Test Suites
- Application Loading Tests
- Input Validation Tests
- Color Science Calculation Tests
- Results Display Tests
- Export Functionality Tests
- History and Storage Tests
- Keyboard Shortcuts Tests
- PWA Functionality Tests
- Cross-Browser Compatibility Tests
- Performance and Error Handling Tests

## 🔧 Technical Details

### Color Science
- **CMYK to RGB**: Simplified conversion for display purposes
- **LAB to RGB**: CIE LAB color space conversion with D65 illuminant
- **Delta E Calculation**: CIE Delta E*ab formula for color difference
- **Tolerance Zones**: Industry-standard thresholds (0-1: Good, 1-3: Acceptable, >3: Poor)

### Browser Support
- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+
- **PWA Features**: Service Worker, Web App Manifest, offline functionality
- **Responsive Design**: Mobile-first approach with touch-friendly interfaces

### Performance
- **Debounced Input**: 300ms delay for real-time updates
- **Cached Calculations**: LRU cache for color conversions
- **Optimized Rendering**: Efficient DOM updates and animations

## 📊 Export Formats

### CSV Export
- Complete calculation data
- CMYK and LAB values
- Delta E components
- CMYK adjustment suggestions
- Timestamp and metadata

### PDF Export
- Professional print-ready format
- Color swatches and values
- Tolerance zone indicators
- Adjustment recommendations
- Company branding ready

## 🔒 Privacy & Data

- **Local Storage Only**: All data stored locally in browser
- **No Server Communication**: Calculations performed client-side
- **Offline Capable**: Full functionality without internet
- **Data Export**: Users control their calculation data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit with descriptive messages: `git commit -m "Add feature description"`
5. Push to your fork: `git push origin feature-name`
6. Create a Pull Request

### Development Guidelines
- Follow existing code style and patterns
- Add tests for new functionality
- Update documentation as needed
- Ensure cross-browser compatibility
- Test PWA functionality

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- CIE (International Commission on Illumination) for color science standards
- Printing industry professionals for requirements and testing
- Open source community for tools and libraries

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/lab-color-calculator/issues)
- **Documentation**: [Project Wiki](https://github.com/your-username/lab-color-calculator/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/lab-color-calculator/discussions)

---

**Built for printing professionals, by developers who understand color.**