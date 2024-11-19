import { Page, expect } from '@playwright/test';

const FRONTEND_URL: string | undefined = process.env.FRONTEND_URL || "";

export async function getSPId(page: Page, nameSP: string): Promise<string> {
    const response = await page.request.get(FRONTEND_URL + `api/provider/all`, {});   
    expect(response.status()).toBe(200);
    const json = await response.json(); 
    expect(response.status()).toBe(200);
    let idSP = '';
    
    json.forEach((element) => {
        if (element.name === nameSP) {
            idSP = element.id;
        }
    });
    return idSP;   
}