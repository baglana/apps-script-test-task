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

  const data = JSON.parse(response.getContentText());

  if (data?.status !== 'ok') {
    throw Error(data.error);
    // throw Error('error getting access token');
  }

  
  return data?.access_token;
}

function getAvailableItems() {
  const requestOptions = getRequestOptions_('getAvailableItems', getAccessToken())
  const response = UrlFetchApp.fetch(WEBAPP_URL, requestOptions)
  
  const data = JSON.parse(response.getContentText());

  if (data?.status !== 'ok') {
    throw Error(data.error);
    // throw Error('error getting available items');
  }


  return data.items;
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
  if (!availableItems || !availableItems.length) {
    return;
  }

  const stockSheet = ss.getSheetByName('Ассортимент');
  const stockRange = ss.getDataRange();
  const stockValues = stockRange.getValues();

  const ID_COLUMN = 0;
  const QUANTITY_COLUMN = 3;

  for (let row = 1; row < stockValues.length; row++) {
    const itemId = stockValues[row][ID_COLUMN];

    let availableItemInd;

    if (itemId !== '') {
      availableItemInd = availableItems.findIndex((e) => {
        return e.id === itemId;
      });

      if (availableItemInd !== -1) {
        stockValues[row][QUANTITY_COLUMN] = availableItems[availableItemInd].quantity;
      }
    }
  }

  stockRange.setValues(stockValues);
  
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
