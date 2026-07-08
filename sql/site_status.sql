-- Table de statut global du site : permet au staff de désactiver la Boutique
-- et/ou l'outil de recherche OSINT depuis les Réglages, avec un message
-- visuel affiché aux visiteurs à la place. Une seule ligne (id=1).
-- À exécuter dans le SQL editor de Supabase.

create table if not exists site_status (
  id integer primary key default 1,
  shop_enabled boolean not null default true,
  osint_enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint site_status_singleton check (id = 1)
);

insert into site_status (id, shop_enabled, osint_enabled)
values (1, true, true)
on conflict (id) do nothing;
