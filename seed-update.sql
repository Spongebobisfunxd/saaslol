-- ============================================================================
-- Kawiarnia Rozmowa - Realistic Seed Data Update
-- Tenant: c06d9088-e3f8-463c-b7ab-7c1013d9d03a
-- Generated for Polish coffee shop loyalty program demo
-- ============================================================================

BEGIN;

-- --------------------------------------------------------------------------
-- 1. Analytics Daily - DELETE old data and INSERT realistic 30-day patterns
--    Location 1 (da472c1b) = Main location (~60% traffic)
--    Location 2 (9976c853) = Secondary (~25% traffic)
--    Location 3 (e41a41ec) = Smallest (~15% traffic)
--    Weekdays: 15-40 tx/loc, Weekends: 25-60 tx/loc
--    Avg transaction: 15-35 PLN (1500-3500 grosze)
--    Growth trend: ~10-15% increase over the month
-- --------------------------------------------------------------------------

DELETE FROM analytics_daily
WHERE tenant_id = 'c06d9088-e3f8-463c-b7ab-7c1013d9d03a';

INSERT INTO analytics_daily
  (tenant_id, location_id, date, new_customers, active_customers, transactions_count, revenue, points_earned, points_burned, rewards_redeemed, stamps_added)
VALUES
  -- 2026-01-05 (Monday) - week 1 start
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-01-05', 1, 18, 22, 46200, 462, 80, 2, 15),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-01-05', 0, 7, 9, 18900, 189, 30, 1, 6),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-01-05', 0, 5, 6, 13200, 132, 20, 0, 4),

  -- 2026-01-06 (Tuesday)
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-01-06', 0, 19, 24, 52800, 528, 90, 3, 16),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-01-06', 1, 8, 10, 21500, 215, 40, 1, 7),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-01-06', 0, 4, 5, 11500, 115, 15, 0, 3),

  -- 2026-01-07 (Wednesday)
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-01-07', 0, 20, 26, 54600, 546, 100, 2, 18),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-01-07', 0, 8, 11, 23100, 231, 45, 1, 7),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-01-07', 1, 5, 6, 14400, 144, 20, 0, 4),

  -- 2026-01-08 (Thursday)
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-01-08', 1, 18, 23, 50600, 506, 85, 2, 15),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-01-08', 0, 7, 10, 20000, 200, 35, 1, 6),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-01-08', 0, 4, 5, 11000, 110, 10, 0, 3),

  -- 2026-01-09 (Friday)
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-01-09', 0, 22, 28, 64400, 644, 120, 3, 19),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-01-09', 0, 9, 12, 27600, 276, 50, 1, 8),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-01-09', 0, 5, 7, 16100, 161, 25, 1, 5),

  -- 2026-01-10 (Saturday) - weekend bump
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-01-10', 2, 28, 38, 83600, 836, 150, 4, 26),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-01-10', 0, 12, 16, 35200, 352, 60, 2, 11),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-01-10', 1, 7, 9, 20700, 207, 35, 1, 6),

  -- 2026-01-11 (Sunday) - weekend
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-01-11', 0, 26, 35, 73500, 735, 130, 3, 24),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-01-11', 1, 10, 14, 30800, 308, 55, 2, 9),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-01-11', 0, 6, 8, 18400, 184, 30, 1, 5),

  -- 2026-01-12 (Monday) - week 2
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-01-12', 0, 18, 23, 50600, 506, 90, 2, 15),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-01-12', 0, 7, 10, 21000, 210, 35, 1, 7),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-01-12', 0, 5, 6, 13800, 138, 20, 0, 4),

  -- 2026-01-13 (Tuesday)
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-01-13', 1, 20, 25, 55000, 550, 95, 2, 17),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-01-13', 0, 8, 11, 24200, 242, 40, 1, 7),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-01-13', 0, 5, 6, 13800, 138, 20, 0, 4),

  -- 2026-01-14 (Wednesday)
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-01-14', 0, 21, 27, 59400, 594, 110, 3, 18),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-01-14', 1, 8, 11, 25300, 253, 45, 1, 7),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-01-14', 0, 5, 7, 15400, 154, 25, 1, 5),

  -- 2026-01-15 (Thursday) - Zimowa promocja day, slight bump
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-01-15', 2, 25, 32, 67200, 672, 140, 4, 22),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-01-15', 1, 10, 14, 30800, 308, 55, 2, 9),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-01-15', 0, 6, 8, 17600, 176, 30, 1, 5),

  -- 2026-01-16 (Friday) - post-campaign momentum
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-01-16', 1, 23, 30, 66000, 660, 125, 3, 20),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-01-16', 0, 9, 13, 28600, 286, 50, 1, 9),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-01-16', 0, 5, 7, 16100, 161, 25, 1, 5),

  -- 2026-01-17 (Saturday) - weekend
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-01-17', 1, 30, 40, 88000, 880, 160, 5, 27),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-01-17', 1, 13, 17, 37400, 374, 65, 2, 12),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-01-17', 0, 7, 10, 22000, 220, 40, 1, 7),

  -- 2026-01-18 (Sunday) - weekend
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-01-18', 0, 27, 36, 79200, 792, 145, 4, 24),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-01-18', 0, 11, 15, 33000, 330, 60, 2, 10),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-01-18', 1, 7, 9, 19800, 198, 35, 1, 6),

  -- 2026-01-19 (Monday) - week 3
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-01-19', 0, 19, 25, 55000, 550, 95, 2, 17),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-01-19', 1, 8, 11, 23100, 231, 40, 1, 7),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-01-19', 0, 5, 6, 13800, 138, 20, 0, 4),

  -- 2026-01-20 (Tuesday)
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-01-20', 1, 20, 26, 57200, 572, 100, 3, 17),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-01-20', 0, 8, 11, 24200, 242, 45, 1, 7),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-01-20', 0, 5, 7, 15400, 154, 25, 1, 5),

  -- 2026-01-21 (Wednesday)
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-01-21', 0, 21, 28, 61600, 616, 110, 3, 19),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-01-21', 0, 9, 12, 26400, 264, 45, 1, 8),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-01-21', 0, 5, 7, 16100, 161, 25, 1, 5),

  -- 2026-01-22 (Thursday)
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-01-22', 0, 20, 26, 57200, 572, 100, 2, 17),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-01-22', 0, 8, 11, 24200, 242, 40, 1, 7),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-01-22', 1, 5, 7, 14700, 147, 25, 1, 5),

  -- 2026-01-23 (Friday)
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-01-23', 1, 24, 31, 68200, 682, 130, 3, 21),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-01-23', 0, 10, 13, 29900, 299, 55, 2, 9),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-01-23', 0, 6, 8, 17600, 176, 30, 1, 5),

  -- 2026-01-24 (Saturday) - weekend
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-01-24', 2, 32, 42, 92400, 924, 170, 5, 29),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-01-24', 0, 13, 18, 39600, 396, 70, 2, 12),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-01-24', 1, 8, 10, 23000, 230, 40, 1, 7),

  -- 2026-01-25 (Sunday) - weekend
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-01-25', 0, 28, 37, 81400, 814, 150, 4, 25),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-01-25', 1, 12, 16, 35200, 352, 60, 2, 11),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-01-25', 0, 7, 9, 20700, 207, 35, 1, 6),

  -- 2026-01-26 (Monday) - week 4, growing trend visible
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-01-26', 1, 21, 27, 59400, 594, 105, 3, 18),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-01-26', 0, 9, 12, 25200, 252, 45, 1, 8),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-01-26', 0, 5, 7, 15400, 154, 25, 1, 5),

  -- 2026-01-27 (Tuesday)
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-01-27', 0, 21, 28, 61600, 616, 110, 3, 19),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-01-27', 1, 9, 12, 26400, 264, 45, 1, 8),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-01-27', 0, 5, 7, 16100, 161, 25, 1, 5),

  -- 2026-01-28 (Wednesday)
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-01-28', 0, 22, 29, 63800, 638, 115, 3, 20),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-01-28', 0, 9, 12, 27600, 276, 50, 1, 8),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-01-28', 1, 5, 7, 16100, 161, 25, 1, 5),

  -- 2026-01-29 (Thursday)
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-01-29', 1, 21, 27, 59400, 594, 105, 2, 18),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-01-29', 0, 9, 12, 25200, 252, 45, 1, 8),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-01-29', 0, 5, 7, 15400, 154, 25, 1, 5),

  -- 2026-01-30 (Friday)
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-01-30', 0, 25, 33, 72600, 726, 135, 4, 22),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-01-30', 1, 10, 14, 30800, 308, 55, 2, 9),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-01-30', 0, 6, 8, 18400, 184, 30, 1, 5),

  -- 2026-01-31 (Saturday) - weekend, end of month bump
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-01-31', 2, 34, 45, 99000, 990, 180, 5, 30),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-01-31', 1, 14, 19, 41800, 418, 75, 2, 13),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-01-31', 0, 8, 11, 25300, 253, 45, 1, 7),

  -- 2026-02-01 (Sunday) - weekend, February starts
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-02-01', 1, 30, 40, 88000, 880, 165, 4, 27),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-02-01', 0, 12, 17, 37400, 374, 65, 2, 11),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-02-01', 0, 7, 10, 23000, 230, 40, 1, 7),

  -- 2026-02-02 (Monday)
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-02-02', 0, 22, 29, 63800, 638, 115, 3, 19),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-02-02', 1, 10, 13, 28600, 286, 50, 1, 9),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-02-02', 0, 5, 7, 16100, 161, 25, 1, 5),

  -- 2026-02-03 (Tuesday) - today, partial day
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', 'da472c1b-2c5e-4d72-b288-7f5af6ae938a', '2026-02-03', 1, 14, 18, 39600, 396, 70, 2, 12),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '9976c853-4a24-4414-bd67-9edacf8eab72', '2026-02-03', 0, 6, 8, 17600, 176, 30, 1, 5),
  ('c06d9088-e3f8-463c-b7ab-7c1013d9d03a', '4f2c28df-bc20-4e3f-a57a-f80fd883e3c3', '2026-02-03', 0, 3, 4, 9200, 92, 15, 0, 3);


