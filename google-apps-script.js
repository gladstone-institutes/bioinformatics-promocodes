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
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const events = [];

        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const event = {};
            headers.forEach((header, index) => {
                event[header] = row[index];
            });
            events.push(event);
        }

        return events;
    } catch (error) {
        console.error('Error reading events:', error);
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
