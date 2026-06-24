# Done Migrations

*Completed database migrations*

---

## 2026-01-24: Product Builder Module

Applied migrations:
1. **product_builder_snapshots** - Stores product builder progress with deep ICP/Pain/TP, landing content, blueprint, CTA config, and resonance ratings
2. **marketplace_products** - Published products with slug, title, landing HTML, and live status
3. **RLS policies** - Users can manage their own snapshots; anyone can view live products
4. **Indexes** - Added performance indexes for user_id, slug, and is_live
5. **update_product_builder_updated_at()** - Function with SECURITY DEFINER for auto-updating timestamps

---

## 2026-01-23: Missions Table & Game Profiles Update

Applied migrations:
1. **Missions table** - Personal mission statements with RLS policies
2. **game_profiles.mission_id** - Added foreign key reference to missions table

Note: `connections` table migration was skipped as it already exists with a different schema.
