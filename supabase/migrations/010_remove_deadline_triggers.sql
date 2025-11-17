-- Remover triggers que referenciam campos de deadline removidos
-- Estes triggers foram criados diretamente no banco e não estão nas migrações

-- Remover triggers que referenciam delivery_deadline ou request_deadline
DO $$
DECLARE
    trigger_record RECORD;
    function_body TEXT;
BEGIN
    -- Encontrar triggers que referenciam os campos removidos
    FOR trigger_record IN
        SELECT 
            trg.tgname as trigger_name,
            tbl.relname as table_name,
            p.oid as function_oid,
            p.proname as function_name
        FROM pg_trigger trg
        JOIN pg_class tbl ON trg.tgrelid = tbl.oid
        JOIN pg_proc p ON trg.tgfoid = p.oid
        WHERE tbl.relname = 'project_requests'
          AND trg.tgname NOT LIKE 'RI_%' -- Ignorar foreign key triggers
    LOOP
        -- Obter o corpo da função para verificar se referencia deadline fields
        SELECT pg_get_functiondef(trigger_record.function_oid) INTO function_body;
        
        -- Se a função referenciar deadline fields, remover o trigger e a função
        IF function_body LIKE '%delivery_deadline%' OR function_body LIKE '%request_deadline%' THEN
            EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.project_requests', trigger_record.trigger_name);
            EXECUTE format('DROP FUNCTION IF EXISTS %I()', trigger_record.function_name);
            RAISE NOTICE 'Removed trigger % and function %', trigger_record.trigger_name, trigger_record.function_name;
        END IF;
    END LOOP;
END $$;