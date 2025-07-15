function doGet(e) {
    // GET requests are for reading data - return events
    return ContentService.createTextOutput(JSON.stringify({
        'status': 'success',
        'data': getEventsData()
    })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        writeToLogsSheet(data);
        return ContentService.createTextOutput(JSON.stringify({
            'status': 'success',
            'message': 'Request logged successfully'
        })).setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            'status': 'error',
            'message': error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

function getEventsData() {
    const spreadsheetId = 'ADD_SHEET_ID';
    const sheetName = 'Events';

    try {
        const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
        const lastCol = 11;
        
        // Read a reasonable range (let's say up to row 1000) and find the actual last row with content
        const maxRowsToCheck = 1000;
        const columnAData = sheet.getRange(1, 1, maxRowsToCheck, 1).getValues();
        
        // Find the last row with actual content in column A
        let actualLastRow = 0;
        for (let i = columnAData.length - 1; i >= 0; i--) {
            if (columnAData[i][0] !== '' && columnAData[i][0] !== null && columnAData[i][0] !== undefined) {
                actualLastRow = i + 1; // Convert to 1-based index
                break;
            }
        }
        
        Logger.log('Actual last row with content in column A: ' + actualLastRow);
        
        if (actualLastRow < 2) {
            Logger.log('Sheet has less than 2 rows with content in column A.');
            return [];
        }
        
        // Read from row 2 (headers) to actual last row with content, all columns
        const data = sheet.getRange(2, 1, actualLastRow - 1, lastCol).getValues();
        Logger.log('Data range: row 2, col 1, numRows: ' + (actualLastRow - 1) + ', numCols: ' + lastCol);
        Logger.log('Raw data: ' + JSON.stringify(data));
        
        if (data.length === 0) {
            Logger.log('No data rows found.');
            return [];
        }
        
        const headers = data[0];
        Logger.log('Headers: ' + JSON.stringify(headers));
        
        const events = [];
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (row.every(cell => cell === '' || cell === null)) continue;
            const event = {};
            headers.forEach((header, index) => {
                event[header] = row[index];
            });
            events.push(event);
        }
        Logger.log('Events: ' + JSON.stringify(events));
        return events;
    } catch (error) {
        Logger.log('Error reading events: ' + error);
        return [];
    }
}

function writeToLogsSheet(requestData) {
    const spreadsheetId = 'ADD_SHEET_ID';
    const sheetName = 'Logs';

    try {
        const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
        
        // Check if this is the first log entry and add headers if needed
        if (sheet.getLastRow() === 0) {
            const headers = [
                'Timestamp',
                'Email',
                'Affiliation',
                'Event ID',
                'Event Title',
                'Promo Code',
                'Registration URL'
            ];
            sheet.appendRow(headers);
        }
        
        const timestamp = new Date().toISOString();
        const logRow = [
            timestamp,
            requestData.email || '',
            requestData.affiliation || '',
            requestData.eventId || '',
            requestData.eventTitle || '',
            requestData.promoCode || '',
            requestData.registrationUrl || ''
        ];
        sheet.appendRow(logRow);
        
    } catch (error) {
        Logger.log('Error logging request: ' + error);
        console.error('Error logging request:', error);
    }
}
