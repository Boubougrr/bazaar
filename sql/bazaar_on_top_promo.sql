-- Nouveau code promo "bazaar_on_top" : -20% sur tous les articles payants
-- (boutique, tools payants, abonnements), même mécanisme que les codes
-- promo existants (table promo_codes + fonction increment_promo_code_usage).
-- À exécuter dans le SQL editor de Supabase.

insert into promo_codes (code, type, discount_percent, is_active)
select 'BAZAAR_ON_TOP', 'discount', 20, true
where not exists (select 1 from promo_codes where code = 'BAZAAR_ON_TOP');

-- Notes :
--  - is_active = true : le code est utilisable immédiatement.
--  - expires_at / starts_at / max_uses restent NULL : pas de date d'expiration,
--    pas de date de début, pas de limite de nombre d'utilisations totales.
--    Ajoutez par ex. `max_uses = 100` ou `expires_at = now() + interval '30 days'`
--    dans le VALUES ci-dessus si vous voulez une limite.
--  - Chaque utilisateur ne peut utiliser ce code qu'une seule fois (vérifié
--    via users.used_codes, comme pour tous les autres codes du site).
