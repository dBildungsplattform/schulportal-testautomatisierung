import { expect, test } from '@playwright/test';
import { LONG, SHORT, STAGE } from '../base/tags';
import { TestHelperLdap } from '../base/testHelperLdap';
import { Entry } from 'ldapts';

const PW: string | undefined = process.env.PW;
const ADMIN: string | undefined = process.env.USER;
const LDAP_URL: string = process.env.LDAP_URL;
const LDAP_ADMIN_PASSWORD: string = process.env.LDAP_ADMIN_PASSWORD;


test.describe(`Testfaelle für LDAP: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {

  test.beforeEach(async ({ page }) => {
    await test.step(`BeforeEach`, async () => {
      //nothing to do here, no data will be created
    });
  });

  test.afterEach(async ({ page }) => {
    await test.step(`AfterEach`, async () => {
      //nothing to do here, no data will be deleted
    });
  });

  test(
    'TestHelperLdap testen',
    { tag: [LONG, SHORT, STAGE] }, async ({ page }) => {

      const testHelperLdap: TestHelperLdap = new TestHelperLdap(LDAP_URL, LDAP_ADMIN_PASSWORD);
      await testHelperLdap.bind();

      await test.step(`Test-step`, async () => {
        const userExist: boolean = await testHelperLdap.validateUserExists('pmeierus');
        expect(userExist).toBeTruthy();

        const ouExist: boolean = await testHelperLdap.validateOuExists('0702948');
        expect(ouExist).toBeTruthy();

        const groupExist: boolean = await testHelperLdap.validateOuRoleExists('0702948');
        expect(groupExist).toBeTruthy();

        const groupOfNamesExist: boolean = await testHelperLdap.validateGroupOfNamesExists('0702948');
        expect(groupOfNamesExist).toBeTruthy();

        const isUserInGroup: boolean = await testHelperLdap.validateUserIsInGroupOfNames('pmeierus','0702948');
        expect(isUserInGroup).toBeTruthy();
      });

    }
  );

});