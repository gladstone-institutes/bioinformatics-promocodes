function doGet(e) {
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

function logRequest(requestData) {
    const spreadsheetId = 'ADD_SHEET_ID';
    const sheetName = 'Logs';

    try {
        const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
        const timestamp = new Date().toISOString();
        const logRow = [
            timestamp,
            requestData.email,
            requestData.affiliation,
            requestData.eventId,
            requestData.eventTitle,
            requestData.promoCode
        ];
        sheet.appendRow(logRow);
    } catch (error) {
        console.error('Error logging request:', error);
    }
}
