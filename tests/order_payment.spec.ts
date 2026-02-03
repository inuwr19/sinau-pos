// tests/order_payment.spec.ts
import { test, expect } from '@playwright/test';

test('order and pay with midtrans va', async ({ page, context }) => {
    test.setTimeout(120000); // Increase to 2 minutes
    // --- Debug helpers (optional) ---
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    page.on('dialog', dialog => {
        console.log('PAGE ALERT:', dialog.message());
        dialog.dismiss();
    });
    page.on('request', request => {
        if (request.url().includes('/api/')) console.log('>> API REQ:', request.method(), request.url());
    });
    page.on('response', response => {
        if (response.url().includes('/api/')) console.log('<< API RES:', response.status(), response.url());
    });
    page.on('requestfailed', request => {
        console.log('PAGE REQUEST FAILED:', request.url(), request.failure()?.errorText);
    });

    // 1) Login
    console.log('Step 1: Logging in...');
    await page.goto('/login');
    await page.fill('#email', 'cashier.pusat@test.com');
    await page.fill('#password', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
    console.log('Step 1: Login success.');

    // 2) Add item to cart
    console.log('Step 2: Adding item to cart...');
    await expect(page.locator('.text-amber-600').first()).toBeVisible({ timeout: 10000 });
    await page.locator('button:has(.lucide-plus)').first().click();
    console.log('Step 2: Item added.');

    // 3) Checkout
    console.log('Step 3: Clicking Checkout...');
    await page.getByText('Bayar Sekarang', { exact: true }).click();
    console.log('Step 3: Checkout modal opened.');

    // 4) Select VA Bank
    console.log('Step 4: Selecting VA Bank...');
    await page.getByText('VA Bank', { exact: true }).click();

    console.log('Step 4: Checking Konfirmasi Pembayaran button...');
    const confirmButton = page.getByRole('button', { name: 'Konfirmasi Pembayaran' });
    await expect(confirmButton).toBeVisible();
    await expect(confirmButton).toBeEnabled();

    console.log('Step 4: Clicking Konfirmasi Pembayaran...');
    await confirmButton.click();
    console.log('Step 4: Clicked. Now waiting for iframe...');

    // 5) Wait Snap iframe
    console.log('Step 5: Waiting for Midtrans Snap iframe...');

    // optional debug: list iframes that appear
    for (let i = 0; i < 5; i++) {
        const iframes = await page.evaluate(() =>
            Array.from(document.querySelectorAll('iframe')).map(f => (f as HTMLIFrameElement).src),
        );
        console.log(`Attempt ${i + 1}: Iframes on page:`, iframes);
        if (iframes.some(src => src.includes('midtrans'))) break;
        await page.waitForTimeout(2000);
    }

    const iframeSelector = 'iframe[src*="midtrans"], iframe#snap-midtrans';
    const iframeElement = page.locator(iframeSelector);
    await expect(iframeElement).toBeVisible({ timeout: 30000 });

    const snapFrame = page.frameLocator(iframeSelector);

    // 5b) Optional navigation in Snap
    console.log('Iframe visible, checking Snap content...');
    const snapBodyText = await snapFrame.locator('body').innerText();
    console.log('Snap Initial Content (Start):', snapBodyText.substring(0, 200).replace(/\n/g, ' '));

    try {
        // Try to click Bank Transfer
        const bankTransfer = snapFrame.getByText(/Bank Transfer/i).or(snapFrame.getByText(/ATM/i));
        if (await bankTransfer.isVisible({ timeout: 5000 })) {
            console.log('Clicking Bank Transfer...');
            await bankTransfer.click();
            await page.waitForTimeout(1000);
        }

        // Try to click BCA
        const bcaButton = snapFrame.getByText('BCA', { exact: true }).or(snapFrame.getByText(/BCA/i));
        if (await bcaButton.isVisible({ timeout: 5000 })) {
            console.log('Clicking BCA Bank...');
            await bcaButton.click();
            await page.waitForTimeout(1000);
        }
    } catch (e: any) {
        console.log('Snap navigation skipped/failed:', e?.message ?? e);
    }

    // 5c) Wait for VA number rendering and extraction
    console.log('Step 5: Waiting for VA Number display and extraction...');

    let vaNumber = '';
    let attempt = 0;
    await expect(async () => {
        attempt++;
        const text = await snapFrame.locator('body').innerText();
        console.log(`Extraction Attempt ${attempt}: Text length: ${text.length}. Content start: ${text.substring(0, 50).replace(/\n/g, ' ')}...`);

        // Ambil kandidat digit panjang
        const candidates = text.match(/[\d\s-]{10,}/g) ?? [];
        vaNumber = '';
        for (const c of candidates) {
            const clean = c.replace(/\D/g, '');
            if (clean.length >= 10) {
                vaNumber = clean;
                break;
            }
        }

        if (!vaNumber) {
            console.log(`Attempt ${attempt}: VA not found yet. Candidates match count: ${candidates.length}`);
        }

        expect(vaNumber, 'VA still not available (Snap likely still loading)').not.toBe('');
    }).toPass({ timeout: 90000, intervals: [2000, 5000] });

    console.log('Extracted VA Number:', vaNumber);

    // 6) Simulate payment (Midtrans BCA VA simulator)
    console.log('Step 6: Opening Midtrans Simulator...');
    const simPage = await context.newPage();
    await simPage.goto('https://simulator.sandbox.midtrans.com/bca/va/index', { waitUntil: 'domcontentloaded' });

    console.log('Step 6: Filling VA and inquiring...');
    await simPage.fill('#inputMerchantId', vaNumber);
    await simPage.click('input[type="submit"][value="Inquire"]');

    console.log('Step 6: Confirming payment in simulator...');
    await expect(simPage).toHaveURL(/.*\/inquiry/);
    await simPage.click('input[type="submit"][value="Pay"]');

    // Wait for success in simulator (it might show a success text or redirect)
    await expect(simPage.getByText(/Success/i).or(simPage.getByText(/Berhasil/i))).toBeVisible({ timeout: 15000 });
    console.log('Step 6: Payment simulated successfully.');
    await simPage.close();

    // 7) Handle Snap status check
    console.log('Step 7: Checking status in Snap iframe...');
    const checkStatusButton = snapFrame.getByRole('button', { name: /Check status/i });
    if (await checkStatusButton.isVisible({ timeout: 10000 })) {
        await checkStatusButton.click();
        console.log('Step 7: Check status clicked.');
    }

    // Sometimes a "Done" or "OK" button appears in Snap after payment success
    const okButton = snapFrame.getByRole('button', { name: /OK/i }).or(snapFrame.getByText(/Done/i));
    if (await okButton.isVisible({ timeout: 10000 })) {
        await okButton.click();
        console.log('Step 7: OK/Done clicked in Snap.');
    }

    // 8) Verify Success on POS
    console.log('Step 8: Verifying success on POS...');
    await expect(page.getByText('Pembayaran Berhasil')).toBeVisible({ timeout: 30000 });
    console.log('Test PASSED!');
});
