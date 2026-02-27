import { test, expect } from '@playwright/test';
import xlsx from 'xlsx';

const workbook = xlsx.readFile('./tests/Data/ACEXPAllState.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet);

test('Excel data based automation', async ({ page }) => {

  // 🔥 GLOBAL SAFETY TIMEOUTS
  page.setDefaultTimeout(20000);              // 20 sec per action
  page.setDefaultNavigationTimeout(30000);    // 30 sec per navigation

  await page.goto('https://www.landydev.com/#/auth/login');
  await page.getByRole('textbox', { name: 'Email' }).fill('velmurugan@stepladdersolutions.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('Test@123');
  await page.getByRole('button', { name: 'Login' }).click();

  for (let i = 0; i < data.length; i++) {

    const row = data[i];
    console.log(`Starting row ${i + 1}`);

    try {

      await Promise.race([

        // ============================
        // 🔵 YOUR FULL ROW EXECUTION
        // ============================
        (async () => {

          await page.goto('https://www.landydev.com/#/pages/riskPolicySearch');

          await page.getByRole('button', { name: '   New Application' }).click();
          await page.getByLabel('State').selectOption(row.State);
          await page.locator('#state').nth(1).selectOption(row.Lob);

          const producer = page.getByRole('textbox', { name: 'Pick a producer' });
          await producer.fill('hhl');
          await page.getByText('HHL01-A, Herbert H. Landy').click();

          await page.getByRole('textbox', { name: 'Search Firm Name' }).fill(row.FirmName);

          const locationAL = page.getByRole('textbox', { name: 'Sizing example input' }).first();
          await locationAL.fill(row.Location);
          await page.keyboard.press('ArrowDown');
          await page.keyboard.press('Enter');

          await page.locator('#effDate2').fill(new Date().toISOString().split('T')[0]);
          await page.getByLabel('Retroactive Date ---Choose an').selectOption(row.PriorCheck);
          await page.getByRole('button', { name: 'save & Close' }).click();

          await page.locator('nb-accordion-item-header')
            .filter({ hasText: 'Application Details' }).click();

          await page.locator('#totNoOfProf').fill(row.AppDetlFullTimeProfessionals);

          await page.getByRole('button', { name: 'save & Close' }).click();
          await page.getByRole('button', { name: ' Next' }).click();

          await page.locator("//tr[2]//td[9]//div[1]").click();
          await page.getByRole('button', { name: 'Proceed' }).click();

          await page.getByRole('button', { name: 'Accounting' }).click();
          await page.getByRole('link', { name: 'Payment', exact: true }).click();

          const balanceText = await page.locator("span[class='ng-star-inserted'] b").innerText();
          const balanceValue = balanceText.replace('$', '').replace(/,/g, '').trim();

          const paymentInput = page.locator('#paymentReceived3');
          await paymentInput.fill(balanceValue);
          await page.locator('#checkNumber').fill(row.Option);
          await page.locator('#autofill').click();
          await page.getByRole('button', { name: 'Save  & Issue' }).click();
          await page.getByRole('button', { name: 'Okay' }).click();

          await page.getByRole('link', { name: 'Notes' }).click();
          await page.locator('nb-accordion-item-header')
            .filter({ hasText: 'Client Information' }).click();

          const riskIdInput = page.locator("input[placeholder='Risk Id']");
          await riskIdInput.click();
          await riskIdInput.press('Control+A');
          await riskIdInput.press('Control+C');

          await page.getByRole('link', { name: 'Accounting' }).click();
          await page.getByRole('link', { name: 'Policy Queued' }).click();

          await page.locator('#globalSearch').press('Control+V');
          await page.locator('#search').first().click();
          await page.locator("//ng2-smart-table//tbody/tr[1]/td[1]//input[@type='checkbox']").check();

          await page.getByRole('button', { name: 'Issue Policy' }).click();
          await page.getByRole('button', { name: 'Yes' }).click();

          await page.screenshot({ path: `row-${i + 1}-success.png` });

        })(),

        // ⛔ HARD 3 MINUTE LIMIT
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Row exceeded 3 minutes')), 180000)
        )

      ]);

      console.log({
        row: i + 1,
        RiskId: row.RiskId,
        Status: "SUCCESS"
      });

    } catch (error) {

      console.log(`⛔ ROW ${i + 1} SKIPPED`);
      console.log(error.message);

      await page.screenshot({ path: `row-${i + 1}-error.png` });

      // 🔁 Reset before next row
      await page.goto('https://www.landydev.com/#/pages/riskPolicySearch');

      continue;
    }

    await page.waitForTimeout(2000);
  }

});