-- --------------------------------------------------------------------------
-- 2. Vouchers - UPDATE to realistic Polish coffee shop voucher data
-- --------------------------------------------------------------------------

UPDATE vouchers
SET
  discount_type = 'percentage',
  discount_value = 20
WHERE tenant_id = 'c06d9088-e3f8-463c-b7ab-7c1013d9d03a'
  AND code = 'KAWA20';

UPDATE vouchers
SET
  discount_type = 'fixed',
  discount_value = 5000
WHERE tenant_id = 'c06d9088-e3f8-463c-b7ab-7c1013d9d03a'
  AND code = 'VIP50';

UPDATE vouchers
SET
  discount_type = 'percentage',
  discount_value = 15,
  expires_at = '2026-03-31T23:59:59Z'
WHERE tenant_id = 'c06d9088-e3f8-463c-b7ab-7c1013d9d03a'
  AND code = 'WIOSNA2024';

UPDATE vouchers
SET
  discount_type = 'percentage',
  discount_value = 10
WHERE tenant_id = 'c06d9088-e3f8-463c-b7ab-7c1013d9d03a'
  AND code = 'WITAJ10';

UPDATE vouchers
SET
  discount_type = 'fixed',
  discount_value = 1000
WHERE tenant_id = 'c06d9088-e3f8-463c-b7ab-7c1013d9d03a'
  AND code = 'WRACAJ';


