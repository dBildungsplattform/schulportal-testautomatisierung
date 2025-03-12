import moment from 'moment';

export async function gotoTargetURL(page, target: string) {
  await page.goto(target);
}

export async function generateDateToday() {
  return moment().format('DD.MM.YYYY');
}

export async function generateDate(days: number, months: number, formatYMD?: boolean) {
  if (formatYMD) {
    return moment().add({ days: days, months: months }).format('YYYY.MM.DD');
  } else {
    return moment().add({ days: days, months: months }).format('DD.MM.YYYY');
  }
}
