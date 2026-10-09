import asyncio
import os
from playwright.async_api import async_playwright

async def run_tests():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        console_errors = []
        page_errors = []

        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda err: page_errors.append(str(err)))

        curr_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = "file://" + os.path.join(curr_dir, "index.html")
        print(f"Loading {file_path}...")
        await page.goto(file_path, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(2000)

        print("Console errors on load:", console_errors)
        print("Page errors on load:", page_errors)
        assert len(console_errors) == 0, f"Console errors detected: {console_errors}"
        assert len(page_errors) == 0, f"Page errors detected: {page_errors}"

        # Test Module 1 Auto Fit
        print("Testing Module 1 Auto Fit...")
        btn_fit = page.locator("#m1BtnAutoFit")
        await btn_fit.click()
        await page.wait_for_timeout(800)
        rss_val = await page.locator("#m1ValRSS").inner_text()
        print(f"Module 1 RSS after auto fit: {rss_val}")
        assert rss_val != "", "RSS value should be populated"

        # Test Module 3 Gradient Descent Step
        print("Testing Module 3 Gradient Descent...")
        btn_step = page.locator("#m3BtnStep")
        await btn_step.scroll_into_view_if_needed()
        await btn_step.click()
        await page.wait_for_timeout(500)
        epoch_val = await page.locator("#m3ValEpoch").inner_text()
        cost_val = await page.locator("#m3ValCost").inner_text()
        print(f"Module 3 Epoch: {epoch_val}, Cost: {cost_val}")
        assert epoch_val != "0", "Gradient descent epoch should increment"

        # Test Module 4 Gauss Markov Scenario
        print("Testing Module 4 Scenario switch...")
        select_sc = page.locator("#m4Select")
        await select_sc.scroll_into_view_if_needed()
        await select_sc.select_option("hetero")
        await page.wait_for_timeout(500)
        diag_text = await page.locator("#m4Diag").inner_text()
        print(f"Module 4 Hetero Diagnosis: {diag_text[:60]}...")
        assert "Lejek" in diag_text or "Heteroskedastyczność" in diag_text or "wariancja" in diag_text.lower()

        # Test Module 8 Sandbox
        print("Testing Module 8 Sandbox Canvas...")
        canvas = page.locator("#sbCanvas")
        await canvas.scroll_into_view_if_needed()
        box = await canvas.bounding_box()
        if box:
            await page.mouse.click(box["x"] + 150, box["y"] + 150)
            await page.mouse.click(box["x"] + 250, box["y"] + 200)
            await page.wait_for_timeout(500)
            sb_n = await page.locator("#sbN").inner_text()
            print(f"Module 8 Point Count: {sb_n}")

        # Test Module 9 Quiz
        print("Testing Module 9 Quiz...")
        first_opt = page.locator(".quiz-opt").first
        await first_opt.scroll_into_view_if_needed()
        await first_opt.click()
        await page.wait_for_timeout(500)

        # Quality Gate: SVG Text Clipping & DOM Overflow Check
        print("Running Quality Gate: SVG Text Clipping & DOM Overflow Check...")
        clipped_svg = await page.evaluate('''() => {
            const issues = [];
            document.querySelectorAll('svg').forEach(svg => {
                const vb = svg.viewBox.baseVal;
                if (!vb || vb.width === 0) return;
                svg.querySelectorAll('text, tspan').forEach(t => {
                    const text = t.textContent.trim();
                    if (!text) return;
                    try {
                        const bbox = t.getBBox();
                        if (bbox.x < vb.x - 2 || (bbox.x + bbox.width) > (vb.x + vb.width + 2)) {
                            issues.push({ text: text, x: bbox.x, width: bbox.width, vb_x: vb.x, vb_w: vb.width });
                        }
                    } catch (e) {}
                });
            });
            return issues;
        }''')
        print(f"SVG Text clipping issues found: {len(clipped_svg)}")
        assert len(clipped_svg) == 0, f"Found clipped SVG text elements: {clipped_svg}"

        # Multi-viewport responsive tests
        viewports = [
            ("Desktop 1440px", {"width": 1440, "height": 900}),
            ("Tablet 768px", {"width": 768, "height": 1024}),
            ("Mobile 375px", {"width": 375, "height": 812})
        ]
        for name, vp in viewports:
            await page.set_viewport_size(vp)
            await page.wait_for_timeout(300)
            has_h_scroll = await page.evaluate('''() => {
                return document.documentElement.scrollWidth > window.innerWidth + 2;
            }''')
            print(f"Viewport {name} -> Horizontal scroll detected: {has_h_scroll}")
            assert not has_h_scroll, f"Horizontal scroll detected on {name}!"

        # Reset viewport to 1440px and capture verified screenshot
        await page.set_viewport_size({"width": 1440, "height": 900})
        screenshot_path = "Lyceum/regresja-liniowa/screenshot_verified.png"
        await page.screenshot(path=screenshot_path, full_page=True)
        print(f"Full page screenshot saved to {screenshot_path}")

        print("Wszystkie asercje testowe zakończone SUKCESEM (PASS)!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_tests())
