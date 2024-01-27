const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbx1yfGYp5C4r7-Fku_vlQRngSbSI5b8633n5Arn7Knu0PyPo0GlSJU8x630nGh6EdVDnw/exec' //URL поставщика
/**
 * Для решения данной задачи разрешается производить любые изменения в текущий код
 */

/**
 * Функция возвращает тело запроса, содержащее указанные параметры
 * @param {string} apiMethod 
 * @returns {object}
 */
function getRequestOptions_(method, access_token = ''){
  const payload = JSON.stringify({ //тело запроса
    method, 
    access_token
  })

  const requestOptions = {
    method: 'POST',
    muteHttpExceptions: true,
    payload
  }

  return requestOptions
}



/**
 * Можно посмотреть доступные методы через API
 */
function getAvailableMethods(){
  const requestOptions = getRequestOptions_('getMethods')
  const response = UrlFetchApp.fetch(WEBAPP_URL, requestOptions)
  Logger.log(response)
}

function getAccessToken() {
  const requestOptions = getRequestOptions_('getAccessToken')
  const response = UrlFetchApp.fetch(WEBAPP_URL, requestOptions)
  const json = JSON.parse(response);
  
  if (json?.status !== 'ok') {
    throw Error('error getting access token');
  }
  
  return json?.access_token;
}

function getAvailableItems() {
  const requestOptions = getRequestOptions_('getAvailableItems', getAccessToken())
  const response = UrlFetchApp.fetch(WEBAPP_URL, requestOptions)
  const json = JSON.parse(response);
  
  if (json?.status !== 'ok') {
    throw Error('error getting available items');
  }

  return json.items;
}



/* Функция для решения задачи */
function refreshQuantity(){
  const ss = SpreadsheetApp.getActive()
  
  ss.toast('Начато обновление!')
  /**
   * Напишите решение здесь
   */

  // ss.toast('Произошла ошибка!')

  const availableItems = getAvailableItems();

  const sh = ss.getSheetByName('Ассортимент');

  console.log(sh.getDataRange().getValues());
  
  const idRange = sh.getRange('A2:A');
  const targetRange = sh.getRange('D2:D');
  const targetValues = targetRange.getValues();

  idRange.getValues().forEach( (row, i) => {
    console.log('row', i)
    const ind = availableItems.findIndex((e) => {
      return e.id === row[0];
    });
    if (ind !== -1) {
      targetValues[i][0] = availableItems[ind].quantity;
    }
  });

  targetRange.setValues(targetValues);

  ss.toast('Обновление завершено!')
}

/**
 * Простой триггер
 * При открытии таблицы функция создает меню в интерфейсе таблицы
 */
function onOpen(){
  SpreadsheetApp
    .getUi()
    .createMenu('🔄 Синхронизация')
    .addItem('📥 Загрузить информацию об остатках', 'refreshQuantity')
    .addToUi()
}
