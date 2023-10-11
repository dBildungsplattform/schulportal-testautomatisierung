const { expect } = require("@playwright/test");

exports.LoginPage = class LoginPage{

    constructor(page){
        this.page = page;  
        this.button_openLoginPage = page.getByRole('link', { name: 'Anmelden Gleicher Tab' });
        this.input_username = page.locator("[id='umcLoginUsername']");
        this.input_password = page.locator("#umcLoginPassword");
        this.button_login = page.getByRole('button', { name: 'Anmelden' });  
    }

    async login(username, password, url){
        await this.page.goto(url);
        await this.button_openLoginPage.click();
        await this.input_username.click();
        await this.input_username.fill(username);
        await this.input_password.click();
        await this.input_password.fill(password);
        await this.button_login.click();
    }
}