function CONVERT_TO_DIRECT_LINK(url) {
  // Regex to extract the File ID from both '/d/' and 'open?id=' patterns
  var idPattern = /(?:\/d\/|id=)([^\/]+)/;
  
  var match = url.match(idPattern);
  if (match && match[1]) {
    var fileId = match[1];
    // var directLink = 'https://drive.usercontent.google.com/thumbnail?id=' + fileId;
    var directLink =  'https://drive.google.com/file/d/' + fileId +'/view'
    return directLink;
  } else {
    return url;  // Return original URL if not a Drive link
  }
}

/**
 * Main function to handle GET requests and route them based on the 'path' query parameter.
 * Falls back to first sheet if no path is provided.
 */
function doGet(e) {
  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var path = e.parameter.path;
    
    if (!path) {
      // Get the first sheet name as fallback
      path = doc.getSheets()[0].getName();
    }
    
    return handleSheet(path);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        "error": error.message
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Generic handler function for any sheet
 */
function handleSheet(sheetName) {
  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error("Sheet not found: " + sheetName);
    }
    
    var dataRange = sheet.getDataRange();
    var data = dataRange.getValues();
    var headers = data[0];
    var results = [];
    
    // Convert sheet data to JSON array
    for (var i = 1; i < data.length; i++) {
      var rowObject = {};
      
      for (var j = 0; j < headers.length; j++) {
        var header = headers[j];
        var value = data[i][j];
        
        // Check if the value is a string and contains a Google Drive link
        if (typeof value === 'string' && 
            (value.includes('drive.google.com') || value.includes('open?id='))) {
          value = CONVERT_TO_DIRECT_LINK(value);
        }
        
        rowObject[header] = value;
      }
      
      results.push(rowObject);
    }
    
    // Create the final response object
    var response = {
      "results": results
    };
    
    return ContentService.createTextOutput(
      JSON.stringify(response)
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        "error": error.message
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function myFunction(){
  console.log("koooi");
  console.log(handleSheet("brochure"));
}
