function doGet(e) {
    // Check if this is a logging request
    if (e.parameter && e.parameter.action === 'log') {
        try {
            const logData = {
                email: e.parameter.email || '',
                affiliation: e.parameter.affiliation || '',
                eventId: e.parameter.eventId || '',
                eventTitle: e.parameter.eventTitle || '',
                promoCode: e.parameter.promoCode || '',
                registrationUrl: e.parameter.registrationUrl || ''
            };
            writeToLogsSheet(logData);
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
    
    // Default behavior - return events data
    return ContentService.createTextOutput(JSON.stringify({
        'status': 'success',
        'data': getEventsData()
    })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        logRequest(data);
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
        const lastRow = sheet.getLastRow();
        const lastCol = sheet.getLastColumn();
        
        if (lastRow < 2) {
            Logger.log('Sheet has less than 2 rows.');
            return [];
        }
        
        // Read from row 2 (headers) to last non-empty row, all columns dynamically
        const data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
        Logger.log('Data range: row 2, col 1, numRows: ' + (lastRow - 1) + ', numCols: ' + lastCol);
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
    Logger.log('=== writeToLogsSheet CALLED ===');
    Logger.log('Received data: ' + JSON.stringify(requestData));
    
    const spreadsheetId = 'ADD_SHEET_ID';
    const sheetName = 'Logs';
    
    Logger.log('Using spreadsheet ID: ' + spreadsheetId);
    Logger.log('Using sheet name: ' + sheetName);

    try {
        Logger.log('Attempting to open spreadsheet...');
        const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        Logger.log('Spreadsheet opened successfully: ' + spreadsheet.getName());
        
        Logger.log('Attempting to get sheet: ' + sheetName);
        const sheet = spreadsheet.getSheetByName(sheetName);
        
        if (!sheet) {
            Logger.log('ERROR: Sheet "' + sheetName + '" not found!');
            Logger.log('Available sheets: ' + spreadsheet.getSheets().map(s => s.getName()).join(', '));
            throw new Error('Sheet "' + sheetName + '" not found');
        }
        
        Logger.log('Sheet found successfully');
        const lastRow = sheet.getLastRow();
        Logger.log('Current last row: ' + lastRow);
        
        // Check if this is the first log entry and add headers if needed
        if (lastRow === 0) {
            Logger.log('Sheet is empty, adding headers...');
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
            Logger.log('Headers added: ' + JSON.stringify(headers));
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
        
        Logger.log('Preparing to append row: ' + JSON.stringify(logRow));
        sheet.appendRow(logRow);
        Logger.log('Row appended successfully!');
        Logger.log('New last row: ' + sheet.getLastRow());
        
    } catch (error) {
        Logger.log('=== ERROR IN writeToLogsSheet ===');
        Logger.log('Error message: ' + error.message);
        Logger.log('Error stack: ' + error.stack);
        console.error('Error logging request:', error);
        throw error; // Re-throw so the calling function knows it failed
    }
}
