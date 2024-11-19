import  moment from 'moment';

export async function gotoTargetURL(page, target: string) {  
  await page.goto(target);
}

export async function generateDateToday() {  
  return moment().format('DD.MM.YYYY');
}

export async function generateDateFuture(days: number, months: number) {  
  return moment().add({ days: days, months: months }).format('DD.MM.YYYY');
}