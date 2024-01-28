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
  try {
    const requestOptions = getRequestOptions_('getAccessToken')
    const response = UrlFetchApp.fetch(WEBAPP_URL, requestOptions)
    const data = JSON.parse(response.getContentText());

    if (data?.status !== 'ok') {
      throw new Error('error fetching access token: ' + data?.error);
    }

    return data?.access_token;
    
  } catch (err) {
    throw err;
  }
}



function getAvailableItems() {
  try {
    const requestOptions = getRequestOptions_('getAvailableItems', getAccessToken())
    const response = UrlFetchApp.fetch(WEBAPP_URL, requestOptions)
    const data = JSON.parse(response.getContentText());

    if (data?.status !== 'ok') {
      throw new Error('error fetching available items: ' + data?.error);
    }

    return data?.items;

  } catch (err) {
    throw err;
  }
}



/* Функция для решения задачи */
function refreshQuantity(){
  const ss = SpreadsheetApp.getActive()
  
  ss.toast('Начато обновление!')
  /**
   * Напишите решение здесь
   */

  try {
    const availableItems = getAvailableItems();
    if (!availableItems || !availableItems.length) {
      return;
    }

    const stockSheet = ss.getSheetByName('Ассортимент');
    const stockRange = stockSheet.getDataRange();
    const stockValues = stockRange.getValues();
    const stockFormulas = stockRange.getFormulas();

    const ID_COLUMN = 0;
    const QUANTITY_COLUMN = 3;

    for (let row = 1; row < stockValues.length; row++) {

      const itemId = stockValues[row][ID_COLUMN];

      let availableItem;

      if (itemId !== '') {
        availableItem = availableItems.find((e) => {
          return e.id === itemId;
        });

        if (availableItem) {
          stockValues[row][QUANTITY_COLUMN] = availableItem.quantity;
        }
      } else {
        stockValues[row][QUANTITY_COLUMN] = '';
      }
      
      // fill sheet row values with formulas if there were any
      for (let col = 0; col < stockFormulas[0].length; col++) {
        if (stockFormulas[row][col]) {
          stockValues[row][col] = stockFormulas[row][col];
        }
      }

    }

    stockRange.setValues(stockValues);
    
    ss.toast('Обновление завершено!')

  } catch (err) {
    ss.toast('Произошла ошибка! ' + err.message)
    Logger.log(err);
  }
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
