# Database Migration: Make Actual Times Nullable

## Why This Migration?

To support scheduled shifts (future shifts), we need to make `actual_start` and `actual_end` nullable. Scheduled shifts will have `scheduled_start` and `scheduled_end` filled in, but `actual_start` and `actual_end` will be `null` until the shift is actually worked.

## Migration Steps

1. **Open Supabase SQL Editor**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor

2. **Run the Migration**
   ```sql
   -- Make actual_start and actual_end nullable for scheduled shifts
   ALTER TABLE shifts 
     ALTER COLUMN actual_start DROP NOT NULL,
     ALTER COLUMN actual_end DROP NOT NULL;
   ```

3. **Verify the Migration**
   ```sql
   -- Check the table structure
   SELECT column_name, is_nullable, data_type
   FROM information_schema.columns
   WHERE table_name = 'shifts'
   AND column_name IN ('actual_start', 'actual_end', 'scheduled_start', 'scheduled_end');
   ```

   You should see:
   - `actual_start`: `is_nullable = YES`
   - `actual_end`: `is_nullable = YES`
   - `scheduled_start`: `is_nullable = YES`
   - `scheduled_end`: `is_nullable = YES`

## What This Enables

- **Future Shifts**: Can be saved as scheduled (with `scheduled_start`/`scheduled_end` but `actual_start`/`actual_end` = null)
- **Past/Today Shifts**: Saved with both scheduled and actual times
- **Pay Calculations**: Only actual shifts (with `actual_start` and `actual_end`) count toward pay

## Notes

- Existing shifts will continue to work (they already have `actual_start` and `actual_end`)
- The app will automatically handle both scheduled and actual shifts
- Pay calculations filter out scheduled shifts automatically

