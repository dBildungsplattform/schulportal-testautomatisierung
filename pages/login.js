const { expect } = require("@playwright/test");

exports.LoginPage = class LoginPage{

    constructor(page, Direkteinstieg){
        this.page = page;  
        this.Direkteinstieg = Direkteinstieg;  //Einstieg über das Portal, bei true ist der Einstieg direkt über die Loginseite(ohne tabs bzw. framelocator)
        
        this.url = 'https://portal.qs.schule-sh.de/univention/portal'; //depricated
        if(this.Direkteinstieg == true) {  
            this.button_cookieOK = page.getByRole('button', { name: 'Akzeptieren' });
            this.button_openLoginPage = page.getByRole('link', { name: 'Anmelden Gleicher Tab' });
            this.input_username = page.locator("[id='umcLoginUsername']");
            this.input_password = page.locator("#umcLoginPassword");
            this.button_login = page.getByRole('button', { name: 'Anmelden' });  
            this.text_PasswortAbgelaufen = page.getByText('Das Passwort ist abgelaufen und muss erneuert werden.');
            this.input_neuesPasswort = page.getByLabel('Neues Passwort', { exact: true });
            this.input_neuesPasswortWiederholen = page.getByLabel('Neues Passwort (wiederholen)');
            this.button_passwortAendern = page.getByRole('button', { name: 'Passwort setzen' });                                    
        }
        else{
            this.button_cookieOK = page.getByRole('button', { name: 'Akzeptieren' });
            this.button_openLoginPage = page.getByRole('link', { name: 'Anmelden Gleicher Tab' });
            this.input_username = page.locator("[id='umcLoginUsername']");
            this.input_password = page.locator("#umcLoginPassword");
            this.button_login = page.getByRole('button', { name: 'Anmelden' });  
            this.text_PasswortAbgelaufen = page.getByText('Das Passwort ist abgelaufen und muss erneuert werden.');
            this.input_neuesPasswort = page.getByLabel('Neues Passwort', { exact: true });
            this.input_neuesPasswortWiederholen = page.getByLabel('Neues Passwort (wiederholen)');
            this.button_passwortAendern = page.getByRole('button', { name: 'Passwort ändern' });
        }
    }

    async login(username, password, url){
        await this.page.goto(url);
        await this.button_cookieOK.click();
        await this.button_openLoginPage.click();
        //await this.button_cookieOK.click();
        await this.input_username.click();
        await this.input_username.fill(username);
        await this.input_password.click();
        await this.input_password.fill(password);
        await this.button_login.click();
    }

    async loginPortal(username, password, url){
        await this.page.goto(url);
        await this.button_cookieOK.click();
        await this.button_openLoginPage.click();
        await this.button_cookieOK.click();
        await this.input_username.click();
        await this.input_username.fill(username);
        await this.input_password.click();
        await this.input_password.fill(password);
        await this.button_login.click();
    }

    async loginAndereURL(username, password, url){
        await this.page.goto(url);
        await this.button_cookieOK.click();
        await this.button_cookieOK.click();
        await this.input_username.click();
        await this.input_username.fill(username);
        await this.input_password.click();
        await this.input_password.fill(password);
        await this.button_login.click();
    }

    async login_sameSessionMitAndererURL(username, password, url){
        await this.page.goto(url);
        await this.input_username.click();
        await this.input_username.fill(username);
        await this.input_password.click();
        await this.input_password.fill(password);
        await this.button_login.click();
    }

    async login_sameSession(username, password){
        await this.button_openLoginPage.click();
        await this.input_username.click();
        await this.input_username.fill(username);
        await this.input_password.click();
        await this.input_password.fill(password);
        await this.button_login.click();
    }

    async checkPWErforderlich(){
        await expect(this.text_PasswortAbgelaufen).toBeVisible();
    }

    async passwortAendern(passwortNeu){
        await this.input_neuesPasswort.click();
        await this.input_neuesPasswort.fill(passwortNeu);
        await this.input_neuesPasswortWiederholen.click();
        await this.input_neuesPasswortWiederholen.fill(passwortNeu);
        await this.button_passwortAendern.click();
    }
}