-- --------------------------------------------------------------------------
-- 3. Gift Cards - UPDATE to realistic balances (values in grosze)
-- --------------------------------------------------------------------------

UPDATE gift_cards
SET
  initial_balance = 10000,
  current_balance = 3450
WHERE tenant_id = 'c06d9088-e3f8-463c-b7ab-7c1013d9d03a'
  AND code = 'GC-2024-001';

UPDATE gift_cards
SET
  initial_balance = 20000,
  current_balance = 12750
WHERE tenant_id = 'c06d9088-e3f8-463c-b7ab-7c1013d9d03a'
  AND code = 'GC-2024-002';

UPDATE gift_cards
SET
  initial_balance = 5000,
  current_balance = 5000
WHERE tenant_id = 'c06d9088-e3f8-463c-b7ab-7c1013d9d03a'
  AND code = 'GC-2024-003';


-- --------------------------------------------------------------------------
-- 4. Campaigns - UPDATE to realistic Polish marketing campaigns
--    Uses row numbering by created_at to identify the 3 campaigns
-- --------------------------------------------------------------------------

-- Campaign 1 (earliest created_at): Zimowa promocja
UPDATE campaigns
SET
  name = 'Zimowa promocja -20%',
  channel = 'email',
  subject = 'Rozgrzej sie z nami! -20% na wszystkie kawy',
  content = 'Szanowny Kliencie, z okazji zimy przygotowalismy dla Ciebie specjalna znizke. Odwiedz dowolna Kawiarnie Rozmowa i skorzystaj z 20% rabatu na wszystkie kawy z naszego menu. Oferta wazna do konca stycznia. Do zobaczenia!',
  status = 'completed',
  scheduled_at = '2026-01-15T09:00:00Z'
