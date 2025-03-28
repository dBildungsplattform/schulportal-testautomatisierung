import { Locator, Page } from '@playwright/test';
import { Row } from './Row';
import { ComboBox } from '../../elements/ComboBox';

export class RolleForm {
  public readonly adminstrationsebene: Row<ComboBox, Locator>;
  public readonly rollenart: Row<ComboBox, Locator>;
  public readonly rollenname: Row<Locator, Locator>;
  public readonly merkmale: Row<ComboBox, undefined>;
  public readonly angebote: Row<ComboBox, undefined>;
  public readonly systemrechte: Row<ComboBox, undefined>;

  constructor(public readonly page: Page) {
    this.adminstrationsebene = new Row(
      page.getByText('Administrationsebene:', {
        exact: true,
      }),
      page.getByTestId('created-rolle-administrationsebene'),
      new ComboBox(this.page, this.page.getByTestId('administrationsebene-select').locator('.v-input__control')),
      page.locator('#administrationsebene-select-messages'),
    );
    this.rollenart = new Row(
      page.getByText('Rollenart:', { exact: true }),
      page.getByTestId('created-rolle-rollenart'),
      new ComboBox(this.page, this.page.getByTestId('rollenart-select').locator('.v-input__control')),
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
      new ComboBox(this.page, this.page.getByTestId('merkmale-select').locator('.v-input__control')),
      undefined,
    );
    this.angebote = new Row(
      page.getByText('Zugeordnete Angebote:', {
        exact: true,
      }),
      page.getByTestId('created-rolle-angebote'),
      new ComboBox(this.page, this.page.getByTestId('service-provider-select').locator('.v-input__control')),
      undefined,
    );
    this.systemrechte = new Row(
      page.getByText('Systemrechte:', { exact: true }),
      page.getByTestId('created-rolle-systemrecht'),
      new ComboBox(this.page, this.page.getByTestId('systemrechte-select').locator('.v-input__control')),
      undefined,
    );
  }

  public async enterRollenname(name: string): Promise<void> {
    await this.rollenname.inputElement.fill(name);
  }
}
