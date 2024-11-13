export async function gotoTargetURL(page, target: string){  
  await page.goto(target);
}