WHERE tenant_id = 'c06d9088-e3f8-463c-b7ab-7c1013d9d03a'
  AND id = (
    SELECT id FROM campaigns
    WHERE tenant_id = 'c06d9088-e3f8-463c-b7ab-7c1013d9d03a'
    ORDER BY created_at ASC
    LIMIT 1 OFFSET 0
  );

-- Campaign 2 (second by created_at): Walentynki
UPDATE campaigns
SET
  name = 'Walentynki 2x punkty',
  channel = 'sms',
  subject = 'Walentynkowe punkty!',
  content = 'Kochani, w dniach 14-16 lutego zbierajcie podwojne punkty lojalnosciowe w kazdej Kawiarni Rozmowa! Przyjdzcie z druga polowka i cieszcie sie razem wyjatkowa kawa. Czekamy na Was!',
  status = 'scheduled',
  scheduled_at = '2026-02-14T08:00:00Z'
WHERE tenant_id = 'c06d9088-e3f8-463c-b7ab-7c1013d9d03a'
  AND id = (
    SELECT id FROM campaigns
    WHERE tenant_id = 'c06d9088-e3f8-463c-b7ab-7c1013d9d03a'
    ORDER BY created_at ASC
    LIMIT 1 OFFSET 1
  );

-- Campaign 3 (third by created_at): Program polecen
UPDATE campaigns
SET
  name = 'Program polecen',
  channel = 'push',
  subject = 'Polec nas znajomym!',
  content = 'Polec Kawiarnie Rozmowa znajomym i otrzymaj 500 punktow lojalnosciowych za kazde udane polecenie! Twoj znajomy rowniez otrzyma 200 punktow na start. Im wiecej polecen, tym wiecej nagrod!',
  status = 'draft',
  scheduled_at = NULL
WHERE tenant_id = 'c06d9088-e3f8-463c-b7ab-7c1013d9d03a'
  AND id = (
    SELECT id FROM campaigns
    WHERE tenant_id = 'c06d9088-e3f8-463c-b7ab-7c1013d9d03a'
    ORDER BY created_at ASC
    LIMIT 1 OFFSET 2
  );

COMMIT;
