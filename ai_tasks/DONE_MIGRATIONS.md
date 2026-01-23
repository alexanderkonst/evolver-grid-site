# Done Migrations

*Completed database migrations*

---

## 2026-01-23: Missions Table & Game Profiles Update

Applied migrations:
1. **Missions table** - Personal mission statements with RLS policies
2. **game_profiles.mission_id** - Added foreign key reference to missions table

Note: `connections` table migration was skipped as it already exists with a different schema.
