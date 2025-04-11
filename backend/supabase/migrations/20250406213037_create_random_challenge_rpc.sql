-- Function to get one random mini_challenge for a given category

create or replace function get_random_mini_challenge(p_category_id uuid)
returns table (challenge_text text)
language sql
stable -- Indicates the function doesn't modify the database
as $$
  select challenge_text
  from mini_challenges
  where category_id = p_category_id
  order by random()
  limit 1;
$$;

-- Grant execute permission to the authenticated role
grant execute on function get_random_mini_challenge(uuid) to authenticated;