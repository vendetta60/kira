-- Sənədlərin Qeydiyyatı Sistemi
-- 
-- 1. New Tables
--    - documents table with all fields for document registration
-- 
-- 2. Security
--    - Enable RLS on documents table
--    - Add policies for authenticated users to manage documents

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rutbe text DEFAULT '',
  soyad_ad_ata text DEFAULT '',
  unvan_sahibi text DEFAULT '',
  harbi_rutbe text DEFAULT '',
  odelik text DEFAULT '',
  protokol_no text DEFAULT '',
  protokol_tarixi date,
  il text DEFAULT '',
  ay text DEFAULT '',
  calismayan_senedler text DEFAULT 'Seçilməyib',
  report_senedlerin_ucot_no text DEFAULT '',
  report_senedlerin_ucot_tarixi date,
  report_senedlerin_tarixi date,
  report_senedlerin_ucot_no2 text DEFAULT '',
  kiraya_muqavilesi_tarixi date,
  kiraya_muqavilesi_bitme_tarixi date,
  daginmaz_emlak_arayisi date,
  daginmaz_emlak_arayisi_avadl date,
  nigah_haqqinda_sehadename date,
  menzil_attestati date,
  qrafeden_18ci_cixarig date,
  sexsiyyet_vezigesinin_surati date,
  sexsiyyet_vezigesinin_surati_avadl date,
  menzil_atestati date,
  belediyye_arayisi date,
  ipoteka_kredit_zemaneti date,
  protokol_nomresi text DEFAULT '',
  protokol_tarixi_2 date,
  kiraya_anirlarin_nomresi text DEFAULT '',
  kiraya_anirlarin_tarixi date,
  senedler_qebul_eden_tarixi date,
  huquqi_raportlar boolean DEFAULT false,
  husayyet_mektublar boolean DEFAULT false,
  kiraya_muqavilesi boolean DEFAULT false,
  menzil_attestat boolean DEFAULT false,
  belediyye_arayislari boolean DEFAULT false,
  ipoteka_kredit boolean DEFAULT false,
  protokol boolean DEFAULT false,
  kiraya_aniri boolean DEFAULT false,
  senedleri_qebul_eden text DEFAULT '',
  senedleri_qebul_tarixi date,
  eli_vaziyyet text DEFAULT 'Ev',
  qeyd text DEFAULT '',
  daginmaz_emlak_arayisi_check boolean DEFAULT false,
  daginmaz_emlak_arayisi_avadl_check boolean DEFAULT false,
  nigah_haqqinda_sehadename_check boolean DEFAULT false,
  qrafeden_18ci_cixarig_check boolean DEFAULT false,
  sexsiyyet_vezigesinin_surati_check boolean DEFAULT false,
  sexsiyyet_vezigesinin_surati_avadl_check boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view documents"
  ON documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete documents"
  ON documents FOR DELETE
  TO authenticated
  USING (true);