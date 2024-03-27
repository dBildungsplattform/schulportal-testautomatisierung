import { type Locator, Page } from '@playwright/test';

export class RolleManagementViewPage{
    readonly page: Page;
    readonly text_h1_Administrationsbereich: Locator;
    readonly text_h2_RolleAnlegen: Locator;
    readonly table_header_Rollenname: Locator;
    readonly table_header_Rollenart: Locator;
    readonly table_header_Merkmale: Locator;
    readonly table_header_Administrationsebene: Locator;
   
    constructor(page){
        this.page = page;  
        this.text_h1_Administrationsbereich = page.getByRole('heading', { name: 'Administrationsbereich' });
        this.text_h2_RolleAnlegen = page.getByTestId('layout-card-headline');
        this.table_header_Rollenname = page.getByText('Rollenname');
        this.table_header_Rollenart = page.getByText('Rollenart');
        this.table_header_Merkmale = page.getByText('Merkmale');
        this.table_header_Administrationsebene = page.getByText('Administrationsebene');
    }
}