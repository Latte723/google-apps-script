function doGet(e) {
    const {parameter} = e;
    const {mailAddress} = parameter;
    const id = checkMailAddress(mailAddress);
    let retObj;
    if (id >= 1) {
      retObj = {
        "result": "ok",
        "id": id
      }
    } else {
      retObj = {
        "result": "ng",
        "msg": "登録されていないメールアドレスです。"
      }
    }
    return createJsonOutput(retObj);
  }
  
  function checkMailAddress(mailAddress) {
    const activeSpreadsheet = SpreadsheetApp.getActive();
    const loginSheet = activeSpreadsheet.getSheetByName('login');
    const mailFinder = loginSheet.createTextFinder(mailAddress);
    const mailCellRange = mailFinder.findNext();
    if (!mailCellRange) {
      return -1;
    } 
    const maillCellRow = mailCellRange.getRow();
    const id = loginSheet.getSheetValues(maillCellRow, 1, 1, 1)[0][0];
    return id;
  }
  
  function createJsonOutput(obj) {
    const jsonStr = JSON.stringify(obj);
    const jsonOutput = ContentService.createTextOutput(jsonStr);
    jsonOutput.setMimeType(ContentService.MimeType.JSON);
    return jsonOutput;
  }