// Pure view model for the Telegram wallet panel.
export function walletChoiceContent(walletInfo,state){
 return {title:'ГАМАНЕЦЬ І ПОДАРУНКИ',detail:walletInfo?'У гаманці: '+walletInfo.balance+' монет.\nУ кишені пета: '+state.coins+'.\nТвій Telegram ID: '+walletInfo.telegramId+'\n'+(walletInfo.owner?'Власника розпізнано ✓':walletInfo.ownerConfigured?'ID власника не збігається з цією Telegram-сесією.':'Секрет OWNER_TELEGRAM_ID не задано у цьому Worker.')+'\nДля покупок переведи монети в кишеню пета. Гаманець зберігається між поколіннями.':'Завантажую гаманець…'};
}
