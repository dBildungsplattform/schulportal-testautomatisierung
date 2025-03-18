import moment from 'moment';

export async function gotoTargetURL(page, target: string) {
  await page.goto(target);
}

export async function generateCurrentDate({ days, months, formatDMY }: { days: number; months: number; formatDMY: boolean }) {
  // creates current date and adds days + month to the current date
  // returned format is DD.MM.YYYY or YYYY.MM.DD
  if (formatDMY) {
    return moment().add({ days: days, months: months }).format('DD.MM.YYYY');
  } else {
    return moment().add({ days: days, months: months }).format('YYYY.MM.DD');
  }
}
