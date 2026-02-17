import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/The Co-Builder/);
});

test("login page loads", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator("h1, h2")).toContainText(/login/i);
});
