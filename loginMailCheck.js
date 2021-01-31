const ageMap = new Map([
    ['1', '~15'], ['2', '16~20'], ['3', '21~25'], ['4', '26~30'], ['5', '31~40'], ['6', '41~50'], ['7', '51~'] 
  ])
  const Mode = {
    CHECK: '1',
    CREATE: '2'
  }
  const countries = new Set([
      'Japan', 'Indonesia', 'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda',
      'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados',
      'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil',
      'Brunei', 'Bulgaria', 'Burkina Faso', 'Burma', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada',
      'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Costa Rica', 'Côte d’Ivoire',
      'Croatia', 'Cuba', 'Cyprus', 'Czechia', 'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica',
      'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini',
      'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada',
      'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Holy See', 'Honduras', 'Hungary', 'Iceland', 'India',
      'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo',
      'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania',
      'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania',
      'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Namibia',
      'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia',
      'Norway', 'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland',
      'Portugal', 'Qatar', 'Republic of the Congo', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia',
      'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'São Tomé and Príncipe', 'Saudi Arabia', 'Senegal', 'Serbia',
      'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea',
      'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan',
      'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan',
      'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Venezuela',
      'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
    ])
  
  function doGet(e) {
    const {parameter} = e;
    const {mailAddress, mode} = parameter;
    let retObj;
  
    if (!mailAddress) { 
      retObj = createNgObj('Please input your e-mail adderss');
      return createJsonOutput(retObj);
    }
  
    let id = checkMailAddress(mailAddress);
  
    if (id >= 1) {
      retObj = createOkObj(id);
    } else if (mode == Mode.CHECK) {
      retObj = createNgObj("Your e-mail address is not registered");
    } else {
      retObj = createNewRecord(parameter);
    }
    return createJsonOutput(retObj);
  }
  
  function createNewRecord(parameter) {
    const {mailAddress, age, birthplace, residence, sex} = parameter;
    let noneInputArr = [];
    let ageStr;
    let sexStr;
    
    if (!age) { noneInputArr.push('age') }
    if (!birthplace) { noneInputArr.push('birthplace') }
    if (!residence) { noneInputArr.push('residence') }
    if (!sex) { noneInputArr.push('sex') }
    
    if (noneInputArr.length > 0) {
      return createNgObj('Please input your ' + noneInputArr.join(', '));
    }
  
    try {
      ageStr = convertAge(age);
      sexStr = convertSex(sex);
      checkCountryName(birthplace);
      checkCountryName(residence);
    } catch(ex) {
      return createNgObj(ex);
    }
  
    id = createId();
    const newRecord = [id, mailAddress, ageStr, birthplace, residence, sexStr];
    const login = SpreadsheetApp.getActive();
    const loginSheet = login.getSheetByName('login');
    loginSheet.appendRow(newRecord);
    return createOkObj(id);
  }
  
  function checkMailAddress(mailAddress) {
    const login = SpreadsheetApp.getActive();
    const loginSheet = login.getSheetByName('login');
    const mailFinder = loginSheet.createTextFinder(mailAddress);
    const mailCellRange = mailFinder.findNext();
  
    if (!mailCellRange) {
      return -1;
    }
  
    const maillCellRow = mailCellRange.getRow();
    const id = loginSheet.getSheetValues(maillCellRow, 1, 1, 1)[0][0];
  
    return id;
  }
  
  function convertAge(age) {
  
    if (ageMap.has(age)) {
      return ageMap.get(age);
    }
  
    throw 'Please select a valid age';
  }
  
  function convertSex(sex) {
  
    switch (sex) {
    case '1': return 'Male';
    case '2': return 'Female';
    case '3': return 'Other';
    default: throw 'Please select a valid sex'
    }
  }
  
  function checkCountryName(name) {
    if (!countries.has(name)) {
      throw 'Please select a valid country'
    }
  }
  
  function createId () {
    const login = SpreadsheetApp.getActive();
    const loginSheet = login.getSheetByName('login');
    return loginSheet.getMaxRows();
  }
  
  function createJsonOutput(obj) {
  
    const jsonStr = JSON.stringify(obj);
    const jsonOutput = ContentService.createTextOutput(jsonStr);
    jsonOutput.setMimeType(ContentService.MimeType.JSON);
    return jsonOutput;
  }
  
  function createOkObj(id) {
    return {
      "result": "ok",
      "id": id
    }
  }
  
  function createNgObj(msg) {
    return {
      "result": "ng",
      "msg": msg
    }
  }
  