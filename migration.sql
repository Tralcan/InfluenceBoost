-- 1. Crear la tabla de influencers (si no existe, con el nuevo esquema)
CREATE TABLE IF NOT EXISTS public.influencers (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name character varying NOT NULL,
    email character varying NOT NULL UNIQUE,
    instagram_handle character varying,
    tiktok_handle character varying,
    x_handle character varying,
    other_social_media character varying,
    points integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Habilitar RLS para la tabla de influencers
ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;

-- 2. Crear la tabla de campañas (si no existe, con el esquema correcto)
CREATE TABLE IF NOT EXISTS public.campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    company_id character varying DEFAULT '1'::character varying NOT NULL,
    name character varying NOT NULL,
    description text NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    discount character varying NOT NULL,
    max_influencers integer,
    image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Habilitar RLS para la tabla de campañas
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- 3. Crear la nueva tabla de unión: campaign_influencers
CREATE TABLE IF NOT EXISTS public.campaign_influencers (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    influencer_id uuid NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,
    generated_code character varying NOT NULL UNIQUE,
    uses integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Habilitar RLS para la tabla de unión
ALTER TABLE public.campaign_influencers ENABLE ROW LEVEL SECURITY;

-- Crear un índice para búsquedas rápidas por código
CREATE INDEX IF NOT EXISTS idx_campaign_influencers_generated_code ON public.campaign_influencers(generated_code);

-- 4. Definir Políticas de Seguridad (RLS)

-- Los usuarios pueden ver todas las campañas, influencers y participaciones (son datos públicos para la app)
DROP POLICY IF EXISTS "Allow public read access" ON public.campaigns;
CREATE POLICY "Allow public read access" ON public.campaigns FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON public.influencers;
CREATE POLICY "Allow public read access" ON public.influencers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON public.campaign_influencers;
CREATE POLICY "Allow public read access" ON public.campaign_influencers FOR SELECT USING (true);

-- Permitir la creación de nuevas campañas (asumiendo que se hace desde un entorno de confianza)
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.campaigns;
CREATE POLICY "Allow insert for authenticated users" ON public.campaigns FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow insert for anon users" ON public.campaigns FOR INSERT TO anon WITH CHECK (true);

-- Permitir la actualización y eliminación de campañas
DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.campaigns;
CREATE POLICY "Allow update for authenticated users" ON public.campaigns FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow update for anon users" ON public.campaigns FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete for authenticated users" ON public.campaigns;
CREATE POLICY "Allow delete for authenticated users" ON public.campaigns FOR DELETE TO authenticated USING (true);
CREATE POLICY "Allow delete for anon users" ON public.campaigns FOR DELETE TO anon USING (true);

-- Permitir la creación de influencers y participaciones
DROP POLICY IF EXISTS "Allow insert for anyone" ON public.influencers;
CREATE POLICY "Allow insert for anyone" ON public.influencers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for anyone" ON public.campaign_influencers;
CREATE POLICY "Allow insert for anyone" ON public.campaign_influencers FOR INSERT WITH CHECK (true);


-- 5. Crear la función RPC para incrementar usos y puntos
CREATE OR REPLACE FUNCTION public.increment_usage_and_points(p_participant_id uuid, p_influencer_id uuid, p_points_to_add integer)
RETURNS "public"."campaign_influencers"
LANGUAGE "plpgsql"
SECURITY DEFINER
AS $$
DECLARE
  updated_participant public.campaign_influencers;
BEGIN
  -- Incrementar los usos en la tabla de participación
  UPDATE public.campaign_influencers
  SET uses = uses + 1
  WHERE id = p_participant_id
  RETURNING * INTO updated_participant;

  -- Incrementar los puntos en la tabla de influencers
  UPDATE public.influencers
  SET points = points + p_points_to_add
  WHERE id = p_influencer_id;

  -- Devolver el registro de participación actualizado
  RETURN updated_participant;
END;
$$;

-- Otorgar permiso al rol anónimo (el que usa la app) para ejecutar la función
GRANT EXECUTE ON FUNCTION public.increment_usage_and_points(uuid, uuid, integer) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_usage_and_points(uuid, uuid, integer) TO authenticated;
