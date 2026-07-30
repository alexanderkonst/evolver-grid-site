alter table public.transition_quiz_results
  add column if not exists recognition_delta smallint
    check (recognition_delta is null or (recognition_delta >= 1 and recognition_delta <= 5));

comment on column public.transition_quiz_results.recognition_delta is
  'Quiz v2.1 Recognition Delta widget — self-reported accuracy of the result, 1 (Not really) to 5 (Uncannily). Null until answered; set via an UPDATE keyed by id, not part of the original insert.';