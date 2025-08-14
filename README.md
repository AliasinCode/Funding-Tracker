# Renewable Energy Document Parser

A desktop application built with Electron and TypeScript that allows users to upload legal PDFs commonly used in the renewable energy sector (ECCAs, MIPAs, LLCAs), automatically extracts the table of contents, presents it to users for section selection, and outputs selected sections to Excel format.

## Features

### Core Functionality
- **PDF Upload & Processing**: Drag and drop or file picker for PDF documents
- **Automatic TOC Extraction**: Intelligent detection of table of contents using pattern matching
- **Document Type Detection**: Automatic classification of ECCA, MIPA, and LLCA documents
- **Section Selection**: Interactive tree view with expandable/collapsible sections
- **Excel Export**: Export selected sections with customizable options

### User Interface
- **Modern Design**: Clean, responsive interface built with modern CSS
- **Multi-State Views**: Welcome, processing, results, and error states
- **Progress Tracking**: Visual progress indicators and processing steps
- **Responsive Layout**: Works on desktop and tablet devices

### Export Options
- **Single Sheet Export**: All sections in one Excel sheet
- **Multiple Sheets**: Separate sheets for TOC, content, and document info
- **Content Inclusion**: Option to include or exclude section content
- **Customizable Format**: Structured Excel output with proper formatting

## Supported Document Types

- **ECCA** (Equity Capital Contribution Agreement)
- **MIPA** (Master Interest Purchase Agreement)
- **LLCA** (Limited Liability Company Agreement)

## Technology Stack

- **Framework**: Electron with TypeScript
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js with TypeScript
- **PDF Processing**: pdf-parse (planned implementation)
- **Excel Generation**: ExcelJS (planned implementation)
- **Build Tools**: TypeScript compiler, Electron Builder

## Project Structure

```
src/
├── main/           # Electron main process
│   ├── main.ts     # Main application logic
│   └── preload.ts  # Preload script for IPC
├── renderer/       # Electron renderer process
│   ├── index.html  # Main HTML file
│   ├── styles.css  # Application styles
│   └── renderer.ts # Renderer logic
└── shared/         # Shared types and utilities
    ├── types.ts    # TypeScript interfaces
    ├── pdf-processor.ts    # PDF processing logic
    └── excel-exporter.ts   # Excel export functionality
```

## Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AliasinCode/Funding-Tracker
   cd renewable-energy-document-parser
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the application**
   ```bash
   npm run build
   ```

4. **Start development mode**
   ```bash
   npm run dev
   ```

### Build Scripts

- `npm run build` - Build both main and renderer processes
- `npm run build:main` - Build main process only
- `npm run build:renderer` - Build renderer process only
- `npm run watch:main` - Watch main process for changes
- `npm run watch:renderer` - Watch renderer process for changes
- `npm run package` - Package the application for distribution
- `npm run dist` - Build and package the application

## Usage

### Basic Workflow

1. **Launch Application**: Start the application from your desktop
2. **Upload PDF**: Click "Open PDF" or drag and drop a PDF file
3. **Processing**: Wait for the application to extract text and detect TOC
4. **Review Sections**: Browse the extracted table of contents
5. **Select Sections**: Check the sections you want to export
6. **Export to Excel**: Click "Export to Excel" to save selected sections

### Advanced Features

- **Select All/Clear Selection**: Quick selection management
- **Expandable Sections**: Click on section headers to expand subsections
- **Export Options**: Customize Excel output format
- **Multiple Sheet Export**: Choose between single or multiple Excel sheets

## Development Roadmap

### Phase 1: Foundation ✅
- [x] Project setup and structure
- [x] Electron application framework
- [x] Basic UI components
- [x] TypeScript configuration

### Phase 2: PDF Processing (In Progress)
- [x] PDF processor class structure
- [x] Mock TOC detection algorithms
- [ ] Integration with pdf-parse library
- [ ] Real PDF text extraction
- [ ] Enhanced TOC detection

### Phase 3: Excel Export
- [x] Excel exporter class structure
- [ ] Integration with ExcelJS
- [ ] Advanced formatting options
- [ ] Multiple sheet support

### Phase 4: UI Enhancements
- [x] Modern, responsive design
- [x] Multi-state interface
- [ ] Drag and drop support
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements

### Phase 5: Testing & Optimization
- [ ] Unit tests
- [ ] Integration tests
- [ ] Performance optimization
- [ ] Error handling improvements

## Contributing

### Development Guidelines

1. **Code Style**: Follow TypeScript best practices
2. **Architecture**: Maintain separation between main and renderer processes
3. **Testing**: Write tests for new functionality
4. **Documentation**: Update README and code comments

### Building for Distribution

```bash
# Build the application
npm run build

# Package for distribution
npm run package

# Build and package
npm run dist
```

## Troubleshooting

### Common Issues

1. **Build Errors**: Ensure TypeScript is properly installed
2. **Runtime Errors**: Check console for error messages
3. **PDF Processing**: Verify PDF file format and size
4. **Excel Export**: Ensure write permissions for export directory

### Debug Mode

Enable developer tools in development mode:
```bash
npm run dev
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting section

## Acknowledgments

- Built with Electron and TypeScript
- Icons provided by Font Awesome
- Fonts from Google Fonts (Inter)
- Modern UI patterns and best practices

---

**Note**: This is a development version. Some features (PDF processing, Excel export) use placeholder implementations and will be enhanced in future iterations.
