import { type Page } from '@playwright/test';
import { format, addDays, addMonths } from 'date-fns';

export async function gotoTargetURL(page: Page, target: string): Promise<void> {
  await page.goto(target);
}

export async function generateCurrentDate({
  days,
  months,
  formatDMY,
}: {
  days: number;
  months: number;
  formatDMY: boolean;
}): Promise<string> {
  // creates current date and adds days + month to the current date
  // returned format is DD.MM.YYYY or YYYY.MM.DD
  const newDate: Date = addDays(addMonths(new Date(), months), days);

  if (formatDMY) {
    return format(newDate, 'dd.MM.yyyy');
  } else {
    return format(newDate, 'yyyy.MM.dd');
  }
}
