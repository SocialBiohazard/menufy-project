import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultCopyright,
  generatedMapsUrl,
  isRestaurantOpen,
  normalizeFooterVisibility,
  normalizeWeeklyHours,
} from "../lib/restaurant-footer";

test("footer visibility defaults to visible and preserves explicit hiding", () => {
  const visibility = normalizeFooterVisibility({ phone: false, instagram: true });
  assert.equal(visibility.phone, false);
  assert.equal(visibility.instagram, true);
  assert.equal(visibility.email, true);
});

test("weekly hours normalize every weekday in display order", () => {
  const hours = normalizeWeeklyHours({
    timezone: "Europe/Istanbul",
    schedule: [{ day: 1, closed: false, allDay: false, periods: [{ start: "09:00", end: "18:00" }] }],
  });
  assert.deepEqual(hours.schedule.map((day) => day.day), [1, 2, 3, 4, 5, 6, 0]);
  assert.equal(hours.schedule[0].closed, false);
  assert.equal(hours.schedule[1].closed, true);
});

test("open status handles same-day and overnight periods", () => {
  const regular = normalizeWeeklyHours({
    timezone: "UTC",
    schedule: [{ day: 1, closed: false, allDay: false, periods: [{ start: "09:00", end: "18:00" }] }],
  }, "UTC");
  assert.equal(isRestaurantOpen(regular, new Date("2026-08-10T12:00:00Z")), true);
  assert.equal(isRestaurantOpen(regular, new Date("2026-08-10T20:00:00Z")), false);

  const overnight = normalizeWeeklyHours({
    timezone: "UTC",
    schedule: [{ day: 1, closed: false, allDay: false, periods: [{ start: "18:00", end: "02:00" }] }],
  }, "UTC");
  assert.equal(isRestaurantOpen(overnight, new Date("2026-08-11T01:00:00Z")), true);
});

test("map and copyright defaults are deterministic", () => {
  assert.equal(
    generatedMapsUrl("İnci Restaurant, İstanbul"),
    "https://www.google.com/maps/search/?api=1&query=%C4%B0nci%20Restaurant%2C%20%C4%B0stanbul",
  );
  assert.equal(defaultCopyright("İnci", 2026), "© 2026 İnci.");
});
