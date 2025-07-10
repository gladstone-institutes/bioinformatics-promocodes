// Debug script to test column reading
// This can be run in Google Apps Script editor to debug the issue

function debugColumns() {
    const spreadsheetId = 'ADD_SHEET_ID'; // Replace with actual sheet ID
    const sheetName = 'Events';
    
    try {
        const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
        const lastRow = sheet.getLastRow();
        const lastCol = sheet.getLastColumn();
        
        console.log('Sheet dimensions:', {
            lastRow: lastRow,
            lastCol: lastCol
        });
        
        // Read headers only (row 2)
        const headers = sheet.getRange(2, 1, 1, lastCol).getValues()[0];
        console.log('Headers found:', headers);
        console.log('Number of headers:', headers.length);
        
        // Check for specific columns
        const requiredColumns = ['Title', 'Date', 'EDU code', 'Partner code', 'General URL', 'EDU URL', 'Partner URL'];
        const missingColumns = [];
        const foundColumns = [];
        
        requiredColumns.forEach(col => {
            const index = headers.indexOf(col);
            if (index === -1) {
                missingColumns.push(col);
            } else {
                foundColumns.push({column: col, index: index + 1}); // 1-based
            }
        });
        
        console.log('Found columns:', foundColumns);
        console.log('Missing columns:', missingColumns);
        
        // Read first data row to check values
        if (lastRow > 2) {
            const firstDataRow = sheet.getRange(3, 1, 1, lastCol).getValues()[0];
            console.log('First data row:', firstDataRow);
            
            // Create object like the main function does
            const event = {};
            headers.forEach((header, index) => {
                event[header] = firstDataRow[index];
            });
            console.log('First event object:', event);
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// Test the current getEventsData function
function testGetEventsData() {
    const events = getEventsData();
    console.log('getEventsData returned:', events.length, 'events');
    if (events.length > 0) {
        console.log('First event keys:', Object.keys(events[0]));
        console.log('First event:', events[0]);
    }
} 