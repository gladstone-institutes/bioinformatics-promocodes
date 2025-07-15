// Debug script for Google Apps Script logging issues
// Copy this entire code into your Google Apps Script project and run the functions

function testLogging() {
    console.log('=== TESTING LOGGING FUNCTIONALITY ===');
    
    // Test data similar to what frontend sends
    const testData = {
        email: 'test@gladstone.org',
        affiliation: 'Gladstone',
        eventId: 'GLAD2024',
        eventTitle: 'Test Workshop 2024',
        promoCode: 'GLAD50',
        registrationUrl: 'https://example.com/register'
    };
    
    console.log('Test data:', testData);
    
    try {
        logRequest(testData);
        console.log('✅ Logging test completed successfully');
        
        // Check if data was written
        checkLogsSheet();
    } catch (error) {
        console.error('❌ Logging test failed:', error);
    }
}

function checkLogsSheet() {
    console.log('=== CHECKING LOGS SHEET ===');
    
    const spreadsheetId = 'ADD_SHEET_ID';  // Make sure this matches your actual sheet ID
    const sheetName = 'Logs';
    
    try {
        console.log('Spreadsheet ID:', spreadsheetId);
        console.log('Sheet name:', sheetName);
        
        // Check if spreadsheet exists
        const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        console.log('✅ Spreadsheet opened successfully');
        console.log('Spreadsheet name:', spreadsheet.getName());
        
        // Check if sheet exists
        const sheet = spreadsheet.getSheetByName(sheetName);
        if (!sheet) {
            console.error('❌ Sheet "' + sheetName + '" not found!');
            console.log('Available sheets:', spreadsheet.getSheets().map(s => s.getName()));
            return null;
        }
        
        console.log('✅ Sheet found');
        
        const lastRow = sheet.getLastRow();
        const lastCol = sheet.getLastColumn();
        
        console.log('Sheet info:');
        console.log('- Last row:', lastRow);
        console.log('- Last column:', lastCol);
        
        if (lastRow > 0) {
            const data = sheet.getRange(1, 1, lastRow, Math.max(lastCol, 7)).getValues();
            console.log('- Sheet data:', data);
            
            if (lastRow >= 2) {
                console.log('- Headers:', data[0]);
                console.log('- Last entry:', data[lastRow - 1]);
            }
        } else {
            console.log('- Sheet is empty');
        }
        
        return sheet;
    } catch (error) {
        console.error('❌ Error checking logs sheet:', error);
        return null;
    }
}

function testDoPost() {
    console.log('=== TESTING doPost FUNCTION ===');
    
    // Simulate what happens when frontend sends POST request
    const mockPostData = {
        contents: JSON.stringify({
            email: 'test@gladstone.org',
            affiliation: 'Gladstone',
            eventId: 'GLAD2024',
            eventTitle: 'Test Workshop 2024',
            promoCode: 'GLAD50',
            registrationUrl: 'https://example.com/register'
        })
    };
    
    const mockEvent = {
        postData: mockPostData
    };
    
    console.log('Mock POST data:', mockPostData);
    
    try {
        const response = doPost(mockEvent);
        const responseText = response.getContent();
        console.log('doPost response:', responseText);
        
        const responseData = JSON.parse(responseText);
        if (responseData.status === 'success') {
            console.log('✅ doPost test successful');
            checkLogsSheet();
        } else {
            console.error('❌ doPost returned error:', responseData);
        }
    } catch (error) {
        console.error('❌ doPost test failed:', error);
    }
}

function createLogsSheetIfMissing() {
    console.log('=== CREATING LOGS SHEET IF MISSING ===');
    
    const spreadsheetId = 'ADD_SHEET_ID';
    
    try {
        const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        
        // Check if Logs sheet exists
        let logsSheet = spreadsheet.getSheetByName('Logs');
        
        if (!logsSheet) {
            console.log('Creating Logs sheet...');
            logsSheet = spreadsheet.insertSheet('Logs');
            console.log('✅ Logs sheet created');
        } else {
            console.log('✅ Logs sheet already exists');
        }
        
        // Check if it's empty and add headers
        if (logsSheet.getLastRow() === 0) {
            console.log('Adding headers to empty Logs sheet...');
            const headers = [
                'Timestamp',
                'Email',
                'Affiliation',
                'Event ID',
                'Event Title',
                'Promo Code',
                'Registration URL'
            ];
            logsSheet.appendRow(headers);
            console.log('✅ Headers added');
        }
        
        checkLogsSheet();
    } catch (error) {
        console.error('❌ Error creating/checking Logs sheet:', error);
    }
}

function clearLogsSheet() {
    console.log('=== CLEARING LOGS SHEET ===');
    
    const spreadsheetId = 'ADD_SHEET_ID';
    const sheetName = 'Logs';
    
    try {
        const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
        sheet.clear();
        console.log('✅ Logs sheet cleared');
    } catch (error) {
        console.error('❌ Error clearing logs sheet:', error);
    }
}

// Run all tests
function runAllTests() {
    console.log('=== RUNNING ALL LOGGING TESTS ===');
    
    console.log('\n1. Checking sheet structure...');
    createLogsSheetIfMissing();
    
    console.log('\n2. Testing direct logging...');
    testLogging();
    
    console.log('\n3. Testing doPost function...');
    testDoPost();
    
    console.log('\n=== ALL TESTS COMPLETED ===');
} 