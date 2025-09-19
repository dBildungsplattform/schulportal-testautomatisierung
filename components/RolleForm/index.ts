import { Locator, Page } from '@playwright/test';
import { Row } from './Row';
import { Autocomplete } from '../../elements/Autocomplete';

export class RolleForm {
  public readonly adminstrationsebene: Row<Autocomplete, Locator>;
  public readonly rollenart: Row<Autocomplete, Locator>;
  public readonly rollenname: Row<Locator, Locator>;
  public readonly merkmale: Row<Autocomplete, undefined>;
  public readonly angebote: Row<Autocomplete, undefined>;
  public readonly systemrechte: Row<Autocomplete, undefined>;

  constructor(public readonly page: Page) {
    this.adminstrationsebene = new Row(
      page.getByText('Administrationsebene:', {
        exact: true,
      }),
      page.getByTestId('created-rolle-administrationsebene'),
      new Autocomplete(this.page, this.page.getByTestId('rolle-form-organisation-select').locator('.v-input__control')),
      page.locator('#rolle-form-organisation-select-messages'),
    );
    this.rollenart = new Row(
      page.getByText('Rollenart:', { exact: true }),
      page.getByTestId('created-rolle-rollenart'),
      new Autocomplete(this.page, this.page.getByTestId('rollenart-select').locator('.v-input__control')),
      page.locator('#rollenart-select-messages'),
    );
    this.rollenname = new Row(
      page.getByText('Rollenname:', { exact: true }),
      page.getByTestId('created-rolle-name'),
      page.getByTestId('rollenname-input').locator('input'),
      page.locator('#rollenname-input-messages'),
    );
    this.merkmale = new Row(
      page.getByText('Merkmale:', { exact: true }),
      page.getByTestId('created-rolle-merkmale'),
      new Autocomplete(this.page, this.page.getByTestId('merkmale-select').locator('.v-input__control')),
      undefined,
    );
    this.angebote = new Row(
      page.getByText('Zugeordnete Angebote:', {
        exact: true,
      }),
      page.getByTestId('created-rolle-angebote'),
      new Autocomplete(this.page, this.page.getByTestId('service-provider-select').locator('.v-input__control')),
      undefined,
    );
    this.systemrechte = new Row(
      page.getByText('Systemrechte:', { exact: true }),
      page.getByTestId('created-rolle-systemrecht'),
      new Autocomplete(this.page, this.page.getByTestId('systemrechte-select').locator('.v-input__control')),
      undefined,
    );
  }

  public async enterRollenname(name: string): Promise<void> {
    await this.rollenname.inputElement.fill(name);
  }
}
