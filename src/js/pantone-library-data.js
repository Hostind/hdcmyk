// Pantone Color Library Data
// Extracted from Pantone color chart for demo library

const PANTONE_LIBRARY_DATA = [
    // Process Colors
    { code: 'PANTONE Pro. Yel. PC', name: 'Process Yellow', L: 89, a: -5, b: 93, substrate: 'Coated', notes: 'C:0 M:0 Y:100 K:0' },
    { code: 'PANTONE Pro. Mag. PC', name: 'Process Magenta', L: 48, a: 74, b: -3, substrate: 'Coated', notes: 'C:0 M:100 Y:0 K:0' },
    { code: 'PANTONE Pro. Cyan PC', name: 'Process Cyan', L: 55, a: -37, b: -50, substrate: 'Coated', notes: 'C:100 M:0 Y:0 K:0' },
    { code: 'PANTONE Pro. Black PC', name: 'Process Black', L: 16, a: 0, b: 0, substrate: 'Coated', notes: 'C:0 M:0 Y:0 K:100' },

    // Popular Pantone Colors
    { code: 'PANTONE Yellow PC', name: 'Pantone Yellow', L: 89, a: -5, b: 93, substrate: 'Coated', notes: 'C:0 M:1 Y:100 K:0' },
    { code: 'PANTONE Or. 021 PC', name: 'Pantone Orange 021', L: 65, a: 55, b: 75, substrate: 'Coated', notes: 'C:0 M:68 Y:100 K:0' },
    { code: 'PANTONE Red 032 PC', name: 'Pantone Red 032', L: 48, a: 74, b: 48, substrate: 'Coated', notes: 'C:0 M:90 Y:60 K:0' },
    { code: 'PANTONE Rub. Red PC', name: 'Pantone Rubine Red', L: 45, a: 78, b: -8, substrate: 'Coated', notes: 'C:0 M:100 Y:18 K:3' },
    { code: 'PANTONE Rhod. Red PC', name: 'Pantone Rhodamine Red', L: 42, a: 75, b: -25, substrate: 'Coated', notes: 'C:9 M:87 Y:0 K:0' },
    { code: 'PANTONE Purple PC', name: 'Pantone Purple', L: 35, a: 65, b: -45, substrate: 'Coated', notes: 'C:43 M:90 Y:0 K:0' },
    { code: 'PANTONE Violet PC', name: 'Pantone Violet', L: 28, a: 58, b: -55, substrate: 'Coated', notes: 'C:92 M:98 Y:0 K:0' },
    { code: 'PANTONE Blue 072 PC', name: 'Pantone Blue 072', L: 25, a: 25, b: -65, substrate: 'Coated', notes: 'C:100 M:85 Y:0 K:4' },
    { code: 'PANTONE Ref. Blue PC', name: 'Pantone Reflex Blue', L: 22, a: 18, b: -68, substrate: 'Coated', notes: 'C:100 M:82 Y:0 K:2' },
    { code: 'PANTONE Pro. Blue PC', name: 'Pantone Process Blue', L: 32, a: -8, b: -58, substrate: 'Coated', notes: 'C:100 M:13 Y:1 K:3' },
    { code: 'PANTONE Green PC', name: 'Pantone Green', L: 56, a: -50, b: 45, substrate: 'Coated', notes: 'C:95 M:0 Y:58 K:0' },

    // Numbered Pantone Colors (Popular ones)
    { code: 'PANTONE 100 PC', name: 'Pantone 100', L: 92, a: -8, b: 45, substrate: 'Coated', notes: 'C:0 M:0 Y:58 K:0' },
    { code: 'PANTONE 101 PC', name: 'Pantone 101', L: 90, a: -6, b: 55, substrate: 'Coated', notes: 'C:0 M:0 Y:70 K:0' },
    { code: 'PANTONE 102 PC', name: 'Pantone 102', L: 88, a: -4, b: 78, substrate: 'Coated', notes: 'C:0 M:0 Y:95 K:0' },
    { code: 'PANTONE 185 PC', name: 'Pantone 185', L: 48, a: 74, b: 48, substrate: 'Coated', notes: 'C:0 M:92 Y:76 K:0' },
    { code: 'PANTONE 186 PC', name: 'Pantone 186', L: 45, a: 78, b: 45, substrate: 'Coated', notes: 'C:0 M:100 Y:75 K:4' },
    { code: 'PANTONE 280 PC', name: 'Pantone 280', L: 28, a: 15, b: -58, substrate: 'Coated', notes: 'C:100 M:78 Y:5 K:18' },
    { code: 'PANTONE 286 PC', name: 'Pantone 286', L: 32, a: 8, b: -65, substrate: 'Coated', notes: 'C:100 M:72 Y:0 K:0' },
    { code: 'PANTONE 300 PC', name: 'Pantone 300', L: 38, a: -15, b: -48, substrate: 'Coated', notes: 'C:100 M:42 Y:0 K:0' },
    { code: 'PANTONE 354 PC', name: 'Pantone 354', L: 56, a: -50, b: 45, substrate: 'Coated', notes: 'C:89 M:0 Y:90 K:0' },

    // Warm and Cool Grays
    { code: 'PANTONE Wm Gy 1 PC', name: 'Warm Gray 1', L: 88, a: 2, b: 4, substrate: 'Coated', notes: 'C:2 M:3 Y:4 K:5' },
    { code: 'PANTONE Wm Gy 5 PC', name: 'Warm Gray 5', L: 68, a: 4, b: 8, substrate: 'Coated', notes: 'C:11 M:13 Y:14 K:26' },
    { code: 'PANTONE Wm Gy 8 PC', name: 'Warm Gray 8', L: 52, a: 6, b: 10, substrate: 'Coated', notes: 'C:16 M:23 Y:23 K:44' },
    { code: 'PANTONE Wm Gy 11 PC', name: 'Warm Gray 11', L: 35, a: 8, b: 12, substrate: 'Coated', notes: 'C:23 M:32 Y:31 K:64' },
    { code: 'PANTONE Cl Gy 1 PC', name: 'Cool Gray 1', L: 88, a: -1, b: -2, substrate: 'Coated', notes: 'C:3 M:2 Y:4 K:5' },
    { code: 'PANTONE Cl Gy 5 PC', name: 'Cool Gray 5', L: 68, a: -2, b: -3, substrate: 'Coated', notes: 'C:15 M:9 Y:8 K:22' },
    { code: 'PANTONE Cl Gy 8 PC', name: 'Cool Gray 8', L: 52, a: -2, b: -4, substrate: 'Coated', notes: 'C:23 M:17 Y:13 K:41' },
    { code: 'PANTONE Cl Gy 11 PC', name: 'Cool Gray 11', L: 35, a: -3, b: -5, substrate: 'Coated', notes: 'C:48 M:36 Y:24 K:66' },

    // Black variations
    { code: 'PANTONE Black PC', name: 'Pantone Black', L: 16, a: 0, b: 0, substrate: 'Coated', notes: 'C:56 M:56 Y:53 K:92' },
    { code: 'PANTONE Black 2 PC', name: 'Pantone Black 2', L: 18, a: 2, b: 8, substrate: 'Coated', notes: 'C:39 M:42 Y:68 K:88' },
    { code: 'PANTONE Black 3 PC', name: 'Pantone Black 3', L: 15, a: -2, b: -3, substrate: 'Coated', notes: 'C:72 M:46 Y:56 K:95' },
    { code: 'PANTONE Black 4 PC', name: 'Pantone Black 4', L: 17, a: 3, b: 5, substrate: 'Coated', notes: 'C:40 M:53 Y:59 K:89' },
    { code: 'PANTONE Black 6 PC', name: 'Pantone Black 6', L: 12, a: -8, b: -15, substrate: 'Coated', notes: 'C:100 M:78 Y:44 K:91' },

    // Metallic approximations (LAB values for display only)
    { code: 'PANTONE 871 PC', name: 'Pantone 871 (Gold)', L: 75, a: 8, b: 65, substrate: 'Coated', notes: 'Metallic gold approximation' },
    { code: 'PANTONE 877 PC', name: 'Pantone 877 (Silver)', L: 78, a: 0, b: 2, substrate: 'Coated', notes: 'Metallic silver approximation' },
    { code: 'PANTONE 876 PC', name: 'Pantone 876 (Copper)', L: 55, a: 25, b: 35, substrate: 'Coated', notes: 'Metallic copper approximation' },

    // Brand Color Examples
    { code: 'CORP-BLUE-001', name: 'Corporate Blue', L: 35, a: 15, b: -45, substrate: 'Coated', notes: 'Primary brand blue' },
    { code: 'CORP-RED-001', name: 'Corporate Red', L: 45, a: 65, b: 45, substrate: 'Coated', notes: 'Primary brand red' },
    { code: 'CORP-GREEN-001', name: 'Corporate Green', L: 45, a: -35, b: 35, substrate: 'Coated', notes: 'Primary brand green' },
    { code: 'CORP-GRAY-001', name: 'Corporate Gray', L: 50, a: 0, b: 0, substrate: 'Coated', notes: 'Neutral corporate gray' },
    { code: 'CORP-ORANGE-001', name: 'Corporate Orange', L: 65, a: 45, b: 65, substrate: 'Coated', notes: 'Accent orange' },

    // Common Print Colors
    { code: 'RICH-BLACK', name: 'Rich Black', L: 8, a: 0, b: 0, substrate: 'Coated', notes: '30C 30M 30Y 100K' },
    { code: 'WARM-BLACK', name: 'Warm Black', L: 12, a: 5, b: 8, substrate: 'Coated', notes: '0C 25M 25Y 100K' },
    { code: 'COOL-BLACK', name: 'Cool Black', L: 10, a: -2, b: -5, substrate: 'Coated', notes: '25C 0M 0Y 100K' },
    { code: 'PAPER-WHITE', name: 'Paper White', L: 95, a: 0, b: 2, substrate: 'Coated', notes: 'Standard coated paper' },

    // Skin Tones
    { code: 'SKIN-LIGHT-001', name: 'Light Skin Tone', L: 75, a: 8, b: 15, substrate: 'Coated', notes: 'Light caucasian skin' },
    { code: 'SKIN-MEDIUM-001', name: 'Medium Skin Tone', L: 55, a: 15, b: 25, substrate: 'Coated', notes: 'Medium skin tone' },
    { code: 'SKIN-DARK-001', name: 'Dark Skin Tone', L: 35, a: 12, b: 18, substrate: 'Coated', notes: 'Dark skin tone' },
    { code: 'SKIN-ASIAN-001', name: 'Asian Skin Tone', L: 65, a: 10, b: 20, substrate: 'Coated', notes: 'Asian skin tone' },

    // Uncoated variants of popular colors
    { code: 'PANTONE Red 032 U', name: 'Pantone Red 032 Uncoated', L: 52, a: 70, b: 52, substrate: 'Uncoated', notes: 'Uncoated version' },
    { code: 'PANTONE Blue 072 U', name: 'Pantone Blue 072 Uncoated', L: 28, a: 22, b: -60, substrate: 'Uncoated', notes: 'Uncoated version' },
    { code: 'PANTONE Green U', name: 'Pantone Green Uncoated', L: 58, a: -45, b: 48, substrate: 'Uncoated', notes: 'Uncoated version' },
    { code: 'PANTONE Yellow U', name: 'Pantone Yellow Uncoated', L: 88, a: -3, b: 88, substrate: 'Uncoated', notes: 'Uncoated version' },
    { code: 'CORP-BLUE-001-U', name: 'Corporate Blue Uncoated', L: 38, a: 12, b: -40, substrate: 'Uncoated', notes: 'Uncoated brand blue' },

    // Newsprint variants
    { code: 'NEWS-BLACK', name: 'Newsprint Black', L: 25, a: 2, b: 3, substrate: 'Newsprint', notes: 'Standard newsprint black' },
    { code: 'NEWS-BLUE', name: 'Newsprint Blue', L: 35, a: 5, b: -35, substrate: 'Newsprint', notes: 'Newsprint blue ink' },
    { code: 'NEWS-RED', name: 'Newsprint Red', L: 48, a: 55, b: 35, substrate: 'Newsprint', notes: 'Newsprint red ink' },

    // Matte variants
    { code: 'MATTE-BLACK', name: 'Matte Black', L: 18, a: 1, b: 1, substrate: 'Matte', notes: 'Matte finish black' },
    { code: 'MATTE-BLUE', name: 'Matte Blue', L: 32, a: 8, b: -45, substrate: 'Matte', notes: 'Matte finish blue' },
    { code: 'MATTE-RED', name: 'Matte Red', L: 48, a: 58, b: 38, substrate: 'Matte', notes: 'Matte finish red' }
];

// Export for use in color library
if (typeof window !== 'undefined') {
    window.PANTONE_LIBRARY_DATA = PANTONE_LIBRARY_DATA;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PANTONE_LIBRARY_DATA;
}